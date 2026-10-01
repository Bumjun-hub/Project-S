export type PageData<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export function paginate<T>(items: T[], page: number, size: number): PageData<T> {
  return { content: items.slice(page * size, (page + 1) * size), page, size, totalElements: items.length, totalPages: Math.ceil(items.length / size) };
}
