import { describe, expect, it } from 'vitest'
import { docLieu, ghepLieu, khopLatin, tuDocAnh } from '../../scripts/trich/ddvn/lieu'

describe('docLieu — đọc liều ngày từ mục "Cách dùng, liều lượng" (OCR)', () => {
  it('khoảng "từ A g đến B g"', () => {
    expect(docLieu('Ngày dùng từ 3 g đến 9 g. Dạng thuốc sắc.')).toEqual({ min_g: 3, max_g: 9 })
  })
  it('chịu lỗi OCR thường gặp ở chữ "từ", "đến"', () => {
    expect(docLieu('Ngày dùng tử 6 g đên 12 g, dạng thuôc săc.')).toEqual({ min_g: 6, max_g: 12 })
    expect(docLieu('Ngày dùng tìr 9 g đển 15 g')).toEqual({ min_g: 9, max_g: 15 })
    expect(docLieu('N gày dùng 10 g dến 12 g; dạng thuốc sắc')).toEqual({ min_g: 10, max_g: 12 })
  })
  it('dạng "từ A đến B g" (chỉ ghi đơn vị ở số sau)', () => {
    expect(docLieu('Ngày dùng từ 6 đến 9 g, dạng thuốc sắc hoặc tán.')).toEqual({ min_g: 6, max_g: 9 })
    expect(docLieu('Ngày dùng íừ 9 đến 30 g, dạng thuổc sắc')).toEqual({ min_g: 9, max_g: 30 })
  })
  it('số thập phân dấu phẩy', () => {
    expect(docLieu('Ngày dùng từ 0,6 g đến 1,5 g, thường dùng dạng hoàn tán.')).toEqual({ min_g: 0.6, max_g: 1.5 })
  })
  it('liều đơn "Ngày dùng 4 g" → min = max', () => {
    expect(docLieu('Ngày dùng 4 g, dạng thuốc sắc.')).toEqual({ min_g: 4, max_g: 4 })
  })
  it('chỉ lấy câu liều uống đầu tiên, bỏ phần dùng ngoài', () => {
    expect(docLieu('Ngày dùng từ 9 g đến 15 g. Dạng thuốc sắc. Dùng ngoài: Lượng thích hợp, 30 g đến 50 g.')).toEqual({ min_g: 9, max_g: 15 })
  })
  it('nhiều khoảng liều trong câu đầu (tươi/khô, sắc/bột) → không tự đoán', () => {
    expect(docLieu('Ngày 80 g đến 120 g (cây tươi); 16 g đến 20 g (khô). Dạng thuốc sắc.')).toBeNull()
    expect(docLieu('Ngày dùng tù 3 g đển 9 g hoặc uống mỗi lần từ 1,5 g đến 3 g dạng bột.')).toBeNull()
  })
  it('câu liều đầu là liều dược liệu tươi → không tự đoán (cần liều khô)', () => {
    expect(docLieu('Ngày dùng từ 30 g đến 40 g Rau má tươi, vò nát, lấy nước hoặc sắc uống. Dùng dược liệu khô, ngày dùng từ 15 g đến 30 g.')).toBeNull()
  })
  it('đơn vị OCR sai hoặc số bị tách ("9 2.", "1 2 g", "30 e") → không tự đoán', () => {
    expect(docLieu('Ngày dùne từ 6 g đến 9 2. phối hợp trong các bài thuốc.')).toBeNull()
    expect(docLieu('Ngày dùng tử 4 g đến 1 2 g, dạng thuốc sắc')).toBeNull()
    expect(docLieu('Ngàv dùng 30 g đến 40 e dưới dạng thuốc sắc')).toBeNull()
  })
  it('min > max hoặc không có liều gam → null', () => {
    expect(docLieu('Ngày dùng từ 12 g đến 3 g')).toBeNull()
    expect(docLieu('Tiêm trong da, liều 5 IU/0,1ml.')).toBeNull()
    expect(docLieu('Lượng thích hợp.')).toBeNull()
  })
})

