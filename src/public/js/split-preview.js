// Live preview for the Split tool: renders every page as a thumbnail and
// lets the user click pages to select them — the selection is auto-converted
// into a range string (e.g. "1,3-5,7") and written into the range input.

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('file-input');
  const previewList = document.getElementById('preview-list');
  const rangeInput = document.querySelector('input[name="range"]');
  const rangeRadio = document.querySelector('input[name="mode"][value="range"]');
  if (!input || !previewList) return;

  const selectedPages = new Set();

  input.addEventListener('change', () => {
    selectedPages.clear();
    if (rangeInput) rangeInput.value = '';
    const file = input.files[0];
    if (file) renderPreview(file);
  });

  async function renderPreview(file) {
    previewList.innerHTML = '<p class="preview-hint">Loading pages…</p>';

    let pdf;
    try {
      pdf = await window.PdfPreview.loadPdfFromFile(file);
    } catch (err) {
      previewList.innerHTML = '<p class="preview-error">⚠️ Could not preview this PDF.</p>';
      return;
    }

    previewList.innerHTML = '';
    const hint = document.createElement('p');
    hint.className = 'preview-hint';
    hint.textContent = `${pdf.numPages} page(s). Click pages to build a range, or use "split every page" below.`;
    previewList.appendChild(hint);

    const grid = document.createElement('div');
    grid.className = 'preview-grid';
    previewList.appendChild(grid);

    for (let i = 1; i <= pdf.numPages; i++) {
      const item = document.createElement('div');
      item.className = 'preview-item selectable';
      item.dataset.page = String(i);

      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'preview-thumb loading';
      thumbWrap.innerHTML = '<span class="spinner">…</span>';
      item.appendChild(thumbWrap);

      const label = document.createElement('div');
      label.className = 'preview-label';
      label.textContent = `Page ${i}`;
      item.appendChild(label);

      item.addEventListener('click', () => togglePage(i, item));
      grid.appendChild(item);

      window.PdfPreview.renderPageToCanvas(pdf, i, 100).then((canvas) => {
        thumbWrap.classList.remove('loading');
        thumbWrap.innerHTML = '';
        thumbWrap.appendChild(canvas);
      });
    }
  }

  function togglePage(pageNum, item) {
    if (selectedPages.has(pageNum)) {
      selectedPages.delete(pageNum);
      item.classList.remove('selected');
    } else {
      selectedPages.add(pageNum);
      item.classList.add('selected');
    }
    if (rangeRadio) rangeRadio.checked = true;
    if (rangeInput) rangeInput.value = buildRangeString([...selectedPages].sort((a, b) => a - b));
  }

  function buildRangeString(sortedPages) {
    if (sortedPages.length === 0) return '';
    const ranges = [];
    let start = sortedPages[0];
    let prev = sortedPages[0];

    for (let i = 1; i <= sortedPages.length; i++) {
      const cur = sortedPages[i];
      if (cur === prev + 1) {
        prev = cur;
        continue;
      }
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      if (cur !== undefined) {
        start = cur;
        prev = cur;
      }
    }
    return ranges.join(',');
  }
});
