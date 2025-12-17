// PNG Generator module for Mermaid diagrams
const PNGGenerator = {
  async generatePNG(mermaidCode) {
    try {
      // Check if mermaid library is available
      const mermaidLib = window.mermaid;
      if (!mermaidLib || typeof mermaidLib.initialize !== 'function') {
        throw new Error('Mermaid library not loaded');
      }
      
      // Create a temporary container for rendering
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '1200px';
      container.style.backgroundColor = 'white';
      container.style.padding = '20px';
      
      // Create mermaid diagram element
      const diagramId = 'mermaid-export-' + Date.now();
      const diagramDiv = document.createElement('div');
      diagramDiv.className = 'mermaid';
      diagramDiv.id = diagramId;
      diagramDiv.textContent = mermaidCode;
      diagramDiv.style.width = '100%';
      
      container.appendChild(diagramDiv);
      document.body.appendChild(container);
      
      // Initialize mermaid
      mermaidLib.initialize({ 
        startOnLoad: false, 
        theme: 'default',
        securityLevel: 'loose'
      });
      
      // Render the diagram
      await mermaidLib.run({
        nodes: [diagramDiv],
        suppressErrors: false
      });
      
      // Wait a bit for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the rendered SVG
      const svg = diagramDiv.querySelector('svg');
      if (!svg) {
        throw new Error('Failed to render mermaid diagram');
      }
      
      // Get SVG dimensions and viewBox
      const viewBox = svg.getAttribute('viewBox');
      let svgWidth = parseFloat(svg.getAttribute('width')) || 800;
      let svgHeight = parseFloat(svg.getAttribute('height')) || 600;
      
      if (viewBox) {
        const parts = viewBox.split(' ');
        svgWidth = parseFloat(parts[2]) || svgWidth;
        svgHeight = parseFloat(parts[3]) || svgHeight;
      }
      
      // Add padding
      const padding = 40;
      const width = Math.max(svgWidth + padding * 2, 800);
      const height = Math.max(svgHeight + padding * 2, 600);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      
      // Clone and prepare SVG for export
      const svgClone = svg.cloneNode(true);
      svgClone.setAttribute('width', svgWidth);
      svgClone.setAttribute('height', svgHeight);
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Draw image on canvas with padding
          ctx.drawImage(img, padding, padding, svgWidth, svgHeight);
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Failed to load SVG image'));
        };
        img.src = svgUrl;
      });
      
      // Remove temporary container
      document.body.removeChild(container);
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.generateFilename();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
      
      return { success: true, filename: this.generateFilename() };
    } catch (error) {
      console.error('PNG generation error:', error);
      throw new Error(`Failed to generate PNG: ${error.message}`);
    }
  },
  
  generateFilename() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `mermaid-${dateStr}-${timeStr}.png`;
  }
};

