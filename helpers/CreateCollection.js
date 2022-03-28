// LAYERS structure
// const LAYERS = [{elements: [{file}], weight} ]

export function CreateCanvas({ width = 512, height = 512 }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function CreateImage({ file: src }) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;

    image.onload = () => {
      resolve(image);
    };

    image.onerror = (error) => reject(error);
  });
}

export default async function CreateCollection({
  layers,
  collectionSize,
  canvasWidth,
  canvasHeight,
}) {
  const width = canvasWidth;
  const height = canvasHeight;

  // Create canvas
  const canvas = CreateCanvas({ width, height });
  const ctx = canvas.getContext("2d");
  let editionCount = 1;

  const previewImages = [];

  while (
    // range for the num of images to create
    editionCount <= collectionSize
  ) {
    const previewImage = [];

    layers.forEach((layer) => {
      // Get images
      const images = layer.elements;
      // number between 0 - images size
      const random = Math.floor(Math.random() * images.length);
      // Get images in random pos
      const image = images[random];

      // Validate if show layer
      const randomLayerRarity = Math.floor(Math.random() * 100);
      const layerRarity = layer.weight ? Number(layer.weight) : 100;
      if (randomLayerRarity <= layerRarity) {
        // Add to preview image
        previewImage.push(image);
      }
    });

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const promise = previewImage.map(async (image, index) => {
      const src = URL.createObjectURL(image.file);

      const imageCanvas = await CreateImage({ file: src });
      previewImage[index].imageCanvas = imageCanvas;
    });

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(promise);

    previewImage.map(async (image) => {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      const weightImage = image.imageCanvas.width * percentage;
      const heightImage = image.imageCanvas.height * percentage;
      ctx.drawImage(image.imageCanvas, 0, 0, weightImage, heightImage);
    });

    // Convert canvas to base64
    const base64 = canvas.toDataURL("image/png");

    // Save image
    previewImages.push(base64);

    editionCount += 1;
  }

  return Promise.resolve(previewImages);
}
