import type { ThanhPhan, ViThuoc } from './schema'

export const VAI_TRO: Record<NonNullable<ThanhPhan['vai_tro']>, string> = {
  quan: 'Quân', than: 'Thần', ta: 'Tá', su: 'Sứ',
}
export const PHO_BIEN: Record<ViThuoc['pho_bien']['muc'], string> = {
  cao: 'Phổ biến', trung_binh: 'Trung bình', thap: 'Hiếm',
}
export const DOC_TINH: Record<ViThuoc['doc_tinh']['muc'], string> = {
  khong: 'Không độc', it: 'Ít độc', co: 'Có độc', rat_doc: 'Rất độc',
}
export const coDoc = (v: ViThuoc) => v.doc_tinh.muc === 'co' || v.doc_tinh.muc === 'rat_doc'
