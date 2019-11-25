import { $ } from "../globals";

function data(id) {
  const img = $(`#${id} img`).get(0) as CanvasImageSource;
  const width = img.width as number;
  const height = img.height as number;
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  context.drawImage(img, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);

  return imageData.data;
}

export { data };
