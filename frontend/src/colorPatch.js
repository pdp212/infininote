/**
 * colorPatch.js — Patch tldraw's DefaultColorThemePalette at runtime
 *
 * Import file này TRƯỚC khi React render. Kỹ thuật này:
 * 1. Import object tham chiếu (by reference) từ tldraw
 * 2. Ghi đè trực tiếp các giá trị màu → cả picker UI VÀ shape rendering đều đổi
 *
 * Mapping: 28 màu từ ảnh người dùng → 13 slot của tldraw
 * Row 1: Grays    → black, grey, white
 * Row 2: Warm     → red, light-red (hot pink), light-violet, violet
 * Row 3: Cool     → blue, light-blue
 * Row 4: Earth    → green, light-green, yellow, orange
 */
import { DefaultColorThemePalette } from '@tldraw/tlschema'

// ── Light mode palette ──────────────────────────────────────────
const LIGHT = DefaultColorThemePalette.lightMode

LIGHT.black.solid         = '#000000'
LIGHT.black.fill          = '#000000'
LIGHT.black.semi          = 'rgba(0,0,0,0.14)'

LIGHT.grey.solid          = '#888888'
LIGHT.grey.fill           = '#888888'
LIGHT.grey.semi           = 'rgba(136,136,136,0.14)'

LIGHT.red.solid           = '#e61515'   // Row 2 vivid red
LIGHT.red.fill            = '#e61515'
LIGHT.red.semi            = 'rgba(230,21,21,0.14)'

LIGHT['light-red'].solid  = '#f555b4'   // Row 2 hot pink / magenta
LIGHT['light-red'].fill   = '#f555b4'
LIGHT['light-red'].semi   = 'rgba(245,85,180,0.14)'

LIGHT['light-violet'].solid = '#e888e8' // Row 2 orchid / lavender
LIGHT['light-violet'].fill  = '#e888e8'
LIGHT['light-violet'].semi  = 'rgba(232,136,232,0.14)'

LIGHT.violet.solid        = '#7c30f5'   // Row 2 purple
LIGHT.violet.fill         = '#7c30f5'
LIGHT.violet.semi         = 'rgba(124,48,245,0.14)'

LIGHT.blue.solid          = '#1840d4'   // Row 3 dark blue
LIGHT.blue.fill           = '#1840d4'
LIGHT.blue.semi           = 'rgba(24,64,212,0.14)'

LIGHT['light-blue'].solid = '#0ab4f8'   // Row 3 sky blue
LIGHT['light-blue'].fill  = '#0ab4f8'
LIGHT['light-blue'].semi  = 'rgba(10,180,248,0.14)'

LIGHT.green.solid         = '#28b040'   // Row 4 green
LIGHT.green.fill          = '#28b040'
LIGHT.green.semi          = 'rgba(40,176,64,0.14)'

LIGHT['light-green'].solid = '#a0e030'  // Row 4 chartreuse / lime
LIGHT['light-green'].fill  = '#a0e030'
LIGHT['light-green'].semi  = 'rgba(160,224,48,0.14)'

LIGHT.yellow.solid        = '#f5d400'   // Row 4 yellow
LIGHT.yellow.fill         = '#f5d400'
LIGHT.yellow.semi         = 'rgba(245,212,0,0.14)'

LIGHT.orange.solid        = '#f57830'   // Row 4 orange
LIGHT.orange.fill         = '#f57830'
LIGHT.orange.semi         = 'rgba(245,120,48,0.14)'

LIGHT.white.solid         = '#ffffff'
LIGHT.white.fill          = '#ffffff'
LIGHT.white.semi          = 'rgba(255,255,255,0.14)'

// ── Dark mode palette (brighter for visibility on dark canvas) ──
const DARK = DefaultColorThemePalette.darkMode

DARK.black.solid          = '#e8e8e8'   // Inverted: light on dark bg
DARK.black.fill           = '#e8e8e8'
DARK.black.semi           = 'rgba(232,232,232,0.18)'

DARK.grey.solid           = '#aaaaaa'
DARK.grey.fill            = '#aaaaaa'
DARK.grey.semi            = 'rgba(170,170,170,0.18)'

DARK.red.solid            = '#f83030'
DARK.red.fill             = '#f83030'
DARK.red.semi             = 'rgba(248,48,48,0.18)'

DARK['light-red'].solid   = '#f870c8'   // hot pink — brighter for dark
DARK['light-red'].fill    = '#f870c8'
DARK['light-red'].semi    = 'rgba(248,112,200,0.18)'

DARK['light-violet'].solid = '#f0a0f0'
DARK['light-violet'].fill  = '#f0a0f0'
DARK['light-violet'].semi  = 'rgba(240,160,240,0.18)'

DARK.violet.solid         = '#a060f8'
DARK.violet.fill          = '#a060f8'
DARK.violet.semi          = 'rgba(160,96,248,0.18)'

DARK.blue.solid           = '#4878f8'
DARK.blue.fill            = '#4878f8'
DARK.blue.semi            = 'rgba(72,120,248,0.18)'

DARK['light-blue'].solid  = '#40c8f8'
DARK['light-blue'].fill   = '#40c8f8'
DARK['light-blue'].semi   = 'rgba(64,200,248,0.18)'

DARK.green.solid          = '#40c858'
DARK.green.fill           = '#40c858'
DARK.green.semi           = 'rgba(64,200,88,0.18)'

DARK['light-green'].solid = '#b8e850'
DARK['light-green'].fill  = '#b8e850'
DARK['light-green'].semi  = 'rgba(184,232,80,0.18)'

DARK.yellow.solid         = '#f8d800'
DARK.yellow.fill          = '#f8d800'
DARK.yellow.semi          = 'rgba(248,216,0,0.18)'

DARK.orange.solid         = '#f89030'
DARK.orange.fill          = '#f89030'
DARK.orange.semi          = 'rgba(248,144,48,0.18)'

DARK.white.solid          = '#ffffff'
DARK.white.fill           = '#ffffff'
DARK.white.semi           = 'rgba(255,255,255,0.18)'
