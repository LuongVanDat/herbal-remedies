import { expect, test } from 'vitest'
import { href, parseHash, type Route } from '../../src/router'

test.each<[string, Route]>([
  ['', { ten: 'chu' }],
  ['#/', { ten: 'chu' }],
  ['#/benh/cam-mao', { ten: 'benh', id: 'cam-mao', tc: '' }],
  ['#/benh/cam-mao?tc=a,b', { ten: 'benh', id: 'cam-mao', tc: 'a,b' }],
  ['#/benh/cam-mao/phong-han', { ten: 'the', benhId: 'cam-mao', theId: 'phong-han' }],
  ['#/vi', { ten: 'dsVi' }],
  ['#/vi/que-chi', { ten: 'vi', id: 'que-chi' }],
  ['#/nguon', { ten: 'nguon' }],
  ['#/xyz', { ten: 'khongThay' }],
  ['#/benh', { ten: 'khongThay' }],
  ['#/benh/a/b/c', { ten: 'khongThay' }],
])('parseHash(%s)', (h, r) => expect(parseHash(h)).toEqual(r))

test('href ∘ parseHash là đồng nhất', () => {
  const routes: Route[] = [
    { ten: 'chu' },
    { ten: 'benh', id: 'cam-mao', tc: '' },
    { ten: 'benh', id: 'cam-mao', tc: 'a,b' },
    { ten: 'the', benhId: 'cam-mao', theId: 'phong-han' },
    { ten: 'dsVi' },
    { ten: 'vi', id: 'que-chi' },
    { ten: 'nguon' },
  ]
  for (const r of routes) expect(parseHash(href(r))).toEqual(r)
})

test('URL có mã thoát hỏng → khongThay, không ném lỗi', () => {
  expect(parseHash('#/vi/%')).toEqual({ ten: 'khongThay' })
  expect(parseHash('#/benh/%E0%A4%A')).toEqual({ ten: 'khongThay' })
})