describe('khopLatin — so tên Latin OCR với tên trong danh mục', () => {
  it('khớp dù OCR thay l→ỉ, i→ì', () => {
    expect(khopLatin('Radix Angeỉỉcae sinensis', 'Radix Angelicae sinensis')).toBe(true)
    expect(khopLatin('Rhìtoma Cyperì', 'Rhizoma Cyperi')).toBe(true)
  })
  it('không khớp khi khác số từ (vd bản đã chế "praeparata")', () => {
    expect(khopLatin('Radix Rehmanniae glutinosae', 'Radix Rehmanniae glutinosae praeparata')).toBe(false)
  })
  it('không khớp khác loài', () => {
    expect(khopLatin('Radix Angelicae dahuricae', 'Radix Angelicae sinensis')).toBe(false)
    expect(khopLatin('Fructus Citri', 'Fructus Mori albae')).toBe(false)
  })
  it('bỏ qua chữ hoa/thường và dấu chấm', () => {
    expect(khopLatin('Herba Loranthi Gracilifolii', 'Herba Loranthi gracilifolii')).toBe(true)
  })
})

describe('ghepLieu — gán liều Dược điển cho từng vị trong danh mục', () => {
  const cl = (latin: string, lieu_text: string, trang_in: number | null = 100) =>
    ({ ten: 'X', latin, trang_pdf: 1, trang_in, lieu_text, kieng_ky_text: '' })
  const dm = (stt: number, ten_khoa_hoc: string) =>
    ({ stt, trang: 152, ten: `Vị ${stt}`, ten_khac: [], nguon_goc: 'N', ten_khoa_hoc, ten_cay: '' })

  it('gán liều + trang khi tên Latin khớp và đọc được liều', () => {
    const { theoStt } = ghepLieu([cl('Radix Angeỉỉcae sinensis', 'Ngày dùng từ 6 g đên 12 g.', 1175)], [dm(1, 'Radix Angelicae sinensis')], {})
    expect(theoStt.get(1)).toEqual({ min_g: 6, max_g: 12, trang: 1175, muc: 'Chuyên luận Radix Angelicae sinensis' })
  })
  it('không đọc được liều → không gán, ghi báo cáo cần đọc tay', () => {
    const { theoStt, baoCao } = ghepLieu([cl('Fructus Silybi', 'Ngày dùng từ 8 g đến 12 g đến 30 e')], [dm(2, 'Fructus Silybi')], {})
    expect(theoStt.has(2)).toBe(false)
    expect(baoCao.join('\n')).toMatch(/ĐỌC TAY.*Fructus Silybi/)
  })
  it('hai chuyên luận cùng tên Latin nhưng liều khác nhau → không gán, báo xung đột', () => {
    const { theoStt, baoCao } = ghepLieu(
      [cl('Radix Bupleuri', 'Ngày dùng từ 3 g đến 9 g.'), cl('Radix Bupleuri', 'Ngày dùng từ 3 g đến 10 g.')],
      [dm(3, 'Radix Bupleuri')], {})
    expect(theoStt.has(3)).toBe(false)
    expect(baoCao.join('\n')).toMatch(/XUNG ĐỘT/)
  })
  it('bản sửa tay (đã đọc ảnh trang) thắng bản tự động', () => {
    const { theoStt } = ghepLieu([cl('Fructus Silybi', 'Ngày dùng từ 8 g đến 12 g đến 30 e')], [dm(2, 'Fructus Silybi')],
      { 2: { min_g: 8, max_g: 12, trang: 1131, ghi_chu: 'đọc ảnh trang' } })
    expect(theoStt.get(2)).toEqual({ min_g: 8, max_g: 12, trang: 1131, muc: 'Chuyên luận Fructus Silybi' })
  })
  it('tên Latin OCR hỏng nhưng tên Việt trùng và cùng chi → vẫn ghép', () => {
    const c = { ...cl('Rhizoma Ligustici wat lieh ii', 'Ngày dùng từ 6 g đến 12 g.'), ten: 'XUYÊN KHUNG (Thân rễ)' }
    const d = { ...dm(9, 'Rhizoma Ligustici wallichii'), ten: 'Xuyên khung' }
    expect(ghepLieu([c], [d], {}).theoStt.get(9)?.max_g).toBe(12)
  })
  it('tên Việt trùng nhưng khác chi → không ghép', () => {
    const c = { ...cl('Herba Loranthi', 'Ngày dùng từ 6 g đến 12 g.'), ten: 'TẦM GỬI' }
    const d = { ...dm(9, 'Herba Viscum'), ten: 'Tầm gửi' }
    expect(ghepLieu([c], [d], {}).theoStt.has(9)).toBe(false)
  })
  it('tên Việt trùng, cùng chi nhưng khác bộ phận dùng (Gai/Quả) → không ghép', () => {
    const c = { ...cl('Spina Gleditsiae australis', 'Ngày dùng từ 3 g đến 9 g.'), ten: 'BỒ KẾT (Gai)' }
    const d = { ...dm(9, 'Fructus Gleditsiae'), ten: 'Bồ kết' }
    expect(ghepLieu([c], [d], {}).theoStt.has(9)).toBe(false)
  })
  it('sửa tay có tên chuyên luận in trong Dược điển → mục nguồn dùng tên đó', () => {
    const { theoStt } = ghepLieu([], [dm(18, 'Poria')], { 18: { min_g: 9, max_g: 15, trang: 1293, chuyen_luan: 'PHỤC LINH', ghi_chu: '' } })
    expect(theoStt.get(18)).toEqual({ min_g: 9, max_g: 15, trang: 1293, muc: 'Chuyên luận PHỤC LINH' })
  })
  it('sửa tay "bo_qua" chặn một ghép tự động sai', () => {
    const { theoStt } = ghepLieu([cl('Radix Angelicae sinensis', 'Ngày dùng từ 6 g đến 12 g.')], [dm(1, 'Radix Angelicae sinensis')],
      { 1: { bo_qua: true, ghi_chu: 'khác bộ phận dùng' } })
    expect(theoStt.has(1)).toBe(false)
  })
})

