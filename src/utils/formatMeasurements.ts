function oneDecimal(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

export function formatHeight(decimetres: number): string {
  return `${oneDecimal(decimetres / 10)} m`;
}

export function formatWeight(hectograms: number): string {
  return `${oneDecimal(hectograms / 10)} kg`;
}
