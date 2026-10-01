"use client";

type Props = { page: number; totalPages: number; onChange: (page: number) => void; busy?: boolean };

export function Pagination({ page, totalPages, onChange, busy = false }: Props) {
  if (totalPages <= 1) return null;
  return <nav aria-label="목록 페이지" className="pagination">
    <button type="button" disabled={busy || page === 0} onClick={() => onChange(page - 1)}>이전</button>
    <span role="status">{page + 1} / {totalPages}</span>
    <button type="button" disabled={busy || page + 1 >= totalPages} onClick={() => onChange(page + 1)}>다음</button>
  </nav>;
}
