export async function downloadNodeAsPng(node, fileName) {
  const { toPng } = await import('html-to-image');
  await document.fonts?.ready;

  const dataUrl = await toPng(node, {
    pixelRatio: Math.max(3, window.devicePixelRatio || 1),
    // The clone keeps mx-auto margins, which crops the image.
    style: { margin: '0' },
  });

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
