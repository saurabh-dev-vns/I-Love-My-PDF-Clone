// Live preview for the Merge tool: shows a thumbnail of the first page of
// every selected PDF, in upload order, and lets the user drag to reorder
// them BEFORE submitting — the merge will follow whatever order is shown here.

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('files-input');
  const previewList = document.getElementById('preview-list');
  const form = document.getElementById('merge-form');
  if (!input || !previewList || !form) return;

  let fileOrder = [];

  input.addEventListener('change', () => {
    fileOrder = Array.from(input.files);
    renderPreviews();
  });

  async function renderPreviews() {
    previewList.innerHTML = '';
    if (fileOrder.length === 0) return;

    const hint = document.createElement('p');
    hint.className = 'preview-hint';
    hint.textContent = 'Drag the cards below to change the merge order.';
    previewList.appendChild(hint);

    const grid = document.createElement('div');
    grid.className = 'preview-grid';
    previewList.appendChild(grid);

    fileOrder.forEach((file, i) => {
      const item = document.createElement('div');
      item.className = 'preview-item';
      item.draggable = true;
      item.dataset.index = String(i);

      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'preview-thumb loading';
      thumbWrap.innerHTML = '<span class="spinner">Loading…</span>';
      item.appendChild(thumbWrap);

      const label = document.createElement('div');
      label.className = 'preview-label';
      label.textContent = `${i + 1}. ${file.name}`;
      item.appendChild(label);

      grid.appendChild(item);

      window.PdfPreview.loadPdfFromFile(file)
        .then(async (pdf) => {
          const canvas = await window.PdfPreview.renderPageToCanvas(pdf, 1, 110);
          thumbWrap.classList.remove('loading');
          thumbWrap.innerHTML = '';
          thumbWrap.appendChild(canvas);
          const badge = document.createElement('span');
          badge.className = 'page-count-badge';
          badge.textContent = `${pdf.numPages}p`;
          thumbWrap.appendChild(badge);
        })
        .catch(() => {
          thumbWrap.classList.remove('loading');
          thumbWrap.innerHTML = '<span class="preview-error">⚠️ Preview failed</span>';
        });
    });

    attachDragHandlers(grid);
  }

  function attachDragHandlers(grid) {
    let dragSrcIndex = null;

    grid.querySelectorAll('.preview-item').forEach((item) => {
      item.addEventListener('dragstart', (e) => {
        dragSrcIndex = Number(item.dataset.index);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', () => item.classList.remove('dragging'));
      item.addEventListener('dragover', (e) => e.preventDefault());
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetIndex = Number(item.dataset.index);
        if (dragSrcIndex === null || dragSrcIndex === targetIndex) return;
        const [moved] = fileOrder.splice(dragSrcIndex, 1);
        fileOrder.splice(targetIndex, 0, moved);
        renderPreviews();
      });
    });
  }

  // On submit, rebuild the file input's FileList to match the reordered
  // preview — the server merges files in whatever order it receives them.
  form.addEventListener('submit', () => {
    if (fileOrder.length === 0) return;
    const dt = new DataTransfer();
    fileOrder.forEach((file) => dt.items.add(file));
    input.files = dt.files;
  });
});
