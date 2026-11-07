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
