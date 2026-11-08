import type { BaiThuoc, ThanhPhan, ViThuoc } from './schema'

export const VAI_TRO: Record<NonNullable<ThanhPhan['vai_tro']>, string> = {
  quan: 'Quân', than: 'Thần', ta: 'Tá', su: 'Sứ',
}
export const PHO_BIEN: Record<NonNullable<ViThuoc['pho_bien']>['muc'], string> = {
  cao: 'Phổ biến', trung_binh: 'Trung bình', thap: 'Hiếm',
}
export const DOC_TINH: Record<ViThuoc['doc_tinh']['muc'], string> = {
  khong: 'Không độc', it: 'Ít độc', co: 'Có độc', rat_doc: 'Rất độc', chua_ro: 'Chưa có dữ liệu độc tính',
}
export const coDoc = (v: ViThuoc) => v.doc_tinh.muc === 'co' || v.doc_tinh.muc === 'rat_doc'

export const LOAI_BAI: Record<NonNullable<BaiThuoc['loai']>, string> = {
  co_phuong: 'Cổ phương', nghiem_phuong: 'Nghiệm phương', tan_phuong: 'Tân phương', thuoc_nam: 'Thuốc Nam',
  dung_ngoai: 'Dùng ngoài', doi_phap_lap_phuong: 'Đối pháp lập phương',
}
export const NGUON_GOC: Record<NonNullable<ViThuoc['nguon_goc']>, string> = {
  trong_nuoc: 'Nuôi trồng, khai thác trong nước',
  nhap_khau: 'Nuôi trồng, khai thác từ nước ngoài',
  ca_hai: 'Cả trong nước và nước ngoài',
}
export const coNhanDoc = (v: ViThuoc) => v.doc_tinh.muc === 'it' || coDoc(v)

/** "6–12g" hoặc "4g" khi liều tối thiểu = tối đa. */
export const khoangLieu = (l: { min_g: number; max_g: number }) => (l.min_g === l.max_g ? `${l.min_g}g` : `${l.min_g}–${l.max_g}g`)

const RE_THAI = /có thai|mang thai|thai phụ|phụ nữ mang/i
const RE_THAN_TRONG = /thận trọng|cẩn thận/i
/**
 * Mức lưu ý khi có thai của một vị, xét từng câu nhắc tới thai: câu dưới mục Kiêng kỵ là "kiêng dùng" trừ khi
 * chính câu đó chỉ nói "thận trọng/cẩn thận" (DĐVN đôi khi đặt câu thận trọng dưới tiêu đề Kiêng kỵ).
 */
export const luuYThai = (v: { kieng_ky: string[]; than_trong: string[] }): 'kieng_dung' | 'than_trong' | null => {
  if (v.kieng_ky.some((k) => RE_THAI.test(k) && !RE_THAN_TRONG.test(k))) return 'kieng_dung'
  return [...v.kieng_ky, ...v.than_trong].some((k) => RE_THAI.test(k)) ? 'than_trong' : null
}
export const LUU_Y_THAI = { kieng_dung: 'kiêng dùng', than_trong: 'thận trọng' } as const
