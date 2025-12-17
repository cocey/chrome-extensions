let currentMarkdown = '';
let currentTab = 'web';

// Initialize tabs
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab;
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  const previousTab = currentTab;
  currentTab = tabName;
  
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Clear status messages
  clearStatusMessages();
  
  // Reset preview if switching tabs
  if (tabName !== previousTab) {
    resetPreview();
  }
}

// Extract markdown from web page
document.getElementById('extract-btn').addEventListener('click', async () => {
  const statusEl = document.getElementById('web-status');
  statusEl.textContent = 'Extracting markdown from page...';
  statusEl.className = 'status-message show';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'extractMarkdown' }, (response) => {
      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }
      
      if (response && response.success && response.markdown) {
        currentMarkdown = response.markdown;
        updatePreview(currentMarkdown);
        enableGenerateButton();
        statusEl.textContent = 'Markdown extracted successfully!';
        statusEl.className = 'status-message show success';
      } else {
        throw new Error(response?.error || 'Failed to extract markdown');
      }
    });
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    statusEl.className = 'status-message show error';
    showError(error.message);
  }
});

// File input handler
document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const statusEl = document.getElementById('file-status');
  
  if (!file) {
    return;
  }
  
  statusEl.textContent = 'Reading file...';
  statusEl.className = 'status-message show';
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      currentMarkdown = event.target.result;
      updatePreview(currentMarkdown);
      enableGenerateButton();
      statusEl.textContent = 'File loaded successfully!';
      statusEl.className = 'status-message show success';
    } catch (error) {
      statusEl.textContent = `Error: ${error.message}`;
      statusEl.className = 'status-message show error';
      showError(error.message);
    }
  };
  
  reader.onerror = () => {
    statusEl.textContent = 'Error reading file';
    statusEl.className = 'status-message show error';
    showError('Failed to read file');
  };
  
  reader.readAsText(file);
});

// Manual input handler
document.getElementById('manual-input').addEventListener('input', (e) => {
  currentMarkdown = e.target.value;
  const statusEl = document.getElementById('manual-status');
  
  if (currentMarkdown.trim()) {
    updatePreview(currentMarkdown);
    enableGenerateButton();
    statusEl.textContent = 'Markdown ready for conversion';
    statusEl.className = 'status-message show success';
  } else {
    resetPreview();
    disableGenerateButton();
    statusEl.className = 'status-message';
  }
});

// Generate PDF
document.getElementById('generate-pdf-btn').addEventListener('click', async () => {
  if (!currentMarkdown.trim()) {
    showError('No markdown content to convert');
    return;
  }
  
  const btn = document.getElementById('generate-pdf-btn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Generating PDF...';
  
  try {
    await PDFGenerator.generatePDF(currentMarkdown);
    btn.textContent = 'PDF Generated!';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 2000);
  } catch (error) {
    btn.disabled = false;
    btn.textContent = originalText;
    showError(`Failed to generate PDF: ${error.message}`);
  }
});

// Clear button
document.getElementById('clear-btn').addEventListener('click', () => {
  resetPreview();
  currentMarkdown = '';
  document.getElementById('manual-input').value = '';
  document.getElementById('file-input').value = '';
  clearStatusMessages();
  disableGenerateButton();
});

function updatePreview(markdown) {
  if (!markdown.trim()) {
    resetPreview();
    return;
  }
  
  try {
    // Check if marked is available (check both global and window)
    const markedLib = typeof marked !== 'undefined' ? marked : (typeof window !== 'undefined' && window.marked ? window.marked : null);
    if (!markedLib || typeof markedLib.parse !== 'function') {
      throw new Error('Marked library not loaded. Please reload the extension.');
    }
    
    const previewContent = document.getElementById('preview-content');
    const previewSection = document.getElementById('preview-section');
    
    // Parse markdown to HTML
    const html = markedLib.parse(markdown);
    previewContent.innerHTML = html;
    previewSection.style.display = 'block';
  } catch (error) {
    showError(`Preview error: ${error.message}`);
  }
}

function resetPreview() {
  document.getElementById('preview-content').innerHTML = '';
  document.getElementById('preview-section').style.display = 'none';
}

function enableGenerateButton() {
  document.getElementById('generate-pdf-btn').disabled = false;
}

function disableGenerateButton() {
  document.getElementById('generate-pdf-btn').disabled = true;
}

function clearStatusMessages() {
  document.querySelectorAll('.status-message').forEach(el => {
    el.className = 'status-message';
    el.textContent = '';
  });
}

function showError(message) {
  const errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

// Wait for all scripts to load
function checkLibrariesLoaded() {
  const markedLib = typeof marked !== 'undefined' ? marked : (typeof window !== 'undefined' && window.marked ? window.marked : null);
  if (!markedLib || typeof markedLib.parse !== 'function') {
    console.error('marked library not loaded');
    showError('Marked library failed to load. Please reload the extension.');
    return false;
  }
  if (typeof html2canvas === 'undefined') {
    console.error('html2canvas library not loaded');
    showError('html2canvas library failed to load. Please reload the extension.');
    return false;
  }
  if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
    console.error('jsPDF library not loaded');
    showError('jsPDF library failed to load. Please reload the extension.');
    return false;
  }
  return true;
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (checkLibrariesLoaded()) {
      disableGenerateButton();
    }
  });
} else {
  if (checkLibrariesLoaded()) {
    disableGenerateButton();
  }
}

