# T-Study: Complete AI Context File

> **INSTRUCTION FOR AI AGENTS**: Read this entire file before responding to any user requests about the T-Study project. This contains all essential context you need to work effectively.

---

## 🎯 PROJECT OVERVIEW

**T-Study** is a paper-inspired Progressive Web App (PWA) for viewing and studying educational notes. Built for student Thathsarani using pure vanilla JavaScript.

### Core Purpose
Transform structured JSON study materials into a beautiful, interactive learning experience that mimics a physical notebook.

### Key Features
- **Dual Study Modes**: Exam Mode (critical content only) vs Full Mode (comprehensive)
- **Paper Aesthetic**: Ruled lines, margin, 3-hole punch design
- **Interactive Tooltips**: Hover explanations, analogies, context
- **Path Navigation**: Hierarchical topic breadcrumbs
- **Offline-First**: Service Worker caching, works without internet
- **Responsive**: Mobile and desktop optimized

### Critical Constraints
- ✅ **USE**: Vanilla JavaScript (ES6+), CSS3, HTML5, Web APIs
- ❌ **NO**: Frameworks (React/Vue/Angular), npm dependencies, build tools
- ✅ **MAINTAIN**: Paper aesthetic, dual mode support, offline capability
- ❌ **NEVER**: Break existing patterns, add complex dependencies

---

## 📁 PROJECT STRUCTURE

```
T-Study/
├── index.html              # Main app entry (paper sheet UI)
├── app.js                  # Core logic (~1560 lines)
├── styles.css              # Paper-themed styling
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline/caching)
├── server.py              # Dev server (CORS-enabled)
├── update-notes-index.py  # Auto-generates notes/index.html
├── test-local.html        # Server diagnostic tool
└── notes/
    ├── index.html         # Auto-generated library
    └── *.json             # Study note files
```

---

## 🏗️ ARCHITECTURE

### Technology Stack
- **Frontend**: Pure Vanilla JavaScript (no frameworks)
- **Styling**: CSS3 custom properties, flexbox, animations
- **Storage**: localStorage for state, Service Worker for caching
- **Rendering**: Client-side JSON parsing → DOM injection
- **Offline**: Service Worker with network-first strategy

### Data Flow
```
JSON File → loadJSON() → Filter by Mode → render() → renderBlock() → DOM
                             ↓
                    localStorage (state persistence)
```

### Key Design Patterns
1. **Mode-based filtering**: Content filtered before rendering
2. **State persistence**: localStorage for all preferences
3. **Progressive enhancement**: Core works without JS
4. **Paper-first design**: All UI mimics physical notebook

---

## 📊 JSON DATA STRUCTURE

### Complete Format
```json
{
  "title": "Course Title",
  "topic": "Specific Topic",
  "content": [
    {
      "id": 1,
      "type": "section|concept|list|formula|example|table|visual",
      "level": 1,
      "path": "Main Topic > Subtopic > Concept",
      "title": "Display Heading",
      
      "exam_text": "Concise exam-focused content",
      "full_text": "Comprehensive explanation with details",
      "key_sentence": "Most critical statement (gets highlighted)",
      
      "simple_explanation": "ELI5 version for tooltip",
      "analogy": "Real-world comparison for tooltip",
      "why_exists": "Rationale and context for tooltip",
      
      "note": "Margin annotation text",
      "exam_critical": true,
      "parent": 1,
      
      "items": ["For list type: EXAM: brief | FULL: detailed"]
    }
  ]
}
```

### Block Types
- **section**: Major headings (hierarchical levels 1-4)
- **concept**: Core definitions and ideas
- **list**: Bulleted/numbered items with dual content
- **formula**: Mathematical/technical expressions
- **example**: Practical demonstrations
- **table**: Structured comparison data
- **visual**: ASCII diagrams

### List Item Formats
```json
// Standard dual mode
"items": ["EXAM: Brief | FULL: Detailed explanation"]

// Comparison table (multiple columns)
"items": ["EXAM: Category | FULL: Col1 | Col2 | Col3"]
```

