// Generic live preview for single-file tools that don't need special
// interactivity (Protect, Unlock, PDF-to-Word) — just page 1 + file stats,
// so the user can confirm the right file before submitting.

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
