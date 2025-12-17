// PDF Generator module
const PDFGenerator = {
  async generatePDF(markdown) {
    try {
      // Check if marked is available (check both global and window)
      const markedLib = typeof marked !== 'undefined' ? marked : (typeof window !== 'undefined' && window.marked ? window.marked : null);
      if (!markedLib || typeof markedLib.parse !== 'function') {
        throw new Error('Marked library not loaded');
      }
      
      // Parse markdown to HTML
      const html = markedLib.parse(markdown);
      
      // Create a temporary container for rendering
      const container = document.createElement('div');
      container.style.width = '210mm'; // A4 width
      container.style.padding = '20mm';
      container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      container.style.fontSize = '12pt';
      container.style.lineHeight = '1.6';
      container.style.color = '#333';
      container.style.backgroundColor = 'white';
      container.innerHTML = html;
      
      // Apply markdown styles
      this.applyStyles(container);
      
      // Append to body temporarily
      document.body.appendChild(container);
      
      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary container
      document.body.removeChild(container);
      
      const imgData = canvas.toDataURL('image/png');
      // jsPDF from UMD bundle
      const jsPDF = window.jspdf.jsPDF;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download PDF
      const filename = this.generateFilename();
      pdf.save(filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  },
  
  applyStyles(container) {
    // Apply styles to markdown elements
    const style = document.createElement('style');
    style.textContent = `
      h1, h2, h3, h4, h5, h6 {
        margin-top: 20px;
        margin-bottom: 10px;
        font-weight: 600;
        color: #333;
      }
      h1 { font-size: 28px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
      h2 { font-size: 24px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; }
      h3 { font-size: 20px; }
      h4 { font-size: 18px; }
      h5 { font-size: 16px; }
      h6 { font-size: 14px; }
      p { margin-bottom: 12px; line-height: 1.6; }
      ul, ol { margin-left: 20px; margin-bottom: 12px; }
      li { margin-bottom: 6px; line-height: 1.6; }
      code {
        background: #f4f4f4;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 11pt;
        color: #e83e8c;
      }
      pre {
        background: #282c34;
        color: #abb2bf;
        padding: 15px;
        border-radius: 6px;
        overflow-x: auto;
        margin-bottom: 15px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 10pt;
      }
      pre code {
        background: transparent;
        padding: 0;
        color: inherit;
      }
      blockquote {
        border-left: 4px solid #667eea;
        padding-left: 15px;
        margin-left: 0;
        color: #666;
        font-style: italic;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      table th, table td {
        border: 1px solid #e0e0e0;
        padding: 8px 12px;
        text-align: left;
      }
      table th {
        background: #f5f5f5;
        font-weight: 600;
      }
      a {
        color: #667eea;
        text-decoration: none;
      }
      img {
        max-width: 100%;
        height: auto;
        margin: 15px 0;
      }
      hr {
        border: none;
        border-top: 2px solid #e0e0e0;
        margin: 20px 0;
      }
    `;
    container.appendChild(style);
  },
  
  generateFilename() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `markdown-${dateStr}-${timeStr}.pdf`;
  }
};

