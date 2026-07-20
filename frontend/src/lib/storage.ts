// 이 파일은 브라우저 저장소에 JSON 데이터를 읽고 쓰는 공통 유틸을 제공합니다.
export function parseJsonSafe<T>(raw: string | null): T | null {
  if (raw == null || raw === "") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
