import { expect, test } from 'vitest'
import { boDau, timKiem } from '../../src/search'

test('bỏ dấu và đ', () => expect(boDau('Cảm Mạo Đau đầu')).toBe('cam mao dau dau'))
test('NFD cho cùng kết quả NFC', () => expect(boDau('Cảm mạo'.normalize('NFD'))).toBe('cam mao'))
test('gộp khoảng trắng, trim', () => expect(boDau('  mất   ngủ ')).toBe('mat ngu'))
test('tìm theo nhiều trường, không dấu, theo từng từ', () => {
  const ds = [
    { ten: 'Cảm mạo', khac: ['cảm lạnh'] },
    { ten: 'Thất miên', khac: ['mất ngủ'] },
  ]
  expect(timKiem(ds, 'mat ngu', (t) => [t.ten, ...t.khac]).map((t) => t.ten)).toEqual(['Thất miên'])
  expect(timKiem(ds, 'lanh cam', (t) => [t.ten, ...t.khac])).toHaveLength(1)
  expect(timKiem(ds, '', (t) => [t.ten])).toHaveLength(2)
})
