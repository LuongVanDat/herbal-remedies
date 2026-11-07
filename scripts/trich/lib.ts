/** Hàm thuần dùng để dựng dữ liệu từ bản trích QĐ 5013 (xem scripts/trich/sinh-du-lieu.ts). */
import { boDau } from '../../src/search'

export type DongDanhMuc = {
  stt: number
  trang: number
  ten: string
  ten_khac: string[]
  nguon_goc: string
  ten_khoa_hoc: string
  ten_cay: string
}
export type DongDoc = { ten: string; ten_khoa_hoc: string; phu_luc: string; stt: number; dm_stt: number[] }

export function slug(s: string): string {
  return boDau(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const khoaTen = (s: string) => boDau(s.replace(/\([^)]*\)/g, ' '))
// "Bach" (lỗi in) và "Bạch" đều thành "bach" sau khi bỏ dấu nên không cần xử lý riêng.

/** Tìm dòng danh mục cho tên vị in trong bài. biDanh: khóa đã bỏ dấu → tên chuẩn trong danh mục. */
export function timVi(tenIn: string, dm: DongDanhMuc[], biDanh: Record<string, string>): DongDanhMuc | null {
  const theoTen = new Map<string, DongDanhMuc>()
  for (const d of dm) for (const t of [d.ten, ...d.ten_khac]) if (!theoTen.has(khoaTen(t))) theoTen.set(khoaTen(t), d)
  const k = khoaTen(tenIn)
  const truc = theoTen.get(k)
  if (truc) return truc
  const bd = biDanh[k]
  return bd ? (theoTen.get(khoaTen(bd)) ?? null) : null
}

/** Triệu chứng chỉ thể này có (so với các thể cùng bệnh) là chính; dùng chung là phụ. Không có riêng → tất cả chính. */
export function chiaChinhPhu(cacThe: string[][]): { chinh: string[]; phu: string[] }[] {
  return cacThe.map((ds, i) => {
    const khac = new Set(cacThe.filter((_, j) => j !== i).flat())
    const chinh = ds.filter((id) => !khac.has(id))
    return chinh.length ? { chinh, phu: ds.filter((id) => khac.has(id)) } : { chinh: [...ds], phu: [] }
  })
}

/** Tên vị và liều có đứng cạnh nhau trong chữ của trang không (bỏ dấu, gộp khoảng trắng, cho phép "08g"). */
export function xacNhanLieu(chuTrang: string, tenIn: string, lieuG: number): boolean {
  const trang = boDau(chuTrang)
  const ten = boDau(tenIn)
    .split(' ')
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+')
  const so = String(lieuG).replace('.', '[.,]')
  return new RegExp(`${ten}\\s*:?\\s*0*${so}\\s*g`).test(trang)
}

const BO_PHAN: [RegExp, string][] = [
  [/^Radix et Rhizoma\b/, 'Rễ và thân rễ'],
  [/^Radix et Folium\b/, 'Rễ và lá'],
  [/^Rhizoma et Radix\b/, 'Thân rễ và rễ'],
  [/^Herba et radix\b/i, 'Toàn cây và rễ'],
  [/^Folium et Ramulus\b/, 'Lá và cành'],
  [/^Flos et Folium\b/, 'Hoa và lá'],
  [/^Caulis et Radix\b/, 'Thân và rễ'],
  [/^Radix\b/, 'Rễ'],
  [/^Rhizoma\b/, 'Thân rễ'],
  [/^Herba\b/, 'Toàn cây hoặc phần trên mặt đất'],
  [/^Semen\b/, 'Hạt'],
  [/^Fructus\b/, 'Quả'],
  [/^Flos\b/, 'Hoa'],
  [/^Folium\b/, 'Lá'],
  [/^Cortex\b/, 'Vỏ'],
  [/^Caulis\b/, 'Thân'],
  [/^Ramulus\b/, 'Cành'],
  [/^Bulbus\b/, 'Thân hành'],
  [/^Tuber\b/, 'Củ'],
  [/^Pericarpium\b/, 'Vỏ quả'],
  [/^Lignum\b/, 'Gỗ'],
  [/^Pollen\b/, 'Phấn hoa'],
  [/^Stigma\b/, 'Đầu nhụy'],
]
/** Bộ phận dùng suy từ từ Latin đầu tên khoa học vị thuốc (Radix = rễ…); không suy được → undefined. */
export function boPhanDung(tenKhoaHoc: string): string | undefined {
  return BO_PHAN.find(([re]) => re.test(tenKhoaHoc))?.[1]
}
