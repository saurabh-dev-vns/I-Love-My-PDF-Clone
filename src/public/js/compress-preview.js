// Live preview for the Compress tool: shows page 1 + basic file stats
// (size, page count) so the user can confirm they picked the right file
// before compressing.

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('file-input');
  const previewList = document.getElementById('preview-list');
  if (!input || !previewList) return;

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) renderPreview(file);
  });

  async function renderPreview(file) {
    previewList.innerHTML = '<p class="preview-hint">Loading preview…</p>';
    let pdf;
    try {
      pdf = await window.PdfPreview.loadPdfFromFile(file);
    } catch (err) {
      previewList.innerHTML = '<p class="preview-error">⚠️ Could not preview this PDF.</p>';
      return;
    }

    const canvas = await window.PdfPreview.renderPageToCanvas(pdf, 1, 180);

    previewList.innerHTML = '';
    const stage = document.createElement('div');
    stage.className = 'single-preview-stage';
    stage.appendChild(canvas);
    previewList.appendChild(stage);

    const stats = document.createElement('p');
    stats.className = 'preview-hint';
    stats.textContent = `${file.name} · ${pdf.numPages} page(s) · ${window.PdfPreview.formatBytes(file.size)}`;
    previewList.appendChild(stats);
  }
});
