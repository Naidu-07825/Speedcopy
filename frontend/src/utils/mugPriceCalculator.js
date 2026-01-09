export function calculateMugPrice({
  mugType,
  printSide,
  quantity,
}) {
  let basePrice = 199;

  if (mugType === "magic") basePrice = 299;
  if (mugType === "premium") basePrice = 249;

  let printPrice = printSide === "both" ? 50 : 0;

  let singlePrice = basePrice + printPrice;
  let total = singlePrice * quantity;

  if (quantity >= 10) {
    total *= 0.9; 
  }

  return Math.round(total);
}
