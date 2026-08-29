// Shared client-side preview engine, used by every tool page.
// Renders actual PDF pages as <canvas> thumbnails IN THE BROWSER via PDF.js —
// nothing is uploaded to the server just to preview a file.
// Requires the global `pdfjsLib` (loaded from CDN in layouts/main.ejs) to exist.

(function () {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  /** Loads a File (a .pdf the user picked) into a pdf.js document object. */
  async function loadPdfFromFile(file) {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    return loadingTask.promise; // PDFDocumentProxy
  }

  /**
   * Renders one page of a loaded pdf.js document to a new <canvas>,
   * scaled to `targetWidth` pixels wide (aspect ratio preserved).
   */
  async function renderPageToCanvas(pdf, pageNumber, targetWidth = 140) {
    const page = await pdf.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  }

  /** Formats a byte count as a human-readable string (KB/MB). */
  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  window.PdfPreview = { loadPdfFromFile, renderPageToCanvas, formatBytes };
})();
