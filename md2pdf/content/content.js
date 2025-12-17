// Content script to extract markdown from web pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractMarkdown') {
    extractMarkdown()
      .then(markdown => {
        sendResponse({ success: true, markdown });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates we will send a response asynchronously
  }
});

async function extractMarkdown() {
  // Try to extract from GitHub
  if (window.location.hostname.includes('github.com')) {
    return extractFromGitHub();
  }
  
  // Try to extract from GitLab
  if (window.location.hostname.includes('gitlab.com')) {
    return extractFromGitLab();
  }
  
  // Try to find markdown content in common selectors
  return extractFromCommonSelectors();
}

function extractFromGitHub() {
  // GitHub README content
  const readmeSelectors = [
    'article.markdown-body',
    '.markdown-body',
    '[data-testid="readme-content"]',
    '.Box-body'
  ];
  
  for (const selector of readmeSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Try to get raw markdown from GitHub's API or source
      const rawButton = document.querySelector('a[href*="/raw/"]');
      if (rawButton) {
        // If we can't fetch raw, convert HTML back to markdown
        return htmlToMarkdown(element);
      }
      return htmlToMarkdown(element);
    }
  }
  
  // Try to find code blocks with markdown
  const codeBlocks = document.querySelectorAll('pre code');
  for (const block of codeBlocks) {
    const text = block.textContent.trim();
    if (text.includes('#') && text.includes('\n')) {
      return text;
    }
  }
  
  throw new Error('No markdown content found on this GitHub page');
}

function extractFromGitLab() {
  // GitLab markdown content
  const selectors = [
    '.wiki-content',
    '.md',
    '.markdown',
    'article'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return htmlToMarkdown(element);
    }
  }
  
  throw new Error('No markdown content found on this GitLab page');
}

function extractFromCommonSelectors() {
  // Common markdown container selectors
  const selectors = [
    'article',
    '.markdown',
    '.markdown-body',
    '[class*="markdown"]',
    '[class*="md"]',
    'main',
    '.content',
    '#content'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      // Check if it looks like markdown
      if (text.includes('#') || text.includes('*') || text.includes('`')) {
        return htmlToMarkdown(element);
      }
    }
  }
  
  // Try to find <pre><code> blocks that might contain markdown
  const codeBlocks = document.querySelectorAll('pre code');
  for (const block of codeBlocks) {
    const text = block.textContent.trim();
    if (isMarkdownLike(text)) {
      return text;
    }
  }
  
  throw new Error('No markdown content detected on this page. Try using manual input or file upload.');
}

function htmlToMarkdown(element) {
  // Simple HTML to Markdown conversion
  // This is a basic implementation - for production, consider using a library like turndown
  
  let markdown = element.innerText || element.textContent;
  
  // Try to preserve some structure
  const clone = element.cloneNode(true);
  
  // Convert headings
  clone.querySelectorAll('h1').forEach(h => {
    h.textContent = '# ' + h.textContent;
  });
  clone.querySelectorAll('h2').forEach(h => {
    h.textContent = '## ' + h.textContent;
  });
  clone.querySelectorAll('h3').forEach(h => {
    h.textContent = '### ' + h.textContent;
  });
  clone.querySelectorAll('h4').forEach(h => {
    h.textContent = '#### ' + h.textContent;
  });
  clone.querySelectorAll('h5').forEach(h => {
    h.textContent = '##### ' + h.textContent;
  });
  clone.querySelectorAll('h6').forEach(h => {
    h.textContent = '###### ' + h.textContent;
  });
  
  // Convert code blocks
  clone.querySelectorAll('pre code').forEach(code => {
    const lang = code.className.match(/language-(\w+)/)?.[1] || '';
    code.textContent = '```' + lang + '\n' + code.textContent + '\n```';
  });
  
  // Convert inline code
  clone.querySelectorAll('code:not(pre code)').forEach(code => {
    code.textContent = '`' + code.textContent + '`';
  });
  
  // Convert links
  clone.querySelectorAll('a').forEach(a => {
    const text = a.textContent;
    const href = a.href;
    a.textContent = `[${text}](${href})`;
  });
  
  // Convert images
  clone.querySelectorAll('img').forEach(img => {
    const alt = img.alt || '';
    const src = img.src;
    img.replaceWith(`![${alt}](${src})`);
  });
  
  // Convert lists
  clone.querySelectorAll('ul li').forEach(li => {
    li.textContent = '- ' + li.textContent.trim();
  });
  clone.querySelectorAll('ol li').forEach((li, i) => {
    li.textContent = `${i + 1}. ` + li.textContent.trim();
  });
  
  // Convert blockquotes
  clone.querySelectorAll('blockquote').forEach(blockquote => {
    const lines = blockquote.textContent.split('\n');
    blockquote.textContent = lines.map(line => '> ' + line).join('\n');
  });
  
  // Convert bold and italic (basic)
  clone.querySelectorAll('strong, b').forEach(el => {
    el.textContent = '**' + el.textContent + '**';
  });
  clone.querySelectorAll('em, i').forEach(el => {
    el.textContent = '*' + el.textContent + '*';
  });
  
  markdown = clone.textContent || clone.innerText;
  
  return markdown.trim();
}

function isMarkdownLike(text) {
  // Simple heuristic to check if text looks like markdown
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // Headers
    /^\s*[-*+]\s+/m,         // Unordered lists
    /^\s*\d+\.\s+/m,         // Ordered lists
    /```[\s\S]*?```/,        // Code blocks
    /`[^`]+`/,               // Inline code
    /\[.*?\]\(.*?\)/,        // Links
    /!\[.*?\]\(.*?\)/,       // Images
    /^\s*>\s+/m              // Blockquotes
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}

