export type Route =
  | { ten: 'chu' }
  | { ten: 'benh'; id: string; tc: string }
  | { ten: 'the'; benhId: string; theId: string }
  | { ten: 'dsVi' }
  | { ten: 'vi'; id: string }
  | { ten: 'nguon' }
  | { ten: 'khongThay' }

export function parseHash(hash: string): Route {
  const [duong, query = ''] = hash.replace(/^#/, '').split('?')
  let p: string[]
  try {
    p = duong.split('/').filter(Boolean).map(decodeURIComponent)
  } catch {
    return { ten: 'khongThay' }
  }
  const tc = new URLSearchParams(query).get('tc') ?? ''
  if (p.length === 0) return { ten: 'chu' }
  if (p[0] === 'benh' && p.length === 2) return { ten: 'benh', id: p[1], tc }
  if (p[0] === 'benh' && p.length === 3) return { ten: 'the', benhId: p[1], theId: p[2] }
  if (p[0] === 'vi' && p.length === 1) return { ten: 'dsVi' }
  if (p[0] === 'vi' && p.length === 2) return { ten: 'vi', id: p[1] }
  if (p[0] === 'nguon' && p.length === 1) return { ten: 'nguon' }
  return { ten: 'khongThay' }
}

export function href(r: Route): string {
  switch (r.ten) {
    case 'chu':
    case 'khongThay':
      return '#/'
    case 'benh':
      return `#/benh/${r.id}${r.tc ? `?tc=${r.tc}` : ''}`
    case 'the':
      return `#/benh/${r.benhId}/${r.theId}`
    case 'dsVi':
      return '#/vi'
    case 'vi':
      return `#/vi/${r.id}`
    case 'nguon':
      return '#/nguon'
  }
}
