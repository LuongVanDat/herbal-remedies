import { expect, test } from 'vitest'
import { validate, type MaQuyTac } from '../../src/validate'
import { sua, taiFixtureHopLe } from '../helpers'

const ok = taiFixtureHopLe()
const bai = (r: ReturnType<typeof taiFixtureHopLe>, id: string) => r.baiThuoc.find((b) => b.data.id === id)!.data
const vi = (r: ReturnType<typeof taiFixtureHopLe>, id: string) => r.viThuoc.find((v) => v.data.id === id)!.data
const camMao = (r: ReturnType<typeof taiFixtureHopLe>) => r.benh[0].data
const loi = (r: ReturnType<typeof taiFixtureHopLe>, ma: MaQuyTac) => validate(r).loi.filter((v) => v.ma === ma)
const canhBao = (r: ReturnType<typeof taiFixtureHopLe>, ma: MaQuyTac) => validate(r).canhBao.filter((v) => v.ma === ma)

test('fixture hợp lệ: không lỗi', () => expect(validate(ok).loi).toEqual([]))

test('vuot-lieu', () => {
  const raw = sua(ok, (r) => { bai(r, 'ma-hoang-thang').thanh_phan[0].lieu_g = 999 })
  expect(validate(raw).loi).toContainEqual(expect.objectContaining({
    ma: 'vuot-lieu', file: expect.stringContaining('ma-hoang-thang'), truong: 'thanh_phan[0].lieu_g',
  }))
})
test('vuot-lieu được phép khi có vuot_lieu_ly_do', () => {
  const raw = sua(ok, (r) => {
    bai(r, 'ma-hoang-thang').thanh_phan[0].lieu_g = 999
    bai(r, 'ma-hoang-thang').thanh_phan[0].vuot_lieu_ly_do = 'Văn bản gốc ghi như vậy'
  })
  expect(loi(raw, 'vuot-lieu')).toEqual([])
})
test('vuot-lieu không xét khi lieu_dung null (chỉ cảnh báo chua-co-lieu)', () => {
  const raw = sua(ok, (r) => { bai(r, 'ma-hoang-thang').thanh_phan[2].lieu_g = 999 }) // cam-thao: lieu_dung null
  expect(loi(raw, 'vuot-lieu')).toEqual([])
  expect(canhBao(raw, 'chua-co-lieu').map((v) => v.file)).toEqual([expect.stringContaining('cam-thao')])
})
test('liều đúng bằng max_g không lỗi', () => {
  const raw = sua(ok, (r) => { bai(r, 'ma-hoang-thang').thanh_phan[0].lieu_g = 10 })
  expect(loi(raw, 'vuot-lieu')).toEqual([])
})

test('tham-chieu: vị trong bài thuốc', () => {
  expect(loi(sua(ok, (r) => { bai(r, 'ngan-kieu-tan').thanh_phan[0].vi = 'khong-co' }), 'tham-chieu')).toHaveLength(1)
})
test('tham-chieu: bài thuốc trong thể bệnh', () => {
  expect(loi(sua(ok, (r) => { camMao(r).the_benh[0].bai_thuoc.push('khong-co') }), 'tham-chieu')).toHaveLength(1)
})
test('tham-chieu: triệu chứng chinh/phu/loai_tru', () => {
  const raw = sua(ok, (r) => {
    const t = camMao(r).the_benh[0]
    t.trieu_chung.chinh.push('x-1'); t.trieu_chung.phu.push('x-2'); t.loai_tru.push('x-3')
  })
  expect(loi(raw, 'tham-chieu').map((v) => v.truong)).toEqual([
    'the_benh[0].trieu_chung.chinh[2]', 'the_benh[0].trieu_chung.phu[2]', 'the_benh[0].loai_tru[2]',
  ])
})
test('tham-chieu: thay_the.vi', () => {
  expect(loi(sua(ok, (r) => { vi(r, 'cam-thao').thay_the[0].vi = 'khong-co' }), 'tham-chieu')).toHaveLength(1)
})
test('tham-chieu: nguon.ma ở thể, bài, vị, lieu_dung', () => {
  const raw = sua(ok, (r) => {
    camMao(r).the_benh[0].nguon.ma = 'khong-co'
    bai(r, 'ngan-kieu-tan').nguon.ma = 'khong-co'
    vi(r, 'que-chi').nguon.ma = 'khong-co'
    vi(r, 'que-chi').lieu_dung!.nguon!.ma = 'khong-co'
  })
  expect(loi(raw, 'tham-chieu')).toHaveLength(4)
})

