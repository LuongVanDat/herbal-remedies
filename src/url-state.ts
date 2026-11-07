export function docTc(raw: string, hopLe: Set<string>): { ids: string[]; boQua: number } {
  const ids: string[] = []
  let boQua = 0
  for (const id of new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))) {
    if (hopLe.has(id)) ids.push(id)
    else boQua++
  }
  return { ids, boQua }
}

export function ghiTc(ids: string[]): string {
  return ids.join(',')
}

const tcGanNhat = new Map<string, string>()
/** Ghi nhớ triệu chứng đã tích gần nhất của mỗi bệnh (trong phiên) để link "← bệnh" giữ trạng thái. */
export const ghiNhoTc = (benhId: string, tc: string) => void tcGanNhat.set(benhId, tc)
export const layTcGanNhat = (benhId: string): string => tcGanNhat.get(benhId) ?? ''
