import { expect, test } from 'vitest'
import { CAU_HINH } from '../../src/config'
import { xepHang } from '../../src/scoring'
import { taiFixtureHopLe } from '../helpers'

const camMao = taiFixtureHopLe().benh[0].data
const tim = (r: ReturnType<typeof xepHang>, id: string) => r.ketQua.find((k) => k.theId === id)!

test('cấu hình đúng spec', () =>
  expect(CAU_HINH).toEqual({ heSoChinh: 2, heSoPhu: 1, heSoLoaiTru: 2, nguongSatNhau: 0.15, nguongKhop: 0.5 }))

test('khớp đủ phong hàn', () => {
  const r = xepHang(camMao, new Set(['so-lanh-nhieu', 'khong-mo-hoi', 'dau-dau', 'reu-luoi-trang-mong']))
  expect(r.ketQua[0]).toMatchObject({ theId: 'phong-han', diem: 1, thieu: [], mauThuan: [] })
  expect(r.khongRo).toBe(false)
  expect(r.khoPhanBiet).toBeNull()
})

test('điểm = (dat − tru)/toiDa', () => {
  // phong-nhiet: toiDa 2*2+2=6; tích sot-cao(2)+dau-dau(1)+so-lanh-nhieu(loại trừ −2) → 1/6
  const r = xepHang(camMao, new Set(['sot-cao', 'dau-dau', 'so-lanh-nhieu']))
  const pn = tim(r, 'phong-nhiet')
  expect(pn.diem).toBeCloseTo(1 / 6)
  expect(pn.mauThuan).toEqual(['so-lanh-nhieu'])
  expect(pn.khop).toEqual(['sot-cao', 'dau-dau'])
  expect(pn.thieu).toEqual(['ra-mo-hoi', 'khat-nuoc'])
})

test('điểm không âm', () => {
  const r = xepHang(camMao, new Set(['sot-cao', 'khat-nuoc']))
  expect(tim(r, 'phong-han').diem).toBe(0)
})

test('khoPhanBiet khi chênh < 0.15, kèm hiệu đối xứng', () => {
  const r = xepHang(camMao, new Set(['dau-dau']))
  expect(r.khoPhanBiet).toEqual({
    a: 'phong-han',
    b: 'phong-nhiet',
    trieuChungPhanBiet: ['so-lanh-nhieu', 'khong-mo-hoi', 'reu-luoi-trang-mong', 'sot-cao', 'ra-mo-hoi', 'khat-nuoc'],
  })
})

test('không khoPhanBiet khi chênh ≥ 0.15', () => {
  const r = xepHang(camMao, new Set(['so-lanh-nhieu']))   // 2/6 vs 0
  expect(r.khoPhanBiet).toBeNull()
})

test('khongRo khi đầu bảng < 0.5 và đã tích', () => {
  expect(xepHang(camMao, new Set(['dau-dau'])).khongRo).toBe(true)
  expect(xepHang(camMao, new Set(['so-lanh-nhieu', 'khong-mo-hoi'])).khongRo).toBe(false) // 4/6
})

test('chưa tích gì: daTichGi=false, khongRo=false, khoPhanBiet=null', () => {
  const r = xepHang(camMao, new Set())
  expect(r).toMatchObject({ daTichGi: false, khongRo: false, khoPhanBiet: null, nguyHiem: [] })
  expect(r.ketQua.map((k) => k.theId)).toEqual(['phong-han', 'phong-nhiet'])
})

test('nguyHiem trả id dấu hiệu đã tích; không ảnh hưởng điểm', () => {
  const r = xepHang(camMao, new Set(['sot-cao-keo-dai']))
  expect(r.nguyHiem).toEqual(['sot-cao-keo-dai'])
  expect(r.daTichGi).toBe(false)
  expect(r.ketQua.every((k) => k.diem === 0)).toBe(true)
})

test('mã lạ trong daTich bị bỏ qua', () => {
  expect(xepHang(camMao, new Set(['khong-ton-tai'])).daTichGi).toBe(false)
})

test('bằng điểm giữ thứ tự khai báo', () => {
  const dao = { ...camMao, the_benh: [...camMao.the_benh].reverse() }
  expect(xepHang(dao, new Set(['dau-dau'])).ketQua.map((k) => k.theId)).toEqual(['phong-nhiet', 'phong-han'])
})

test('bệnh 1 thể: khoPhanBiet null', () => {
  const mot = { ...camMao, the_benh: [camMao.the_benh[0]] }
  expect(xepHang(mot, new Set(['dau-dau'])).khoPhanBiet).toBeNull()
})
