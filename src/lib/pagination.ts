export function paginate<T>(items: T[], requestedPage: number) {
  const size = 48;
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const page = Math.max(1, Math.min(pageCount, Math.trunc(requestedPage) || 1));
  return { page, pageCount, items: items.slice((page - 1) * size, page * size) };
}
