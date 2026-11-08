/** Hàm thuần đọc liều Dược điển Việt Nam V từ văn bản OCR (scripts/trich/ddvn/chuyen-luan.json). */
import { boDau } from '../../../src/search'

/**
 * Liều ngày (gam) trong câu liều đầu tiên của mục "Cách dùng, liều lượng".
 * Bảo thủ: hễ có gì không chắc (nhiều khoảng liều, đơn vị/số bị OCR làm hỏng) thì trả null
 * để người đối chiếu điền tay (scripts/trich/ddvn/sua-tay.json) — không bao giờ đoán.
 */
export function docLieu(text: string): { min_g: number; max_g: number } | null {
  const cau = text.split(/d[uù]ng ngo[aà]i/i)[0].split(/\.(?!\d)/)[0]
  const k = boDau(cau)
  if (/\btuoi\b/.test(k)) return null // liều dược liệu tươi — cần đọc tay lấy liều khô
  const so = [...k.matchAll(/\d+(?:,\d+)?/g)]
  if (!so.length || so.length > 2) return null
  // Số cuối phải đứng ngay trước đơn vị "g" riêng lẻ; số đầu có thể bỏ đơn vị ("từ 6 đến 9 g")
  const cuoi = so[so.length - 1]
  if (!/^\s*g\b/.test(k.slice(cuoi.index! + cuoi[0].length))) return null
  const v = so.map((m) => Number(m[0].replace(',', '.')))
  if (v.length === 1) return v[0] > 0 ? { min_g: v[0], max_g: v[0] } : null
  const giua = k.slice(so[0].index! + so[0][0].length, so[1].index!)
  if (!/^\s*(g\s*)?d[eo]n\s*$/.test(giua)) return null
  return v[0] > 0 && v[0] <= v[1] ? { min_g: v[0], max_g: v[1] } : null
}

function khoangCach(a: string, b: string): number {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let truoc = d[0]
    d[0] = i
    for (let j = 1; j <= b.length; j++) {
      const t = d[j]
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, truoc + (a[i - 1] === b[j - 1] ? 0 : 1))
      truoc = t
    }
  }
  return d[b.length]
}

const tuLatin = (s: string) => boDau(s).replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean)

/** Tên Latin OCR có cùng dược liệu với tên trong danh mục không: cùng số từ, mỗi từ sai khác ≤ 25%. */
export function khopLatin(ocr: string, chuan: string): boolean {
  const a = tuLatin(ocr)
  const b = tuLatin(chuan)
  if (!a.length || a.length !== b.length) return false
  return a.every((t, i) => khoangCach(t, b[i]) <= Math.floor(Math.max(t.length, b[i].length) * 0.25))
}