### Markdown in Text Fields
- `<mark-key>text</mark-key>` → Yellow highlight
- `**bold**` → Strong emphasis
- `*italic*` → Emphasis
- `- bullet` or `• bullet` → Unordered list
- `1. item` → Ordered list

---

## 🔧 CORE FEATURES & IMPLEMENTATION

### 1. Study Mode System (app.js:32-52)

**State**: `currentMode = "exam" | "full"`

**Behavior**:
- **Exam Mode**: Filters `content` array to show only `exam_critical === true` blocks
- **Full Mode**: Displays all blocks
- Both modes use appropriate text: `exam_text` or `full_text`
- `key_sentence` is highlighted in both modes
- Persisted to `localStorage('studyMode')`

**Code Pattern**:
```javascript
if (currentMode === "exam") {
  blocks = blocks.filter(block => block.exam_critical === true);
}
// Use exam_text vs full_text based on mode
const text = isExamMode ? block.exam_text : block.full_text;
```

### 2. Tooltip System (app.js:684-985)

**Activation**: Hover on blocks with metadata attributes
**Delays**: 300ms show, 200ms hide
**Sticky**: Stays open when hovering tooltip itself
**Positioning**: Smart viewport-aware placement

**Data Attributes**:
```html
<div data-simple="ELI5 explanation"
     data-analogy="Real-world comparison" 
     data-why="Why this exists"
     data-id="1">
```

**Tabs**: Simple | Analogy | Why
**Feature**: "Add to Notes" button for saving insights

### 3. Path Navigation (app.js:197-213)

**Format**: `"Main Topic > Subtopic > Specific Concept"`
**Display**: 
- Parent path as badge (if `showPaths` enabled)
- Current topic as heading
- Only renders once per unique topic

### 4. Rendering Pipeline (app.js:132-282)

**Main Functions**:
- `loadJSON(data)` - Line 103: Parse and process JSON
- `render()` - Line 132: Main rendering engine
- `renderBlock(block)` - Line 160: Single block HTML generation
- `renderList(block)` - Line 285: Special list/table handling

**Flow**:
1. Load JSON data
2. Filter by current mode (exam/full)
3. Build topic map for tooltips
4. Generate HTML for each block
5. Inject into `noteContent` div
6. Initialize event handlers

### 5. Library Management (app.js:1198-1371)

**Flow**:
1. Fetch `notes/index.html`
2. Parse `<a>` tags to get note files
3. Display clickable grid
4. Load selected note via `loadNoteFromPath()`
5. Store path in `localStorage('currentNotePath')`

**Updating Library**:
```bash
python3 update-notes-index.py
```

### 6. Export System (app.js:1143-1176)

**Output**: Standard Markdown format
**Includes**: Hierarchical headings, lists, formatting
**Uses**: Mode-appropriate content (exam vs full)

### 7. Confetti Celebration (app.js:1429-1525)

**Triggers**: Bottom scroll + 2min minimum read time
**Fires**: Once per session
**Resets**: On new note load

---

## 🔄 STATE MANAGEMENT

### Global Variables
```javascript
currentData        // Loaded JSON content
currentMode        // "exam" | "full"
showTooltips       // Boolean toggle
showPaths          // Boolean toggle  
notesLibrary       // Array of available notes
currentNotePath    // Active note file path
```

### localStorage Keys
- `studyMode` → User's mode preference
- `showTooltips` → Tooltip visibility
- `showPaths` → Path display state
- `currentNotePath` → Last opened note
- `noteContent_${path}` → Cached note data

### Persistence Strategy
- Preferences saved immediately on change
- Content autosaves on edit (1s debounce)
- Service Worker caches static assets
- Network-first for JSON files

---

## 🎨 UI/UX DESIGN SYSTEM

### CSS Custom Properties (styles.css)
```css
--paper-bg: #fefdfb          /* Warm off-white paper */
--ruled-line: #e3ddd4        /* Blue ruled lines */
--margin-line: #c9a57a       /* Red margin line */
--text-primary: #1a1410      /* Dark ink */
--critical-highlight: rgba(254, 243, 199, 0.15) /* Yellow */
--line-height: 2em           /* Line spacing */
--margin-width: 80px         /* Left margin size */
```

