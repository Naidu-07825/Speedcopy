export function calculatePhotoFramePrice({
  frameType,
  size,
  finish,
  quantity,
}) {
  let basePrice = 199;

  if (frameType === "wooden") basePrice = 349;
  if (frameType === "canvas") basePrice = 499;

  let sizeExtra = 0;
  if (size === "8x10") sizeExtra = 50;
  if (size === "12x18") sizeExtra = 150;

  let finishExtra = finish === "glossy" ? 40 : 0;

  let singlePrice = basePrice + sizeExtra + finishExtra;
  let total = singlePrice * quantity;

  if (quantity >= 10) {
    total *= 0.9;
  }

  return Math.round(total);
}
