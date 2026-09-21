// Numeração brasileira usual para calçados femininos.
export const SHOE_SIZES: number[] = [];
for (let size = 33; size <= 41; size += 1) {
  SHOE_SIZES.push(size);
}

export function formatSize(size: number) {
  return Number.isInteger(size) ? String(size) : size.toFixed(1);
}
