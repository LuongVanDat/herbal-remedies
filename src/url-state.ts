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
