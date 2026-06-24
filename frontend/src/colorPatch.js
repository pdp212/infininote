/**
 * colorPatch.js — Patch tldraw's DefaultColorThemePalette at runtime
 *
 * Sử dụng hex codes CHÍNH XÁC từ người dùng:
 * Row 1: Grayscale  → #000000, #333333, #666666, #999999, #CCCCCC, #EAEAEA, #FFFFFF
 * Row 2: Red→Purple → #FF0000, #FF3366, #FF88AA, #CC00FF, #9933CC, #660099, #4B0082
 * Row 3: Teal→Navy  → #008080, #00CCCC, #66E0E0, #87CEEB, #0000FF, #00008B, #000040
 * Row 4: Green→Org  → #008000, #90EE90, #A8E040, #F5D400, #FFCC00, #FF9900, #F57830
 *
 * Mapping 28 → 13 slot tldraw:
 * black        → #000000  (Row1 Col1)
 * grey         → #999999  (Row1 Col4)
 * white        → #FFFFFF  (Row1 Col7)
 * red          → #FF0000  (Row2 Col1)
 * light-red    → #FF3366  (Row2 Col2 — hot pink)
 * light-violet → #CC00FF  (Row2 Col4 — vivid violet)
 * violet       → #660099  (Row2 Col6 — deep purple)
 * blue         → #0000FF  (Row3 Col5 — pure blue)
 * light-blue   → #00CCCC  (Row3 Col2 — teal cyan)
 * green        → #008000  (Row4 Col1 — dark green)
 * light-green  → #A8E040  (Row4 Col3 — chartreuse)
 * yellow       → #F5D400  (Row4 Col4 — yellow)
 * orange       → #F57830  (Row4 Col7 — orange)
 */
import { DefaultColorThemePalette } from '@tldraw/tlschema'

// ── Helpers ────────────────────────────────────────────────────
function hex2rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function patchColor(theme, name, solidHex) {
  if (!theme[name]) return
  theme[name].solid = solidHex
  theme[name].fill  = solidHex
  theme[name].semi  = hex2rgba(solidHex, 0.15)
  if (theme[name].pattern) theme[name].pattern = solidHex
}

// ── Light Mode ─────────────────────────────────────────────────
const L = DefaultColorThemePalette.lightMode

patchColor(L, 'black',        '#000000')   // Row 1 Col 1
patchColor(L, 'grey',         '#999999')   // Row 1 Col 4
patchColor(L, 'red',          '#FF0000')   // Row 2 Col 1 — vivid red
patchColor(L, 'light-red',    '#FF3366')   // Row 2 Col 2 — hot pink
patchColor(L, 'light-violet', '#CC00FF')   // Row 2 Col 4 — vivid violet
patchColor(L, 'violet',       '#660099')   // Row 2 Col 6 — deep purple
patchColor(L, 'blue',         '#0000FF')   // Row 3 Col 5 — pure blue
patchColor(L, 'light-blue',   '#00CCCC')   // Row 3 Col 2 — teal/cyan
patchColor(L, 'green',        '#008000')   // Row 4 Col 1 — dark green
patchColor(L, 'light-green',  '#A8E040')   // Row 4 Col 3 — chartreuse
patchColor(L, 'yellow',       '#F5D400')   // Row 4 Col 4 — yellow
patchColor(L, 'orange',       '#F57830')   // Row 4 Col 7 — orange
patchColor(L, 'white',        '#FFFFFF')   // Row 1 Col 7

// ── Dark Mode (slightly brighter for visibility on dark canvas) ─
const D = DefaultColorThemePalette.darkMode

patchColor(D, 'black',        '#E8E8E8')   // Inverted: light on dark bg
patchColor(D, 'grey',         '#AAAAAA')
patchColor(D, 'red',          '#FF4444')   // brighter red
patchColor(D, 'light-red',    '#FF5580')   // brighter hot pink
patchColor(D, 'light-violet', '#DD44FF')   // brighter violet
patchColor(D, 'violet',       '#9933CC')   // medium purple (more visible)
patchColor(D, 'blue',         '#4444FF')   // brighter blue
patchColor(D, 'light-blue',   '#22DDDD')   // brighter cyan
patchColor(D, 'green',        '#22AA22')   // brighter green
patchColor(D, 'light-green',  '#C0F060')   // lighter chartreuse
patchColor(D, 'yellow',       '#FFE000')   // brighter yellow
patchColor(D, 'orange',       '#FF9900')   // brighter orange
patchColor(D, 'white',        '#FFFFFF')