export type ChuyenLuan = {
  ten: string; latin: string; trang_pdf: number; trang_in: number | null; lieu_text: string; kieng_ky_text: string
}
type DongDm = { stt: number; ten: string; ten_khac?: string[]; ten_khoa_hoc: string }
const tenViet = (s: string) => boDau(s.replace(/\(.*$/, '')).replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim()
const giong = (a = '', b = '') => !!a && !!b && khoangCach(a, b) <= Math.floor(Math.max(a.length, b.length) * 0.25)
/** Ghép dự phòng khi tên Latin OCR hỏng: tên Việt trùng hẳn, cùng bộ phận dùng và cùng chi (hai từ Latin đầu). */
const khopTenViet = (c: ChuyenLuan, d: DongDm) =>
  [d.ten, ...(d.ten_khac ?? [])].some((t) => tenViet(t) === tenViet(c.ten)) &&
  [0, 1].every((i) => giong(tuLatin(c.latin)[i], tuLatin(d.ten_khoa_hoc)[i]))
/** Sửa tay theo STT danh mục QĐ 5013, sau khi người/agent đã đọc ảnh trang Dược điển. */
export type SuaTay = Record<number, { min_g: number; max_g: number; trang: number; chuyen_luan?: string; ghi_chu: string } | { bo_qua: true; ghi_chu: string }>
export type LieuDdvn = { min_g: number; max_g: number; trang: number | null; muc: string }

/** Ghép mỗi vị trong danh mục với chuyên luận Dược điển cùng tên Latin; chỉ gán khi chắc chắn. */
export function ghepLieu(cl: ChuyenLuan[], dm: DongDm[], suaTay: SuaTay): { theoStt: Map<number, LieuDdvn>; baoCao: string[] } {
  const theoStt = new Map<number, LieuDdvn>()
  const baoCao: string[] = []
  for (const d of dm) {
    const muc = `Chuyên luận ${d.ten_khoa_hoc}`
    const tay = suaTay[d.stt]
    if (tay) {
      if (!('bo_qua' in tay))
        theoStt.set(d.stt, { min_g: tay.min_g, max_g: tay.max_g, trang: tay.trang, muc: tay.chuyen_luan ? `Chuyên luận ${tay.chuyen_luan}` : muc })
      continue
    }
    const ung = cl.filter((c) => khopLatin(c.latin, d.ten_khoa_hoc) || khopTenViet(c, d))
    if (!ung.length) continue
    const doc = ung.map((c) => ({ c, l: docLieu(c.lieu_text) }))
    const loi = doc.filter((x) => !x.l)
    if (loi.length) {
      for (const x of loi) baoCao.push(`ĐỌC TAY STT ${d.stt} ${d.ten} (${d.ten_khoa_hoc}) — DĐVN tr.${x.c.trang_in ?? '?'} (PDF ${x.c.trang_pdf}): "${x.c.lieu_text.slice(0, 160)}"`)
      continue
    }
    const khac = new Set(doc.map((x) => `${x.l!.min_g}-${x.l!.max_g}`))
    if (khac.size > 1) {
      baoCao.push(`XUNG ĐỘT STT ${d.stt} ${d.ten} (${d.ten_khoa_hoc}): ${doc.map((x) => `tr.${x.c.trang_in} ${x.l!.min_g}–${x.l!.max_g} g`).join('; ')}`)
      continue
    }
    theoStt.set(d.stt, { ...doc[0].l!, trang: doc[0].c.trang_in, muc })
  }
  return { theoStt, baoCao }
}

/** Một phần tử trong scripts/trich/ddvn/doc-anh/*.json (xem HUONG-DAN-DOC-ANH.md). */
export type KetQuaDocAnh = {
  id?: string; stt: number[]; ket_qua?: string; kiem_tra?: boolean; xac_nhan?: boolean
  chuyen_luan?: string; trang_in?: number; min_g: number | null; max_g: number | null; cau?: string; ghi_chu?: string
}

/** Chuyển kết quả đọc ảnh trang thành sửa tay (theo STT danh mục) và liều cho vị ngoài danh mục (theo id). */
export function tuDocAnh(ds: KetQuaDocAnh[]): { suaTay: SuaTay; theoId: Map<string, LieuDdvn> } {
  const suaTay: SuaTay = {}
  const theoId = new Map<string, LieuDdvn>()
  const dat = (stt: number, v: SuaTay[number]) => {
    const cu = suaTay[stt]
    const giaTri = (o: SuaTay[number]) => JSON.stringify({ ...o, ghi_chu: undefined })
    if (cu && giaTri(cu) !== giaTri(v)) throw new Error(`Đọc ảnh mâu thuẫn ở STT ${stt}: ${JSON.stringify(cu)} ≠ ${JSON.stringify(v)}`)
    suaTay[stt] = v
  }
  for (const x of ds) {
    const coLieu = x.ket_qua === 'co_lieu' && x.min_g != null && x.max_g != null && x.trang_in != null
    // Kiểm tra đã xác nhận mà không kèm giá trị → giữ bản tự động; có giá trị đọc ảnh → luôn dùng (trang chuẩn hơn)
    if (x.kiem_tra && x.xac_nhan && !coLieu) continue
    if (coLieu && !x.stt.length && x.id) {
      theoId.set(x.id, { min_g: x.min_g!, max_g: x.max_g!, trang: x.trang_in!, muc: `Chuyên luận ${x.chuyen_luan}` })
      continue
    }
    for (const s of x.stt)
      dat(s, coLieu
        ? { min_g: x.min_g!, max_g: x.max_g!, trang: x.trang_in!, ...(x.chuyen_luan ? { chuyen_luan: x.chuyen_luan } : {}), ghi_chu: x.ghi_chu ?? '' }
        : { bo_qua: true, ghi_chu: `${x.ket_qua ?? 'không xác nhận'}: ${x.ghi_chu ?? ''}`.trim() })
  }
  return { suaTay, theoId }
}

/** Một phần tử trong scripts/trich/ddvn/kieng-ky/kq-*.json (xem kieng-ky/HUONG-DAN.md). */
export type KetQuaKiengKy = {
  id: string; ket_qua: 'co' | 'khong_co' | 'khong_chac'; chuyen_luan?: string; trang_in?: number
  kieng_ky: string[]; than_trong: string[]; ghi_chu?: string
}
export type KiengKyDdvn = {
  kieng_ky: string[]; than_trong: string[]
  nguon: { ma: 'ddvn-5'; trang?: number; muc: string; trang_thai: 'chua_doi_chieu' }
}

/** Kiêng kỵ/thận trọng chép từ ảnh trang DĐVN V → theo id vị. Chỉ nhận kết quả "co". */
export function tuKiengKy(ds: KetQuaKiengKy[]): Map<string, KiengKyDdvn> {
  const ra = new Map<string, KiengKyDdvn>()
  // Bản quét hay mất dấu hỏi của "ỉa" (chép ảnh có agent giữ "ia", có agent sửa) → thống nhất "ỉa"
  const gon = (a: string[]) => a.map((c) => c.replace(/\s+/g, ' ').trim()
    .replace(/\bia (chảy|lỏng)/g, 'ỉa $1').replace(/\bIa (chảy|lỏng)/g, 'Ỉa $1')).filter(Boolean)
  const daGap = new Set<string>()
  for (const x of ds) {
    if (daGap.has(x.id)) throw new Error(`Kiêng kỵ trùng id ${x.id}`)
    daGap.add(x.id)
    if (x.ket_qua !== 'co') continue
    const kk = gon(x.kieng_ky), tt = gon(x.than_trong)
    if (!kk.length && !tt.length) throw new Error(`Kiêng kỵ ${x.id}: ket_qua "co" nhưng không có câu nào`)
    ra.set(x.id, {
      kieng_ky: kk, than_trong: tt,
      nguon: { ma: 'ddvn-5', ...(x.trang_in ? { trang: x.trang_in } : {}), muc: `Chuyên luận ${x.chuyen_luan}`, trang_thai: 'chua_doi_chieu' },
    })
  }
  return ra
}
