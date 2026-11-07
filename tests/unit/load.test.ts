import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { loadData } from '../../src/load'
import { FIXTURE_DIR } from '../helpers'

const tmp: string[] = []
const banSao = () => {
  const d = mkdtempSync(join(tmpdir(), 'btdy-'))
  tmp.push(d)
  cpSync(FIXTURE_DIR, d, { recursive: true })
  return d
}
afterEach(() => tmp.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })))

test('loadData fixture hợp lệ: không lỗi schema, đủ số file', async () => {
  const { raw, loiSchema } = await loadData(FIXTURE_DIR)
  expect(loiSchema).toEqual([])
  expect([raw.benh.length, raw.baiThuoc.length, raw.viThuoc.length]).toEqual([1, 2, 5])
  expect(raw.nguon.data.van_ban[0].ma).toBe('test')
})

test('file YAML rỗng → 1 lỗi schema đúng tên file, không throw', async () => {
  const d = banSao()
  writeFileSync(join(d, 'vi-thuoc', 'rong.yaml'), '')
  const { loiSchema } = await loadData(d)
  expect(loiSchema).toHaveLength(1)
  expect(loiSchema[0]).toMatchObject({ ma: 'schema', file: expect.stringContaining('rong.yaml') })
})

test('lỗi schema có truong là path dạng a[0].b', async () => {
  const d = banSao()
  writeFileSync(join(d, 'bai-thuoc', 'x.yaml'),
    'id: x\nten: X\nthanh_phan:\n  - { vi: que-chi, lieu_g: "12-16", vai_tro: null }\ncach_dung: a\nnguon: { ma: test, trang: 1, trang_thai: chua_doi_chieu }\n')
  const { loiSchema } = await loadData(d)
  expect(loiSchema.map((v) => v.truong)).toEqual(['thanh_phan[0].lieu_g'])
})

test('YAML sai cú pháp → lỗi schema, không throw', async () => {
  const d = banSao()
  writeFileSync(join(d, 'benh', 'hong.yaml'), 'id: [a\n')
  const { loiSchema } = await loadData(d)
  expect(loiSchema).toHaveLength(1)
})

test('thiếu thư mục bai-thuoc → coi như rỗng, không throw', async () => {
  const d = banSao()
  rmSync(join(d, 'bai-thuoc'), { recursive: true })
  const { raw, loiSchema } = await loadData(d)
  expect(loiSchema).toEqual([])
  expect(raw.baiThuoc).toEqual([])
})

test('chỉ đọc .yaml/.yml', async () => {
  const d = banSao()
  writeFileSync(join(d, 'vi-thuoc', 'README.md'), '# ghi chú')
  writeFileSync(join(d, 'vi-thuoc', '.gitkeep'), '')
  const { loiSchema, raw } = await loadData(d)
  expect(loiSchema).toEqual([])
  expect(raw.viThuoc).toHaveLength(5)
})
