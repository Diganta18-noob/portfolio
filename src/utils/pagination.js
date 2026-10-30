export function paginate(items, requestedPage, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.max(1, Math.min(requestedPage, totalPages));
  return {page,totalPages,items:items.slice((page-1)*pageSize,page*pageSize)};
}
