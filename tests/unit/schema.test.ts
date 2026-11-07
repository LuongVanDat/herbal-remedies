import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { parse } from 'yaml'
import {
  BaiThuocSchema, BenhSchema, IdSchema, NguonFileSchema, NguonRefSchema,
  TrieuChungFileSchema, ViThuocSchema,
} from '../../src/schema'

const DIR = 'tests/fixtures/valid'
const doc = (p: string) => parse(readFileSync(join(DIR, p), 'utf8'))

test('mọi file trong fixtures/valid parse thành công', () => {
  const pairs = [['benh', BenhSchema], ['bai-thuoc', BaiThuocSchema], ['vi-thuoc', ViThuocSchema]] as const
  for (const [dir, schema] of pairs) {
    for (const f of readdirSync(join(DIR, dir))) {
      const r = schema.safeParse(doc(join(dir, f)))
      expect(r.error?.issues, `${dir}/${f}`).toBeUndefined()
    }
  }
  expect(NguonFileSchema.safeParse(doc('nguon.yaml')).success).toBe(true)
  expect(TrieuChungFileSchema.safeParse(doc('trieu-chung.yaml')).success).toBe(true)
})

test('id có dấu hoặc viết hoa bị từ chối', () => {
  expect(IdSchema.safeParse('Cam-mao').success).toBe(false)
  expect(IdSchema.safeParse('cảm-mạo').success).toBe(false)
  expect(IdSchema.safeParse('cam--mao').success).toBe(false)
  expect(IdSchema.safeParse('cam-mao-2').success).toBe(true)
})

test('NguonRef thiếu cả trang và muc bị từ chối', () => {
  expect(NguonRefSchema.safeParse({ ma: 'test', trang_thai: 'chua_doi_chieu' }).success).toBe(false)
  expect(NguonRefSchema.safeParse({ ma: 'test', muc: 'Điều 2', trang_thai: 'da_doi_chieu' }).success).toBe(true)
})

test('lieu_g dạng chuỗi "12-16" bị từ chối, lỗi chỉ ra path thanh_phan.0.lieu_g', () => {
  const baiHopLe = doc('bai-thuoc/ma-hoang-thang.yaml')
  const r = BaiThuocSchema.safeParse({ ...baiHopLe, thanh_phan: [{ vi: 'que-chi', lieu_g: '12-16', vai_tro: null }] })
  expect(r.success).toBe(false)
  expect(r.error!.issues[0].path).toEqual(['thanh_phan', 0, 'lieu_g'])
})

test('trường lạ bị từ chối (strict)', () => {
  const v = doc('vi-thuoc/que-chi.yaml')
  expect(ViThuocSchema.safeParse({ ...v, lieu: 5 }).success).toBe(false)
  const b = doc('benh/cam-mao.yaml')
  b.the_benh[0].trieu_chung.chin = []
  expect(BenhSchema.safeParse(b).success).toBe(false)
})

test('thể bệnh không có triệu chứng chính bị từ chối', () => {
  const b = doc('benh/cam-mao.yaml')
  b.the_benh[0].trieu_chung.chinh = []
  expect(BenhSchema.safeParse(b).success).toBe(false)
})

test('mặc định: loai_tru, ten_khac, dau_hieu_nguy_hiem = []; vuot_lieu_ly_do = null', () => {
  const b = doc('benh/cam-mao.yaml')
  delete b.ten_khac; delete b.dau_hieu_nguy_hiem; delete b.the_benh[0].loai_tru
  const r = BenhSchema.parse(b)
  expect(r.ten_khac).toEqual([]); expect(r.dau_hieu_nguy_hiem).toEqual([]); expect(r.the_benh[0].loai_tru).toEqual([])
  expect(BaiThuocSchema.parse(doc('bai-thuoc/ma-hoang-thang.yaml')).thanh_phan[0].vuot_lieu_ly_do).toBeNull()
})

test('mở rộng cho dữ liệu QĐ 5013: tên trong bài, liều dạng chữ, loại bài, mô tả thể', () => {
  const b = doc('bai-thuoc/ma-hoang-thang.yaml')
  b.loai = 'co_phuong'
  b.thanh_phan.push({ vi: 'cam-thao', ten_trong_bai: 'Chích thảo', lieu_g: 6, vai_tro: null })
  b.thanh_phan.push({ vi: 'que-chi', lieu_g: null, lieu_text: 'vừa đủ', vai_tro: null })
  const r = BaiThuocSchema.parse(b)
  expect(r.thanh_phan[4].ten_trong_bai).toBe('Chích thảo')
  expect(r.thanh_phan[5]).toMatchObject({ lieu_g: null, lieu_text: 'vừa đủ' })
  const be = doc('benh/cam-mao.yaml')
  be.the_benh[0].mo_ta = 'Thường gặp do lạnh.'
  expect(BenhSchema.parse(be).the_benh[0].mo_ta).toBe('Thường gặp do lạnh.')
})

test('thành phần phải có lieu_g hoặc lieu_text', () => {
  const b = doc('bai-thuoc/ma-hoang-thang.yaml')
  b.thanh_phan = [{ vi: 'que-chi', lieu_g: null, vai_tro: null }]
  expect(BaiThuocSchema.safeParse(b).success).toBe(false)
})

test('vị thuốc: độc tính chưa rõ, phổ biến chưa có, nguồn gốc, tên cây, không bắt buộc bộ phận dùng', () => {
  const v = doc('vi-thuoc/que-chi.yaml')
  v.doc_tinh = { muc: 'chua_ro', canh_bao: null }
  v.pho_bien = null
  v.nguon_goc = 'ca_hai'
  v.ten_cay = 'Cinnamomum cassia Presl - Lauraceae'
  delete v.bo_phan_dung
  const r = ViThuocSchema.parse(v)
  expect(r).toMatchObject({ doc_tinh: { muc: 'chua_ro' }, pho_bien: null, nguon_goc: 'ca_hai' })
  expect(ViThuocSchema.safeParse({ ...v, nguon_goc: 'khac' }).success).toBe(false)
})
