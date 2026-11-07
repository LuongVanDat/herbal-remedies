import { expect, test } from 'vitest'
import { docTc, ghiTc } from '../../src/url-state'

test('docTc bỏ rỗng, khử trùng, đếm mã lạ', () =>
  expect(docTc(',a,,a,zz,', new Set(['a', 'b']))).toEqual({ ids: ['a'], boQua: 1 }))
test('docTc chuỗi rỗng', () => expect(docTc('', new Set(['a']))).toEqual({ ids: [], boQua: 0 }))
test('ghiTc([]) = ""; ghiTc(["a","b"]) = "a,b"', () => {
  expect(ghiTc([])).toBe('')
  expect(ghiTc(['a', 'b'])).toBe('a,b')
})
