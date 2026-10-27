export function selectCatalog<T extends { reviewStatus: string }>(
  icons: T[],
  mode: 'outline' | 'public',
) {
  const approved = icons.filter((icon) => icon.reviewStatus === 'approved');
  return mode === 'outline' ? approved.slice(0, 12) : approved;
}
