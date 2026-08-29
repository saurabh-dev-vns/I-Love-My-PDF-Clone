// Live preview for the Image-to-PDF tool: shows the selected images as
// thumbnails, in the order they'll become PDF pages, with drag-to-reorder —
// same interaction pattern as the Merge tool's preview.

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('files-input');
  const previewList = document.getElementById('preview-list');
  const form = document.getElementById('image-form');
  if (!input || !previewList || !form) return;

  let fileOrder = [];

  input.addEventListener('change', () => {
    fileOrder = Array.from(input.files);
    renderPreviews();
  });

  function renderPreviews() {
    previewList.innerHTML = '';
    if (fileOrder.length === 0) return;

    const hint = document.createElement('p');
    hint.className = 'preview-hint';
    hint.textContent = 'Drag to reorder — each image becomes one PDF page, in this order.';
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
      thumbWrap.className = 'preview-thumb';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.className = 'preview-image';
      img.onload = () => URL.revokeObjectURL(img.src);
      thumbWrap.appendChild(img);
      item.appendChild(thumbWrap);

      const label = document.createElement('div');
      label.className = 'preview-label';
      label.textContent = `${i + 1}. ${file.name}`;
      item.appendChild(label);

      grid.appendChild(item);
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

  form.addEventListener('submit', () => {
    if (fileOrder.length === 0) return;
    const dt = new DataTransfer();
    fileOrder.forEach((file) => dt.items.add(file));
    input.files = dt.files;
  });
});
