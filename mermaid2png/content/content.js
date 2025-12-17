// Content script to extract mermaid diagrams from web pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractMermaid') {
    extractMermaid()
      .then(mermaid => {
        sendResponse({ success: true, mermaid });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates we will send a response asynchronously
  }
});

async function extractMermaid() {
  // Try to find mermaid code blocks
  const mermaidSelectors = [
    'code.language-mermaid',
    'code.lang-mermaid',
    'pre code.language-mermaid',
    'pre code.lang-mermaid',
    '.mermaid',
    '[class*="mermaid"]',
    'pre:has(code.language-mermaid)',
    'pre:has(code.lang-mermaid)'
  ];
  
  for (const selector of mermaidSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      let mermaidCode = '';
      
      // If it's a code element, get its text content
      if (element.tagName === 'CODE') {
        mermaidCode = element.textContent.trim();
      } 
      // If it's a pre element, get the code inside
      else if (element.tagName === 'PRE') {
        const codeEl = element.querySelector('code');
        mermaidCode = codeEl ? codeEl.textContent.trim() : element.textContent.trim();
      }
      // If it's a div with mermaid class, get its text content
      else {
        mermaidCode = element.textContent.trim();
      }
      
      // Check if it looks like mermaid code
      if (isMermaidCode(mermaidCode)) {
        return mermaidCode;
      }
    }
  }
  
  // Try to find mermaid in markdown code blocks
  const codeBlocks = document.querySelectorAll('pre code');
  for (const block of codeBlocks) {
    const text = block.textContent.trim();
    if (isMermaidCode(text)) {
      return text;
    }
  }
  
  // Try GitHub/GitLab specific selectors
  if (window.location.hostname.includes('github.com')) {
    return extractFromGitHub();
  }
  
  if (window.location.hostname.includes('gitlab.com')) {
    return extractFromGitLab();
  }
  
  throw new Error('No mermaid diagram detected on this page. Try using manual input or file upload.');
}

function extractFromGitHub() {
  // GitHub markdown content
  const selectors = [
    'article.markdown-body pre code.language-mermaid',
    'article.markdown-body pre code.lang-mermaid',
    '.markdown-body pre code.language-mermaid',
    '.markdown-body pre code.lang-mermaid'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const text = element.textContent.trim();
      if (isMermaidCode(text)) {
        return text;
      }
    }
  }
  
  throw new Error('No mermaid diagram found on this GitHub page');
}

function extractFromGitLab() {
  // GitLab markdown content
  const selectors = [
    '.wiki-content pre code.language-mermaid',
    '.wiki-content pre code.lang-mermaid',
    '.md pre code.language-mermaid',
    '.md pre code.lang-mermaid'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const text = element.textContent.trim();
      if (isMermaidCode(text)) {
        return text;
      }
    }
  }
  
  throw new Error('No mermaid diagram found on this GitLab page');
}

function isMermaidCode(text) {
  if (!text || text.length < 10) {
    return false;
  }
  
  // Mermaid diagram patterns
  const mermaidPatterns = [
    /^graph\s+(TD|LR|BT|RL|TB)/i,
    /^flowchart\s+(TD|LR|BT|RL|TB)/i,
    /^sequenceDiagram/i,
    /^classDiagram/i,
    /^stateDiagram/i,
    /^erDiagram/i,
    /^journey/i,
    /^gantt/i,
    /^pie/i,
    /^gitgraph/i,
    /^mindmap/i,
    /^timeline/i,
    /^C4Context/i,
    /^C4Container/i,
    /^C4Component/i,
    /^C4Dynamic/i,
    /^C4Deployment/i,
    /^quadrantChart/i,
    /^requirement/i,
    /^sankey-beta/i
  ];
  
  // Check if text starts with a mermaid diagram type
  const firstLine = text.split('\n')[0].trim();
  return mermaidPatterns.some(pattern => pattern.test(firstLine));
}

