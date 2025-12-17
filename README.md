# Chrome Extensions Collection

This directory contains multiple Chrome extensions for converting various formats.

## Extensions

### 1. Markdown to PDF Converter (`md2pdf/`)
Converts markdown content to PDF from web pages, local files, or manual input.

**Features:**
- Extract markdown from GitHub, GitLab, and other web pages
- Upload local markdown files
- Manual text input with live preview
- Generate high-quality PDFs

### 2. Mermaid to PNG Converter (`mermaid2png/`)
Converts mermaid diagrams to PNG images from web pages, local files, or manual input.

**Features:**
- Extract mermaid diagrams from GitHub, GitLab, and other web pages
- Upload local mermaid files
- Manual text input with live preview
- Generate high-quality PNG images
- Supports all mermaid diagram types (flowcharts, sequence diagrams, class diagrams, etc.)

## Installation

Each extension can be installed independently:

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the extension directory you want to install (e.g., `md2pdf/` or `mermaid2png/`)

## Project Structure

```
chrome-extensions/
├── md2pdf/          # Markdown to PDF extension
├── mermaid2png/     # Mermaid to PNG extension
└── README.md        # This file
```

Each extension follows a similar structure:
- `manifest.json` - Extension configuration
- `popup/` - UI files (HTML, CSS, JS)
- `content/` - Content scripts for web page interaction
- `background/` - Service worker
- `lib/` - Libraries and utilities
- `icons/` - Extension icons

## Development

Both extensions use:
- Manifest V3 (latest Chrome extension standard)
- Content scripts for web page interaction
- Service workers for background tasks
- Local libraries (no CDN dependencies)

## License

MIT License - feel free to use and modify as needed.

