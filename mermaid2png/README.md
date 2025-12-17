# Mermaid to PNG Converter - Chrome Extension

A Chrome extension that converts mermaid diagrams to PNG from multiple sources: web pages (GitHub, GitLab), local files, or manual text input.

## Features

- **Multiple Input Methods**:
  - Extract mermaid diagrams from web pages (GitHub, GitLab, etc.)
  - Upload local mermaid files
  - Manual text input with live preview

- **Live Preview**: See your mermaid diagram rendered before converting to PNG

- **High-Quality PNG Output**: Generates well-formatted PNG images with proper sizing

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `mermaid2png` directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Choose your input method:
   - **From Web Page**: Click "Extract Mermaid" to extract mermaid diagrams from the current page
   - **From File**: Click "Choose Mermaid File" to upload a local `.mmd`, `.mermaid`, or `.md` file
   - **Manual Input**: Paste or type your mermaid diagram code in the text area
3. Preview your diagram in the preview section
4. Click "Generate PNG" to download your PNG image

## Supported Mermaid Diagram Types

- Flowcharts
- Sequence Diagrams
- Class Diagrams
- State Diagrams
- Entity Relationship Diagrams
- User Journey
- Gantt Charts
- Pie Charts
- Git Graphs
- Mindmaps
- Timeline
- C4 Diagrams
- And more!

## File Structure

```
mermaid2png/
├── manifest.json              # Extension configuration
├── popup/
│   ├── popup.html            # Main UI
│   ├── popup.js              # Popup logic
│   └── popup.css             # Styles
├── content/
│   └── content.js            # Content script for web extraction
├── background/
│   └── background.js        # Service worker
├── lib/
│   ├── png-generator.js      # PNG generation logic
│   ├── mermaid.min.js        # Mermaid library
│   └── mermaid-styles.css    # Diagram styling
├── icons/
│   ├── icon16.png            # Extension icons (16x16)
│   ├── icon48.png            # Extension icons (48x48)
│   └── icon128.png           # Extension icons (128x128)
└── README.md
```

## Creating Icons

You need to create icon files (16x16, 48x48, and 128x128 pixels) and place them in the `icons/` directory. You can:

1. Use the HTML generator (`icons/generate-icons.html`) - open it in a browser and click the buttons
2. Use an online icon generator
3. Create simple icons with a design tool

The icons should represent the mermaid-to-PNG conversion functionality.

## Technologies Used

- **Mermaid.js**: Diagram rendering library
- **Canvas API**: PNG generation

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)

## Permissions

- `activeTab`: To access the current tab's content
- `storage`: To store user preferences (if needed)
- `scripting`: To inject content scripts
- `downloads`: To download generated PNGs

## Development

The extension uses:
- Manifest V3 (latest Chrome extension standard)
- Content scripts for web page interaction
- Service worker for background tasks
- Mermaid.js library for diagram rendering

## License

MIT License - feel free to use and modify as needed.