test('trung-id trong cùng loại; cùng id khác loại thì không lỗi', () => {
  const raw = sua(ok, (r) => { r.viThuoc.push(structuredClone(r.viThuoc[0])) })
  expect(loi(raw, 'trung-id')).toHaveLength(1)
  const khacLoai = sua(ok, (r) => { bai(r, 'ngan-kieu-tan').id = 'que-chi'; camMao(r).the_benh[1].bai_thuoc = ['que-chi'] })
  expect(validate(khacLoai).loi).toEqual([])
})
test('trung-id: triệu chứng trùng giữa hai nhóm, thể trùng trong một bệnh', () => {
  const raw = sua(ok, (r) => {
    r.trieuChung.data.nhom[1].trieu_chung.push({ id: 'sot-cao', ten: 'Sốt cao (trùng)' })
    camMao(r).the_benh[1].id = 'phong-han'
  })
  expect(loi(raw, 'trung-id')).toHaveLength(2)
})

test('thieu-nguon khi lieu_dung có mà không có nguồn', () => {
  expect(loi(sua(ok, (r) => { delete vi(r, 'que-chi').lieu_dung!.nguon }), 'thieu-nguon')).toHaveLength(1)
})

test('thieu-canh-bao khi muc co/rat_doc và canh_bao null hoặc ""', () => {
  expect(loi(sua(ok, (r) => { vi(r, 'phu-tu-che').doc_tinh.canh_bao = null }), 'thieu-canh-bao')).toHaveLength(1)
  expect(loi(sua(ok, (r) => { vi(r, 'phu-tu-che').doc_tinh = { muc: 'rat_doc', canh_bao: '  ' } }), 'thieu-canh-bao')).toHaveLength(1)
})

test('mau-thuan-loai-tru', () => {
  expect(loi(sua(ok, (r) => { camMao(r).the_benh[0].loai_tru.push('dau-dau') }), 'mau-thuan-loai-tru')).toHaveLength(1)
})

test('canhBao chứa thay-the-chua-xac-minh cho cam-thao', () => {
  expect(canhBao(ok, 'thay-the-chua-xac-minh').map((v) => v.file)).toEqual([expect.stringContaining('cam-thao')])
})
test('chua-doi-chieu tổng hợp một dòng mỗi mã nguồn', () => {
  const c = canhBao(ok, 'chua-doi-chieu')
  expect(c).toHaveLength(1)
  expect(c[0].thongDiep).toMatch(/^test: \d+ mục chưa đối chiếu$/)
})
test('the-trung-nhau khi 2 thể cùng bộ chinh∪phu', () => {
  const raw = sua(ok, (r) => {
    const [a, b] = camMao(r).the_benh
    b.trieu_chung = { chinh: [...a.trieu_chung.phu], phu: [...a.trieu_chung.chinh] }
    b.loai_tru = []
  })
  expect(canhBao(raw, 'the-trung-nhau')).toHaveLength(1)
})
test('khong-duoc-dung cho triệu chứng khai báo mà không thể nào dùng', () => {
  const raw = sua(ok, (r) => { r.trieuChung.data.nhom[0].trieu_chung.push({ id: 'ho-khan', ten: 'Ho khan' }) })
  expect(canhBao(raw, 'khong-duoc-dung').map((v) => v.thongDiep)).toEqual([expect.stringContaining('ho-khan')])
})
test('khong-duoc-dung cho vị thuốc không bài nào dùng', () => {
  const raw = sua(ok, (r) => { const v = structuredClone(vi(r, 'que-chi')); v.id = 'bach-chi'; r.viThuoc.push({ file: 'x/bach-chi.yaml', data: v }) })
  expect(canhBao(raw, 'khong-duoc-dung').map((v) => v.file)).toEqual(['x/bach-chi.yaml'])
})

test('trung-id: bài thuốc lặp trong một thể bệnh', () => {
  const raw = sua(ok, (r) => { camMao(r).the_benh[0].bai_thuoc.push('ma-hoang-thang') })
  expect(loi(raw, 'trung-id').map((v) => v.truong)).toEqual(['the_benh[0].bai_thuoc[1]'])
})
test('trung-id: dấu hiệu nguy hiểm trùng id triệu chứng dùng chung', () => {
  const raw = sua(ok, (r) => { camMao(r).dau_hieu_nguy_hiem[0].id = 'sot-cao' })
  expect(loi(raw, 'trung-id').map((v) => v.truong)).toEqual(['dau_hieu_nguy_hiem[0].id'])
})
