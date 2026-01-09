export function calculateTshirtPrice({
  type,
  printSide,
  quantity,
}) {
  let basePrice = type === "cotton" ? 199 : 149;

  let printPrice = 0;
  if (printSide === "front") printPrice = 100;
  if (printSide === "back") printPrice = 100;
  if (printSide === "both") printPrice = 180;

  let singlePrice = basePrice + printPrice;
  let total = singlePrice * quantity;

  
  if (quantity >= 10) {
    total *= 0.9; 
  }

  return Math.round(total);
}
