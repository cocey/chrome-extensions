// Background service worker for the extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Mermaid to PNG Converter extension installed');
});

// Handle extension icon click (if needed)
chrome.action.onClicked.addListener((tab) => {
  // Popup handles the UI, so this might not be needed
  // But we can use it for future features
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadPNG') {
    // Handle PNG download if needed
    chrome.downloads.download({
      url: request.url,
      filename: request.filename || 'mermaid.png',
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });
    return true;
  }
});

