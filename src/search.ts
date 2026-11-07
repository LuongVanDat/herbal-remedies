export function boDau(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function timKiem<T>(items: T[], q: string, truong: (t: T) => string[]): T[] {
  const tu = boDau(q).split(' ').filter(Boolean)
  if (tu.length === 0) return items
  return items.filter((it) => {
    const chuoi = boDau(truong(it).join(' '))
    return tu.every((w) => chuoi.includes(w))
  })
}
