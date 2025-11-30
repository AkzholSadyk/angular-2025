/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const { file, quality } = data;

  if (!file || !(file instanceof File)) {
    postMessage({ error: 'Invalid file provided.' });
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Базовое сжатие: уменьшаем размер до 800px по большей стороне
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Конвертация в Blob с заданным качеством (0.7 по умолчанию)
      canvas.toBlob((blob) => {
        if (blob) {
          // Отправляем сжатый Blob обратно в основной поток
          postMessage({ compressedBlob: blob, originalFileName: file.name });
        } else {
          postMessage({ error: 'Compression failed.' });
        }
      }, 'image/jpeg', quality || 0.7);
    };
    img.src = e.target.result as string;
  };
  reader.readAsDataURL(file);
});
