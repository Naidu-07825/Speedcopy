export const calculatePrintPrice = ({
  pages,
  copies,
  color,
  sides,
  size,
  binding,
  lamination,
  urgent,
  distanceKm,
}) => {
  let rate = 0;

  
  if (color === "bw" && sides === "single") rate = 1.5;
  if (color === "bw" && sides === "double") rate = 2;
  if (color === "color" && sides === "single") rate = 10;
  if (color === "color" && sides === "double") rate = 20;

  
  const sizeMultiplier = size === "A3" ? 2 : 1;

 
  let total =
    pages * rate * copies * sizeMultiplier;

 
  if (binding === "spiral") total += 30;
  if (binding === "staple") total += 45;

  
  if (lamination) total += copies * 30;
  if (urgent) total += 50;

  
  if (distanceKm > 0) total += distanceKm * 5;

  return Math.round(total);
};