describe('tuDocAnh — kết quả đọc ảnh trang → sửa tay', () => {
  const kq = (o: object) => ({ id: 'x', stt: [5], ket_qua: 'co_lieu', chuyen_luan: 'PHỤC LINH', trang_in: 1293, min_g: 9, max_g: 15, cau: '', ghi_chu: '', ...o })
  it('có liều → sửa tay cho mọi STT của việc', () => {
    const { suaTay } = tuDocAnh([kq({ stt: [274, 275] })])
    expect(suaTay[274]).toEqual({ min_g: 9, max_g: 15, trang: 1293, chuyen_luan: 'PHỤC LINH', ghi_chu: '' })
    expect(suaTay[275]).toBeDefined()
  })
  it('vị ngoài danh mục (không STT) → gán theo id', () => {
    const { theoId } = tuDocAnh([kq({ id: 'loc-giac-giao', stt: [] })])
    expect(theoId.get('loc-giac-giao')).toEqual({ min_g: 9, max_g: 15, trang: 1293, muc: 'Chuyên luận PHỤC LINH' })
  })
  it('không ghi liều gam / không có chuyên luận → chặn gán tự động', () => {
    const { suaTay } = tuDocAnh([kq({ ket_qua: 'khong_ghi_lieu_gam', min_g: null, max_g: null }), kq({ stt: [6], ket_qua: 'khong_co_chuyen_luan', min_g: null, max_g: null })])
    expect(suaTay[5]).toMatchObject({ bo_qua: true })
    expect(suaTay[6]).toMatchObject({ bo_qua: true })
  })
  it('kiểm tra xác nhận sai → dùng giá trị đọc từ ảnh', () => {
    const { suaTay } = tuDocAnh([{ kiem_tra: true, stt: [7], xac_nhan: false, ket_qua: 'co_lieu', chuyen_luan: 'X', trang_in: 1100, min_g: 3, max_g: 6, cau: '', ghi_chu: '' }])
    expect(suaTay[7]).toMatchObject({ min_g: 3, max_g: 6 })
  })
  it('kiểm tra xác nhận đúng nhưng có giá trị đọc ảnh → vẫn dùng giá trị ảnh (trang chuẩn hơn bản tự động)', () => {
    const { suaTay } = tuDocAnh([{ kiem_tra: true, stt: [7], xac_nhan: true, ket_qua: 'co_lieu', chuyen_luan: 'QUA LÂU (Hạt)', trang_in: 1294, min_g: 9, max_g: 15 }])
    expect(suaTay[7]).toMatchObject({ trang: 1294, min_g: 9, max_g: 15 })
  })
  it('kiểm tra xác nhận đúng, không kèm giá trị → giữ bản tự động', () => {
    const { suaTay } = tuDocAnh([{ kiem_tra: true, stt: [7], xac_nhan: true, min_g: null, max_g: null }])
    expect(suaTay[7]).toBeUndefined()
  })
  it('hai kết quả cùng giá trị, chỉ khác ghi chú → không lỗi', () => {
    expect(() => tuDocAnh([kq({ ghi_chu: 'a' }), kq({ ghi_chu: 'b' })])).not.toThrow()
  })
  it('hai kết quả khác nhau cho cùng STT → lỗi', () => {
    expect(() => tuDocAnh([kq({}), kq({ min_g: 3 })])).toThrow(/STT 5/)
  })
})
