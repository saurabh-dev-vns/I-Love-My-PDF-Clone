// Live preview for the Watermark tool: renders page 1, then overlays the
// watermark text diagonally in real time as the user types — matching the
// same diagonal style the server actually stamps onto the PDF.

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('file-input');
  const previewList = document.getElementById('preview-list');
  const textInput = document.querySelector('input[name="text"]');
  if (!input || !previewList) return;

  let overlayEl = null;

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) renderPreview(file);
  });

  textInput?.addEventListener('input', updateOverlayText);

  async function renderPreview(file) {
    previewList.innerHTML = '<p class="preview-hint">Loading preview…</p>';
    let pdf;
    try {
      pdf = await window.PdfPreview.loadPdfFromFile(file);
    } catch (err) {
      previewList.innerHTML = '<p class="preview-error">⚠️ Could not preview this PDF.</p>';
      return;
    }

    const canvas = await window.PdfPreview.renderPageToCanvas(pdf, 1, 260);

    previewList.innerHTML = '';
    const hint = document.createElement('p');
    hint.className = 'preview-hint';
    hint.textContent = 'Live preview of page 1 with your watermark text.';
    previewList.appendChild(hint);

    const stage = document.createElement('div');
    stage.className = 'watermark-stage';
    stage.style.width = `${canvas.width}px`;
    stage.style.height = `${canvas.height}px`;
    stage.appendChild(canvas);

    overlayEl = document.createElement('div');
    overlayEl.className = 'watermark-overlay';
    stage.appendChild(overlayEl);

    previewList.appendChild(stage);
    updateOverlayText();
  }

  function updateOverlayText() {
    if (!overlayEl) return;
    overlayEl.textContent = textInput?.value || '';
  }
});
