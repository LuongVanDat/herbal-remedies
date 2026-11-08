import { z } from 'zod'

export const IdSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id phải kebab-case, không dấu, chữ thường')
export type Id = z.infer<typeof IdSchema>

const Text = z.string().min(1)

export const NguonRefSchema = z
  .object({
    ma: IdSchema,
    trang: z.number().int().positive().optional(),
    muc: Text.optional(),
    trang_thai: z.enum(['chua_doi_chieu', 'da_doi_chieu']),
  })
  .strict()
  .refine((n) => n.trang !== undefined || n.muc !== undefined, { message: 'nguồn phải có trang hoặc muc' })
export type NguonRef = z.infer<typeof NguonRefSchema>

export const NguonVanBanSchema = z
  .object({ ma: IdSchema, ten: Text, ten_ngan: Text, so_hieu: Text, ngay: Text, url: z.string().url() })
  .strict()
export type NguonVanBan = z.infer<typeof NguonVanBanSchema>

export const NguonFileSchema = z.object({ van_ban: z.array(NguonVanBanSchema) }).strict()
export type NguonFile = z.infer<typeof NguonFileSchema>

export const NhomTrieuChungSchema = z
  .object({
    id: IdSchema,
    ten: Text,
    trieu_chung: z.array(z.object({ id: IdSchema, ten: Text }).strict()),
  })
  .strict()
export type NhomTrieuChung = z.infer<typeof NhomTrieuChungSchema>

export const TrieuChungFileSchema = z.object({ nhom: z.array(NhomTrieuChungSchema) }).strict()
export type TrieuChungFile = z.infer<typeof TrieuChungFileSchema>

export const DauHieuNguyHiemSchema = z.object({ id: IdSchema, ten: Text }).strict()
export type DauHieuNguyHiem = z.infer<typeof DauHieuNguyHiemSchema>

export const TheBenhSchema = z
  .object({
    id: IdSchema,
    ten: Text,
    trieu_chung: z
      .object({ chinh: z.array(IdSchema).min(1), phu: z.array(IdSchema).default([]) })
      .strict(),
    loai_tru: z.array(IdSchema).default([]),
    mo_ta: Text.nullable().optional(),
    phap_tri: Text,
    bai_thuoc: z.array(IdSchema),
    nguon: NguonRefSchema,
  })
  .strict()
export type TheBenh = z.infer<typeof TheBenhSchema>

export const BenhSchema = z
  .object({
    id: IdSchema,
    ten: Text,
    ten_yhhd: Text.optional(),
    ten_khac: z.array(Text).default([]),
    dau_hieu_nguy_hiem: z.array(DauHieuNguyHiemSchema).default([]),
    the_benh: z.array(TheBenhSchema).min(1),
  })
  .strict()
export type Benh = z.infer<typeof BenhSchema>

export const ThanhPhanSchema = z
  .object({
    vi: IdSchema,
    ten_trong_bai: Text.optional(),
    lieu_g: z.number().positive().nullable(),
    lieu_text: Text.optional(),
    vai_tro: z.enum(['quan', 'than', 'ta', 'su']).nullable(),
    vuot_lieu_ly_do: Text.nullable().default(null),
  })
  .strict()
  .refine((t) => t.lieu_g !== null || t.lieu_text !== undefined, { message: 'Cần lieu_g hoặc lieu_text' })
export type ThanhPhan = z.infer<typeof ThanhPhanSchema>

export const BaiThuocSchema = z
  .object({
    id: IdSchema,
    ten: Text,
    xuat_xu: Text.optional(),
    loai: z.enum(['co_phuong', 'nghiem_phuong', 'tan_phuong', 'thuoc_nam', 'dung_ngoai', 'doi_phap_lap_phuong']).optional(),
    thanh_phan: z.array(ThanhPhanSchema).min(1),
    cach_dung: Text,
    gia_giam: z.array(Text).default([]),
    kieng_ky: z.array(Text).default([]),
    nguon: NguonRefSchema,
  })
  .strict()
export type BaiThuoc = z.infer<typeof BaiThuocSchema>

export const ThayTheSchema = z
  .object({ vi: IdSchema, ghi_chu: Text, nguon: NguonRefSchema.nullable() })
  .strict()
export type ThayThe = z.infer<typeof ThayTheSchema>

export const ViThuocSchema = z
  .object({
    id: IdSchema,
    ten: Text,
    ten_khac: z.array(Text).default([]),
    ten_khoa_hoc: Text.optional(),
    ten_cay: Text.optional(),
    bo_phan_dung: Text.optional(),
    nguon_goc: z.enum(['trong_nuoc', 'nhap_khau', 'ca_hai']).optional(),
    tinh_vi: Text.optional(),
    quy_kinh: z.array(Text).default([]),
    cong_nang: z.array(Text).default([]),
    lieu_dung: z
      .object({ min_g: z.number().positive(), max_g: z.number().positive(), nguon: NguonRefSchema.optional() })
      .strict()
      .refine((l) => l.min_g <= l.max_g, { message: 'min_g phải ≤ max_g' })
      .nullable(),
    doc_tinh: z
      .object({ muc: z.enum(['khong', 'it', 'co', 'rat_doc', 'chua_ro']), canh_bao: z.string().nullable() })
      .strict(),
    kieng_ky: z.array(Text).default([]),
    than_trong: z.array(Text).default([]),
    kieng_ky_nguon: NguonRefSchema.optional(), // nguồn chung cho kieng_ky + than_trong
    pho_bien: z.object({ muc: z.enum(['cao', 'trung_binh', 'thap']), can_cu: Text }).strict().nullable(),
    thay_the: z.array(ThayTheSchema).default([]),
    nguon: NguonRefSchema,
  })
  .strict()
export type ViThuoc = z.infer<typeof ViThuocSchema>