### Layout Components
1. **Top Bar** (sticky header)
   - File actions: Open, Export
   - Document info: Title/topic
   - Toggles: Tooltips, Paths
   - Mode switcher: Exam/Full buttons

2. **Paper Sheet** (main content)
   - 3-hole punch decorations (left)
   - Vertical margin line (80px from left)
   - Horizontal ruled lines (2em spacing)
   - Content area (contenteditable)

3. **Tooltip Modal**
   - Tabbed interface
   - Smart positioning
   - Sticky on hover

### Block Styling Classes
- `.exam-critical` → Has ⚡ badge, yellow tint
- `.level-1`, `.level-2`, etc. → Hierarchy styling
- `.section-block`, `.concept-block`, `.list-block` → Type-specific styles
- `.margin-note` → Small text in margin area

---

## 🎯 KEY WORKFLOWS

### Adding New Notes
1. Create `notes/newfile.json` with proper structure
2. Run `python3 update-notes-index.py`
3. Refresh app, note appears in library

### Studying Process
1. Open app → Library view
2. Select note → Loads in Full Mode
3. Read with tooltips for deeper understanding
4. Switch to Exam Mode → Test recall with critical content only
5. Scroll to bottom → Confetti celebration (if 2+ min reading)

### Local Development
```bash
# Start server (required - no file:// protocol)
python3 server.py
# Opens http://localhost:8000

# Or manual server
python3 -m http.server 8000

# Test server working
open test-local.html
```

### Cache Management
```javascript
// In browser console to force refresh
clearAppCache()
```

### Service Worker Updates
1. Edit `sw.js` and increment `CACHE_VERSION`
2. Service Worker auto-checks every 60s
3. User prompted to reload on new version

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: Notes Won't Load
**Cause**: Using file:// protocol or server not running
**Solution**: Must use HTTP server (`python3 server.py`)
**Test**: Open `test-local.html` to diagnose

### Issue: Service Worker Not Updating
**Cause**: Aggressive browser caching
**Solution**: Run `clearAppCache()` in console OR increment `CACHE_VERSION` in sw.js

### Issue: Tooltips Not Showing
**Cause**: Toggle off OR missing metadata in JSON
**Check**: 
- Tooltip checkbox in header (must be ON)
- JSON has `simple_explanation`, `analogy`, `why_exists` fields

### Issue: Changes Not Appearing
**Cause**: Service Worker cache
**Solution**: 
1. Increment `CACHE_VERSION` in sw.js
2. Hard reload (Ctrl+Shift+R)
3. Or use `clearAppCache()`

### Issue: Confetti Won't Trigger
**Cause**: Time < 2min OR not scrolled to absolute bottom
**Solution**: Read for 2+ minutes AND scroll completely to bottom

---

## 💻 CODE PATTERNS & CONVENTIONS

### Naming Conventions
- **Functions**: camelCase (`renderBlock`, `loadJSON`)
- **Constants**: UPPER_SNAKE_CASE (`CACHE_VERSION`)
- **DOM IDs**: camelCase with suffix (`fileInput`, `importBtn`)
- **CSS Classes**: kebab-case (`exam-critical`, `margin-note`)

### Function Reference (Key Locations)
| Function | Line | Purpose |
|----------|------|---------|
| `loadJSON(data)` | 103 | Process and display note |
| `render()` | 132 | Main rendering engine |
| `renderBlock(block)` | 160 | Generate single block HTML |
| `renderList(block)` | 285 | Handle list/table blocks |
| `formatText(text)` | 541 | Parse markdown |
| `parseMarkdownBullets(text)` | 567 | Convert bullets to HTML |
| `showTooltip(blockEl)` | 822 | Create hover tooltip |
| `loadNotesLibrary()` | 1198 | Fetch available notes |
| `loadNoteFromPath(path)` | 1248 | Load specific note |
| `exportMarkdown()` | 1143 | Export to .md file |
| `initConfettiOnComplete()` | 1429 | Setup celebration |

