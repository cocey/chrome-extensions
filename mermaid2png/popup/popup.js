let currentMermaid = '';
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

// Extract mermaid from web page
document.getElementById('extract-btn').addEventListener('click', async () => {
  const statusEl = document.getElementById('web-status');
  statusEl.textContent = 'Extracting mermaid diagram from page...';
  statusEl.className = 'status-message show';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'extractMermaid' }, (response) => {
      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }
      
      if (response && response.success && response.mermaid) {
        currentMermaid = response.mermaid;
        updatePreview(currentMermaid);
        enableGenerateButton();
        statusEl.textContent = 'Mermaid diagram extracted successfully!';
        statusEl.className = 'status-message show success';
      } else {
        throw new Error(response?.error || 'Failed to extract mermaid diagram');
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
      currentMermaid = event.target.result;
      updatePreview(currentMermaid);
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
  currentMermaid = e.target.value;
  const statusEl = document.getElementById('manual-status');
  
  if (currentMermaid.trim()) {
    updatePreview(currentMermaid);
    enableGenerateButton();
    statusEl.textContent = 'Mermaid diagram ready for conversion';
    statusEl.className = 'status-message show success';
  } else {
    resetPreview();
    disableGenerateButton();
    statusEl.className = 'status-message';
  }
});

// Generate PNG
document.getElementById('generate-png-btn').addEventListener('click', async () => {
  if (!currentMermaid.trim()) {
    showError('No mermaid diagram to convert');
    return;
  }
  
  const btn = document.getElementById('generate-png-btn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Generating PNG...';
  
  try {
    await PNGGenerator.generatePNG(currentMermaid);
    btn.textContent = 'PNG Generated!';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 2000);
  } catch (error) {
    btn.disabled = false;
    btn.textContent = originalText;
    showError(`Failed to generate PNG: ${error.message}`);
  }
});

// Clear button
document.getElementById('clear-btn').addEventListener('click', () => {
  resetPreview();
  currentMermaid = '';
  document.getElementById('manual-input').value = '';
  document.getElementById('file-input').value = '';
  clearStatusMessages();
  disableGenerateButton();
});

async function updatePreview(mermaid) {
  if (!mermaid.trim()) {
    resetPreview();
    return;
  }
  
  try {
    // Wait for mermaid library to be available
    const mermaidLib = await waitForMermaid();
    if (!mermaidLib || typeof mermaidLib.initialize !== 'function') {
      throw new Error('Mermaid library not loaded. Please reload the extension.');
    }
    
    const previewContent = document.getElementById('preview-content');
    const previewSection = document.getElementById('preview-section');
    
    // Clear previous content
    previewContent.innerHTML = '';
    
    // Create a unique ID for this diagram
    const diagramId = 'mermaid-preview-' + Date.now();
    const diagramDiv = document.createElement('div');
    diagramDiv.className = 'mermaid';
    diagramDiv.id = diagramId;
    diagramDiv.textContent = mermaid;
    
    previewContent.appendChild(diagramDiv);
    previewSection.style.display = 'block';
    
    // Initialize mermaid and render
    mermaidLib.initialize({ startOnLoad: false, theme: 'default' });
    await mermaidLib.run({
      nodes: [diagramDiv],
      suppressErrors: false
    });
  } catch (error) {
    showError(`Preview error: ${error.message}`);
  }
}

function resetPreview() {
  document.getElementById('preview-content').innerHTML = '';
  document.getElementById('preview-section').style.display = 'none';
}

function enableGenerateButton() {
  document.getElementById('generate-png-btn').disabled = false;
}

function disableGenerateButton() {
  document.getElementById('generate-png-btn').disabled = true;
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

// Wait for mermaid library to be available
async function waitForMermaid(maxAttempts = 50, delay = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    const mermaidLib = window.mermaid;
    if (mermaidLib && typeof mermaidLib.initialize === 'function') {
      return mermaidLib;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return null;
}

// Wait for all scripts to load
function checkLibrariesLoaded() {
  const mermaidLib = window.mermaid;
  if (!mermaidLib || typeof mermaidLib.initialize !== 'function') {
    console.error('mermaid library not loaded');
    showError('Mermaid library failed to load. Please reload the extension.');
    return false;
  }
  return true;
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    const mermaidLib = await waitForMermaid();
    if (mermaidLib) {
      disableGenerateButton();
    } else {
      showError('Mermaid library failed to load. Please reload the extension.');
    }
  });
} else {
  (async () => {
    const mermaidLib = await waitForMermaid();
    if (mermaidLib) {
      disableGenerateButton();
    } else {
      showError('Mermaid library failed to load. Please reload the extension.');
    }
  })();
}

