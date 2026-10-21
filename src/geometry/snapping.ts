export function snap(
  value: number,
  gridSize: number
): number {
  return Math.round(value / gridSize) * gridSize
}
