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

test('lỗi liều dạng khoảng có thông báo tiếng Việt gợi ý rõ', async () => {
  const d = banSao()
  writeFileSync(join(d, 'bai-thuoc', 'x.yaml'),
    'id: x\nten: X\nthanh_phan:\n  - { vi: que-chi, lieu_g: "12-16", vai_tro: null }\ncach_dung: a\nnguon: { ma: test, trang: 1, trang_thai: chua_doi_chieu }\n')
  const { loiSchema } = await loadData(d)
  expect(loiSchema[0].thongDiep).toBe('Liều phải là một số (gam). Liều dạng khoảng (vd "12-16") chưa được hỗ trợ')
})

test('lỗi schema thông thường bằng tiếng Việt: trường lạ, sai kiểu, danh sách rỗng, giá trị enum', async () => {
  const d = banSao()
  writeFileSync(join(d, 'vi-thuoc', 'y.yaml'), [
    'id: y', 'ten: 5', 'ten_khoa_hoc: Y', 'bo_phan_dung: Rễ', 'lieu_dung: null', 'lieu: 3',
    'doc_tinh: { muc: doc, canh_bao: null }', 'pho_bien: { muc: cao, can_cu: x }',
    'nguon: { ma: test, trang: 1, trang_thai: chua_doi_chieu }',
  ].join('\n'))
  writeFileSync(join(d, 'bai-thuoc', 'z.yaml'),
    'id: z\nten: Z\nthanh_phan: []\ncach_dung: a\nnguon: { ma: test, trang: 1, trang_thai: chua_doi_chieu }\n')
  const { loiSchema } = await loadData(d)
  const m = Object.fromEntries(loiSchema.map((v) => [v.truong || '(gốc)', v.thongDiep]))
  expect(m['ten']).toBe('Sai kiểu: cần string, nhận number')
  expect(m['(gốc)']).toBe('Trường lạ: lieu')
  expect(m['doc_tinh.muc']).toBe('Giá trị phải là một trong: khong, it, co, rat_doc, chua_ro')
  expect(m['thanh_phan']).toBe('Danh sách không được rỗng')
})
