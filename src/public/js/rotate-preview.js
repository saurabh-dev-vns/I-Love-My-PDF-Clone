// Live preview for the Rotate tool: renders page 1, then rotates the
// thumbnail live (via CSS transform) as soon as the angle dropdown changes —
// so the user sees the actual result before submitting anything.

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('file-input');
  const previewList = document.getElementById('preview-list');
  const angleSelect = document.querySelector('select[name="angle"]');
  if (!input || !previewList) return;

  let currentCanvas = null;

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) renderPreview(file);
  });

  angleSelect?.addEventListener('change', applyRotation);

  async function renderPreview(file) {
    previewList.innerHTML = '<p class="preview-hint">Loading preview…</p>';
    let pdf;
    try {
      pdf = await window.PdfPreview.loadPdfFromFile(file);
    } catch (err) {
      previewList.innerHTML = '<p class="preview-error">⚠️ Could not preview this PDF.</p>';
      return;
    }

    const canvas = await window.PdfPreview.renderPageToCanvas(pdf, 1, 220);
    currentCanvas = canvas;

    previewList.innerHTML = '';
    const hint = document.createElement('p');
    hint.className = 'preview-hint';
    hint.textContent = 'Live preview of page 1 — pick an angle to see the rotation.';
    previewList.appendChild(hint);

    const stage = document.createElement('div');
    stage.className = 'rotate-stage';
    stage.appendChild(canvas);
    previewList.appendChild(stage);

    applyRotation();
  }

  function applyRotation() {
    if (!currentCanvas || !angleSelect) return;
    const angle = Number(angleSelect.value) || 0;
    currentCanvas.style.transform = `rotate(${angle}deg)`;
  }
});
