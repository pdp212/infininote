/**
 * shapeStyleNormalizer.js
 * Central utility to sanitize Tldraw shape properties to prevent schema crashes.
 */

// Define safe prop keys based on Tldraw v2 schema.
// We strictly omit properties that cause validation crashes.
const SAFE_PROP_KEYS_BY_SHAPE = {
  text: ['text', 'font', 'size', 'color', 'textAlign', 'w', 'autoSize', 'scale'],
  note: ['text', 'font', 'size', 'color', 'align', 'url', 'growY', 'verticalAlign'],
  geo: ['text', 'font', 'size', 'color', 'align', 'geo', 'w', 'h', 'growY', 'url', 'dash', 'fill', 'verticalAlign'],
  arrow: ['text', 'font', 'size', 'color', 'dash', 'fill', 'start', 'end', 'arrowheadStart', 'arrowheadEnd', 'bend', 'isPrecise', 'isExact'],
  line: ['dash', 'color', 'spline', 'handles'],
  draw: ['dash', 'fill', 'color', 'size', 'segments', 'isComplete', 'isClosed', 'isPen'],
  image: ['w', 'h', 'playing', 'url', 'assetId', 'crop'],
  video: ['w', 'h', 'playing', 'url', 'assetId', 'time', 'isMuted'],
  bookmark: ['w', 'h', 'assetId', 'url'],
  embed: ['w', 'h', 'url'],
}

/**
 * Strips out any property that is not whitelisted for the given shape type.
 */
export function sanitizeShapePropsByType(shapeType, props) {
  if (!props) return {}
  
  const whitelist = SAFE_PROP_KEYS_BY_SHAPE[shapeType]
  // If we don't know the shape type, return props as is, or maybe we just return basic things.
  // For safety, if it's not in the whitelist, we let it pass, but for standard shapes we strictly filter.
  if (!whitelist) return { ...props }

  const cleanProps = {}
  for (const key of Object.keys(props)) {
    if (whitelist.includes(key)) {
      if (props[key] !== undefined && props[key] !== null) {
        cleanProps[key] = props[key]
      }
    } else {
      console.warn(`[SnapshotSanitizer] Removed invalid prop "${key}" from ${shapeType} shape.`)
    }
  }
  return cleanProps
}

/**
 * Returns a fully sanitized shape object. Drops invalid props.
 */
export function sanitizeShapeForTldraw(shape) {
  if (!shape || !shape.type) return shape
  
  return {
    ...shape,
    props: sanitizeShapePropsByType(shape.type, shape.props)
  }
}

/**
 * Deeply sanitizes snapshot records before hydration, import, or save.
 * Drops severely malformed shapes entirely.
 */
export function sanitizeSnapshot(snapshot) {
  if (!snapshot) return snapshot
  
  // Handle both { store: { ... } } format and direct object format
  const isWrapped = !!snapshot.store
  const recordsObj = isWrapped ? snapshot.store : snapshot
  
  const cleanRecords = {}
  
  for (const [id, record] of Object.entries(recordsObj)) {
    if (!record) continue
    
    if (record.typeName === 'shape') {
      // Basic malform check
      if (!record.type) {
        console.warn(`[SnapshotSanitizer] Dropping severely malformed shape: missing type. ID: ${id}`)
        continue
      }
      
      cleanRecords[id] = sanitizeShapeForTldraw(record)
    } else {
      // Keep non-shape records as is
      cleanRecords[id] = record
    }
  }
  
  return isWrapped ? { ...snapshot, store: cleanRecords } : cleanRecords
}