### Rendering Pattern
```javascript
// 1. Filter data based on mode
let blocks = currentMode === "exam" 
  ? data.filter(b => b.exam_critical) 
  : data;

// 2. Build HTML strings
const html = blocks.map(block => renderBlock(block)).join('');

// 3. Inject into DOM
noteContent.innerHTML = html;

// 4. Initialize handlers
initHoverTooltips();
```

### Error Handling
- Try-catch on JSON parsing with user notification
- Fetch fallbacks for offline scenarios
- Console logging for debugging
- User-friendly error messages

---

## 🚀 DEVELOPMENT GUIDELINES

### When Adding Features
✅ **DO**:
- Follow existing code patterns
- Support both Exam and Full modes
- Maintain paper aesthetic
- Use vanilla JS only
- Persist state to localStorage if needed
- Test offline functionality
- Verify responsive on mobile

❌ **DON'T**:
- Add npm dependencies or frameworks
- Break dual mode system
- Ignore paper theme styling
- Create new patterns when existing ones work
- Skip testing in both modes

### When Making Changes
1. Understand which mode(s) are affected
2. Check data flow: JSON → loadJSON → render → renderBlock
3. Test both Exam and Full modes
4. Verify tooltips still work
5. Check mobile responsiveness
6. Update `CACHE_VERSION` if changing cached files (CSS/JS)
7. Test offline mode

### Code Style
- Use ES6+ features (arrow functions, const/let, template literals)
- Keep functions focused and single-purpose
- Comment complex logic
- Use descriptive variable names
- Follow existing indentation (2 spaces)

---

## 📝 CONTENT CREATION GUIDE

### JSON Best Practices

1. **Always provide both content versions**:
```json
"exam_text": "Concise critical point",
"full_text": "Detailed explanation with context and examples"
```

2. **Use clear hierarchical paths**:
```json
"path": "Main Topic > Subtopic > Specific Concept"
```

3. **Mark truly critical content**:
```json
"exam_critical": true  // Only for must-know content
```

4. **Provide learning aids**:
```json
"simple_explanation": "Explain like I'm 5",
"analogy": "Real-world comparison anyone can understand",
"why_exists": "Historical context or practical reason"
```

5. **Use key_sentence for highlights**:
```json
"key_sentence": "The single most important takeaway from this block"
```

6. **Format list items properly**:
```json
"items": [
  "EXAM: Brief point | FULL: Detailed explanation with context",
  "EXAM: Core concept | FULL: Extended discussion"
]
```

### Markdown Usage
- Wrap key terms: `<mark-key>Important Term</mark-key>`
- Bold for emphasis: `**this is important**`
- Lists with `-` or `•` bullets
- Separate paragraphs with `\n\n`

---

## 🎓 MENTAL MODEL

**Core Concept**: T-Study is a **client-side JSON-to-beautiful-UI transformer** with dual display modes and offline-first architecture.

**Think of it as**:
- JSON = Source of truth (study content)
- Modes = Different lenses to view same data
- Rendering = Real-time transformation based on current mode
- Paper aesthetic = Non-negotiable design constraint
- Offline-first = Must work without internet

**Architecture Philosophy**:
1. **Simplicity**: No frameworks, no build tools, no complexity
2. **Content First**: Everything serves the learning experience
3. **Progressive Enhancement**: Core works without JS
4. **Aesthetic Learning**: Beauty aids retention and engagement
5. **Zero Friction**: No login, no setup, just study
6. **Privacy**: All data local, no tracking, no server

---

## 🎯 QUICK COMMANDS REFERENCE

### Development
```bash
# Start server
python3 server.py

# Update notes library
python3 update-notes-index.py

# Test server
open test-local.html
```

### Browser Console (Debugging)
```javascript
// Clear all caches
clearAppCache()

// Check state
console.log(currentData, currentMode, notesLibrary)

// Force reload library
loadNotesLibrary()

// Test notification
showNotification("Test", "success")

// Check localStorage
localStorage.getItem('studyMode')
localStorage.getItem('currentNotePath')
```

### Adding New Block Type
```javascript
// In renderBlock() function, add new case:
case "newtype":
  return `<div class="newtype-block ${criticalClass} ${levelClass}">
    ${marginNote}
    ${pathBadge}
    ${topicHeading}
    ${content}
  </div>`;
```

