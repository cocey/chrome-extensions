# Markdown to PDF Converter - Chrome Extension

A Chrome extension that converts markdown content to PDF from multiple sources: web pages (GitHub, GitLab), local files, or manual text input.

## Features

- **Multiple Input Methods**:
  - Extract markdown from web pages (GitHub, GitLab, etc.)
  - Upload local markdown files
  - Manual text input with live preview

- **Live Preview**: See your markdown rendered before converting to PDF

- **High-Quality PDF Output**: Generates well-formatted PDFs with proper styling

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `md2pdf` directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Choose your input method:
   - **From Web Page**: Click "Extract Markdown" to extract markdown from the current page
   - **From File**: Click "Choose Markdown File" to upload a local `.md` file
   - **Manual Input**: Paste or type your markdown in the text area
3. Preview your markdown in the preview section
4. Click "Generate PDF" to download your PDF

## File Structure

```
md2pdf/
├── manifest.json              # Extension configuration
├── popup/
│   ├── popup.html            # Main UI
│   ├── popup.js              # Popup logic
│   └── popup.css             # Styles
├── content/
│   └── content.js            # Content script for web extraction
├── background/
│   └── background.js         # Service worker
├── lib/
│   ├── pdf-generator.js      # PDF generation logic
│   └── markdown-styles.css   # PDF styling
├── icons/
│   ├── icon16.png            # Extension icons (16x16)
│   ├── icon48.png            # Extension icons (48x48)
│   └── icon128.png           # Extension icons (128x128)
└── README.md
```

## Creating Icons

You need to create icon files (16x16, 48x48, and 128x128 pixels) and place them in the `icons/` directory. You can:

1. Use an online icon generator
2. Create simple icons with a design tool
3. Use a placeholder icon generator

The icons should represent the markdown-to-PDF conversion functionality.

## Technologies Used

- **Marked.js**: Markdown parser
- **jsPDF**: PDF generation library
- **html2canvas**: HTML to canvas conversion for PDF

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)

## Permissions

- `activeTab`: To access the current tab's content
- `storage`: To store user preferences (if needed)
- `scripting`: To inject content scripts
- `downloads`: To download generated PDFs

## Development

The extension uses:
- Manifest V3 (latest Chrome extension standard)
- Content scripts for web page interaction
- Service worker for background tasks
- CDN libraries for markdown parsing and PDF generation

## License

MIT License - feel free to use and modify as needed.

