export function getProductImageSrc(productId: string): string {
  const match = productId.match(/\d+/);
  const numericId = match ? Number(match[0]) : 1;
  const imageIndex = ((Number.isFinite(numericId) ? numericId : 1) - 1) % 9 + 1;

  return `/images/cloth${imageIndex}.jpg`;
}