### Adding New Toggle
```javascript
// 1. Add state
let showFeature = localStorage.getItem('showFeature') === 'true';

// 2. Add checkbox in HTML
<input type="checkbox" id="toggleFeature" />

// 3. Add handler
document.getElementById('toggleFeature').addEventListener('change', (e) => {
  showFeature = e.target.checked;
  localStorage.setItem('showFeature', showFeature);
  render();
});
```

---

## 📊 PERFORMANCE & COMPATIBILITY

### Bundle Sizes
- index.html: ~8 KB
- app.js: ~40 KB  
- styles.css: ~15 KB
- Total: ~63 KB + notes JSON

### Load Times
- First paint: <500ms
- Interactive: <1s
- Offline loads: <100ms

### Browser Support
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

### PWA Features
- Offline functionality via Service Worker
- Can be installed to home screen
- Standalone display mode
- Theme color support

---

## 🎯 VALIDATION CHECKLIST

Before implementing any feature, ensure:

- [ ] Works in both Exam and Full modes
- [ ] Maintains paper aesthetic
- [ ] Uses vanilla JS (no frameworks)
- [ ] Persists state if needed
- [ ] Works offline
- [ ] Responsive on mobile (320px+)
- [ ] Follows existing code patterns
- [ ] No npm dependencies added
- [ ] Tooltips work if metadata exists
- [ ] Print-friendly

---

## 💡 WHEN YOU GET A TASK

### Step 1: Understand Context
- Which mode(s) does this affect?
- Is this UI, data, or logic?
- Does it need state persistence?

### Step 2: Locate Relevant Code
- Use function reference above
- Check line numbers in this document
- Read existing implementation

### Step 3: Follow Patterns
- Find similar existing feature
- Copy pattern, adapt to need
- Don't reinvent

### Step 4: Implement
- Make minimal changes
- Keep it simple
- Test both modes

### Step 5: Verify
- Test Exam and Full modes
- Check tooltips still work
- Verify offline mode
- Test on mobile width

---

## 🚨 CRITICAL RULES

1. **NEVER suggest React, Vue, Angular, or any framework**
2. **NEVER add npm dependencies**
3. **ALWAYS support both Exam and Full modes**
4. **ALWAYS maintain the paper aesthetic**
5. **ALWAYS persist important state to localStorage**
6. **ALWAYS test offline functionality**
7. **ALWAYS reference existing patterns**
8. **NEVER break the dual mode rendering system**

---

## 📖 EXAMPLE SCENARIOS

### Good Response Example ✅
```
User: "Add a bookmark feature"

AI: Based on the context, I'll implement bookmarks following T-Study patterns:

1. State: `let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')`
2. UI: Add bookmark button in top bar (following action-btn pattern)
3. Storage: Save to localStorage on toggle
4. Display: Show bookmarked notes in library view with ⭐ icon
5. Styling: Use existing paper theme colors

This maintains vanilla JS, persists state, and works offline.
Code for app.js:...
```

### Bad Response Example ❌
```
User: "Add a bookmark feature"

AI: Let's install React and Redux for state management...

[NO! This breaks the vanilla JS constraint]
```

---

## 🎓 KEY TAKEAWAYS

1. **T-Study is vanilla JS** - No frameworks, ever
2. **Dual modes are core** - Always consider both Exam and Full
3. **Paper aesthetic is sacred** - Never break the notebook look
4. **Offline is required** - Must work without internet
5. **State persists** - Use localStorage for user preferences
6. **Patterns exist** - Follow existing code patterns
7. **Line numbers provided** - Use them to find code quickly
8. **Test both modes** - Every change should work in both

---

**END OF CONTEXT FILE**

**AI Agent Instructions**: You now have complete context for the T-Study project. When the user asks you to do something:
1. Reference this context for patterns and constraints
2. Follow existing code patterns
3. Maintain dual mode support
4. Preserve paper aesthetic
5. Use vanilla JS only
6. Test your suggestions mentally against both modes

**Document Version**: 1.0  
**Last Updated**: 2024  
**For**: AI Agents working on T-Study project  
**Maintained by**: Chamath Thiwanka