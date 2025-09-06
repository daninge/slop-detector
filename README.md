# LinkedIn Slop Detector

A browser extension that detects and filters low-quality LinkedIn posts using AI analysis.

## Features

- Automatically analyzes LinkedIn posts for "slop" content
- Uses AI to identify and filter low-quality posts
- Clean and minimal interface
- Works seamlessly with LinkedIn's interface

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the project folder
5. Configure your OpenAI API key in the extension popup

## Usage

1. Navigate to LinkedIn
2. The extension will automatically analyze posts as you scroll
3. Low-quality posts will be filtered or marked
4. Use the extension popup to adjust settings

## Files

- `manifest.json` - Extension configuration and permissions
- `content.js` - Main content script that analyzes LinkedIn posts
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality and settings
- `styles.css` - Custom styles for the extension

## Requirements

- Chrome browser (or other Chromium-based browser)
- OpenAI API key for AI analysis

## License

This project is for educational and personal use.