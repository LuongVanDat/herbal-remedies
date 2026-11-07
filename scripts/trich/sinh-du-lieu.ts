/**
 * Sinh data/*.yaml từ bản trích QĐ 5013 (.superpowers/trich/benh/*.json), danh mục vị thuốc QĐ 5013
 * (scripts/trich/danh-muc-vi.json) và danh mục dược liệu độc TT 13/2024 (scripts/trich/duoc-lieu-doc.json).
 *
 * Chạy: npx tsx scripts/trich/sinh-du-lieu.ts [thư mục json bệnh] [thư mục data] [file text QĐ 5013]
 * In báo cáo: tên vị không khớp danh mục, liều không tìm thấy cạnh tên vị trên trang gốc.
 * Thoát mã 1 nếu còn vị không khớp (dữ liệu sẽ thiếu tham chiếu).
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { stringify } from 'yaml'
import { BI_DANH, VI_GOP } from './bi-danh-vi'
import { boPhanDung, chiaChinhPhu, slug, timVi, xacNhanLieu, type DongDanhMuc, type DongDoc } from './lib'
import { boDau } from '../../src/search'

const [dirJson = '.superpowers/trich/benh', dirData = 'data', fileText = '.superpowers/trich/full.txt'] = process.argv.slice(2)
const trangText = readFileSync(fileText, 'utf8').split('\f')
const dm: DongDanhMuc[] = JSON.parse(readFileSync('scripts/trich/danh-muc-vi.json', 'utf8'))
const docDs: DongDoc[] = JSON.parse(readFileSync('scripts/trich/duoc-lieu-doc.json', 'utf8')).ds
const biDanh = Object.fromEntries(Object.entries(BI_DANH).map(([k, v]) => [boDau(k), v.ten]))

type TrieuChungJ = { ten: string; nhom: string }
type ThanhPhanJ = { ten: string; lieu_g: number | null; lieu_text?: string }
type BaiJ = {
  ten: string | null; loai: string | null; trang: number; thanh_phan: ThanhPhanJ[]
  cach_dung: string | null; gia_giam: string[]; giong_the: string | null
}
type TheJ = {
  ten: string; mo_ta: string | null; trang: number; trieu_chung: TrieuChungJ[]
  loai_tru: { ten: string; dan_chung: string }[]; phap_tri: string; bai_thuoc: BaiJ[]
}
type BenhJ = {
  so: number; id: string; ten: string; ten_khac: string[]
  dau_hieu_nguy_hiem: { ten: string; trang: number }[]; the_benh: TheJ[]; ghi_chu_trich: string[]
}

const NHOM: [string, string][] = [
  ['vi-tri-dau', 'Đau – vận động'], ['han-nhiet', 'Hàn nhiệt'], ['mo-hoi', 'Mồ hôi'], ['dau-mat', 'Đầu – mặt – họng'],
  ['ho-hap', 'Hô hấp'], ['tieu-hoa', 'Tiêu hóa – ăn uống'], ['tieu-tien', 'Tiểu tiện'], ['da', 'Da'],
  ['than-kinh', 'Thần kinh – giấc ngủ'], ['toan-than', 'Toàn thân'], ['phu-nu-tre-em', 'Phụ nữ – trẻ em'],
  ['luoi', 'Lưỡi'], ['mach', 'Mạch'], ['khac', 'Khác'],
]
const NG = (trang: number) => ({ ma: 'qd-5013', trang, trang_thai: 'chua_doi_chieu' as const })
const baoCao: string[] = []
const khongKhop = new Map<string, string[]>()

// ---- Mã triệu chứng: duy nhất theo nội dung chữ, rút gọn tối đa 48 ký tự ----
const tcId = new Map<string, string>() // khóa bỏ dấu → id
const tcInfo = new Map<string, { ten: string; nhom: string }>()
function maTrieuChung(t: TrieuChungJ): string {
  const k = boDau(t.ten).replace(/[.;,]+$/, '')
  const co = tcId.get(k)
  if (co) return co
  let goc = slug(t.ten)
  if (goc.length > 48) goc = goc.slice(0, 48).replace(/-[^-]*$/, '')
  let id = goc
  for (let i = 2; [...tcId.values()].includes(id); i++) id = `${goc}-${i}`
  tcId.set(k, id)
  tcInfo.set(id, { ten: t.ten.replace(/[.;]+$/, ''), nhom: NHOM.some(([n]) => n === t.nhom) ? t.nhom : 'khac' })
  return id
}

// ---- Vị thuốc ----
const viDung = new Set<number>() // STT danh mục được dùng
function maVi(d: DongDanhMuc): string {
  const trung = dm.filter((x) => slug(x.ten) === slug(d.ten))
  return trung.length > 1 && trung[0].stt !== d.stt ? slug(`${d.ten} ${d.ten_khac[0] ?? d.stt}`) : slug(d.ten)
}
function viCuaTen(tenIn: string, noi: string): string | null {
  const gop = VI_GOP[boDau(tenIn.replace(/\([^)]*\)/g, ' '))]
  if (gop) return gop.id
  const d = timVi(tenIn, dm, biDanh)
  if (!d) {
    khongKhop.set(tenIn, [...(khongKhop.get(tenIn) ?? []), noi])
    return null
  }
  viDung.add(d.stt)
  return maVi(d)
}

// ---- Đọc các bệnh ----
const files = readdirSync(dirJson).filter((f) => f.endsWith('.json')).sort()
const benhOut: Record<string, unknown>[] = []
const baiOut = new Map<string, Record<string, unknown>>()

for (const f of files) {
  const b: BenhJ = JSON.parse(readFileSync(join(dirJson, f), 'utf8'))
  const tenNgan = b.ten.replace(/\s*\(.*$/, '')
  const theIds = b.the_benh.map((t) => slug(t.ten))
  const tcCacThe = b.the_benh.map((t) => [...new Set(t.trieu_chung.map(maTrieuChung))])
  const chia = chiaChinhPhu(tcCacThe)
  const baiCuaThe = new Map<string, string[]>()
  const noiDungBai = new Map<string, string>() // dấu vân tay nội dung → id (gộp bài trùng trong cùng bệnh)

  b.the_benh.forEach((t, i) => {
    const ids: string[] = []
    for (const bj of t.bai_thuoc) {
      if (bj.giong_the) continue
      const dau = JSON.stringify([bj.ten, bj.loai, bj.thanh_phan, bj.cach_dung, bj.gia_giam])
      const daCo = noiDungBai.get(dau)
      if (daCo) { ids.push(daCo); continue }
      const tenBai = bj.ten ?? `${bj.loai === 'dung_ngoai' ? 'Bài dùng ngoài' : 'Nghiệm phương'} — ${tenNgan}, thể ${t.ten}`
      let id = `${b.id}-${slug(bj.ten ?? 'nghiem-phuong')}`
      if (baiOut.has(id)) id = `${id}-${theIds[i]}`
      for (let k = 2; baiOut.has(id); k++) id = `${b.id}-${slug(bj.ten ?? 'nghiem-phuong')}-${theIds[i]}-${k}`
      const thanhPhan = bj.thanh_phan.map((tp) => {
        const vi = viCuaTen(tp.ten, `${f} › ${t.ten} › ${tenBai}`)
        if (tp.lieu_g !== null) {
          const ok = [bj.trang, bj.trang + 1].some((p) => trangText[p - 1] && xacNhanLieu(trangText[p - 1], tp.ten, tp.lieu_g!))
          if (!ok) baoCao.push(`LIỀU? ${f} tr.${bj.trang} ${tenBai}: "${tp.ten} ${tp.lieu_g}g" không thấy trên trang`)
        }
        const tenVi = vi && Object.values(VI_GOP).find((g) => g.id === vi)?.ten
        const tenDm = vi && (tenVi ?? dm.find((d) => maVi(d) === vi)?.ten)
        return {
          vi: vi ?? 'khong-khop',
          ...(tenDm && tenDm !== tp.ten ? { ten_trong_bai: tp.ten } : {}),
          lieu_g: tp.lieu_g,
          ...(tp.lieu_text ? { lieu_text: tp.lieu_text } : {}),
          vai_tro: null,
        }
      })
      if (!thanhPhan.length) continue
      baiOut.set(id, {
        id, ten: tenBai, ...(bj.loai ? { loai: bj.loai } : {}), thanh_phan: thanhPhan,
        cach_dung: bj.cach_dung ?? 'Văn bản không ghi cách dùng.', gia_giam: bj.gia_giam, nguon: NG(bj.trang),
      })
      noiDungBai.set(dau, id)
      ids.push(id)
    }
    baiCuaThe.set(t.ten, ids)
  })
  // thể "giống thể X"
  b.the_benh.forEach((t) => {
    const giong = t.bai_thuoc.find((x) => x.giong_the)?.giong_the
    if (giong) baiCuaThe.set(t.ten, [...(baiCuaThe.get(t.ten) ?? []), ...(baiCuaThe.get(giong) ?? [])])
    if (giong && !baiCuaThe.has(giong)) baoCao.push(`GIỐNG THỂ? ${f} ${t.ten} → "${giong}" không có`)
  })

  benhOut.push({
    id: b.id,
    ten: b.ten,
    ten_khac: b.ten_khac,
    dau_hieu_nguy_hiem: b.dau_hieu_nguy_hiem.map((d, i) => ({ id: `nh-${b.id}-${i + 1}`, ten: d.ten })),
    the_benh: b.the_benh.map((t, i) => ({
      id: theIds[i],
      ten: t.ten,
      ...(t.mo_ta ? { mo_ta: t.mo_ta } : {}),
      trieu_chung: chia[i],
      loai_tru: [...new Set(t.loai_tru.map((l) => maTrieuChung({ ten: l.ten, nhom: 'khac' })))].filter(
        (id) => !tcCacThe[i].includes(id),
      ),
      phap_tri: t.phap_tri,
      bai_thuoc: baiCuaThe.get(t.ten) ?? [],
      nguon: NG(t.trang),
    })),
  })
  for (const g of b.ghi_chu_trich) baoCao.push(`GHI CHÚ ${f}: ${g}`)
}

// ---- Ghi file ----
for (const sub of ['benh', 'bai-thuoc', 'vi-thuoc']) {
  rmSync(join(dirData, sub), { recursive: true, force: true })
  mkdirSync(join(dirData, sub), { recursive: true })
  writeFileSync(join(dirData, sub, '.gitkeep'), '')
}
const ghi = (p: string, o: unknown) =>
  writeFileSync(join(dirData, p), `# Sinh tự động bởi scripts/trich/sinh-du-lieu.ts từ QĐ 5013/QĐ-BYT — sửa bản trích rồi chạy lại\n${stringify(o, { lineWidth: 0 })}`)
for (const b of benhOut) ghi(`benh/${b.id}.yaml`, b)
for (const b of baiOut.values()) ghi(`bai-thuoc/${b.id}.yaml`, b)

const docTheoStt = new Map<number, DongDoc>()
for (const x of docDs) for (const s of x.dm_stt) docTheoStt.set(s, x)
const GOC: Record<string, string> = { N: 'trong_nuoc', B: 'nhap_khau', 'B-N': 'ca_hai' }
const docTinh = (stt: number) => {
  const x = docTheoStt.get(stt)
  return x
    ? { muc: 'co', canh_bao: `Thuộc Danh mục dược liệu độc làm thuốc (TT 13/2024/TT-BYT, Phụ lục ${x.phu_luc}, STT ${x.stt}). Chỉ dùng theo chỉ định của thầy thuốc.` }
    : { muc: 'chua_ro', canh_bao: null }
}
for (const d of dm) {
  const bp = boPhanDung(d.ten_khoa_hoc)
  ghi(`vi-thuoc/${maVi(d)}.yaml`, {
    id: maVi(d), ten: d.ten, ten_khac: d.ten_khac, ten_khoa_hoc: d.ten_khoa_hoc,
    ...(d.ten_cay ? { ten_cay: d.ten_cay } : {}), ...(bp ? { bo_phan_dung: bp } : {}),
    ...(GOC[d.nguon_goc] ? { nguon_goc: GOC[d.nguon_goc] } : {}),
    lieu_dung: null, doc_tinh: docTinh(d.stt), pho_bien: null, thay_the: [],
    nguon: NG(d.trang),
  })
}
for (const g of Object.values(VI_GOP)) {
  const tv = g.stt.map((s) => dm.find((d) => d.stt === s)!)
  ghi(`vi-thuoc/${g.id}.yaml`, {
    id: g.id, ten: g.ten, ten_khac: [], ten_khoa_hoc: tv[0].ten_khoa_hoc,
    ten_cay: tv.map((d) => `${d.ten} (STT ${d.stt}): ${d.ten_cay}`).join('; '),
    ...(boPhanDung(tv[0].ten_khoa_hoc) ? { bo_phan_dung: boPhanDung(tv[0].ten_khoa_hoc) } : {}),
    lieu_dung: null, doc_tinh: docTinh(g.stt[0]), pho_bien: null, thay_the: [],
    nguon: NG(tv[0].trang),
  })
}

const nhomOut = NHOM.map(([id, ten]) => ({
  id, ten,
  trieu_chung: [...tcInfo].filter(([, v]) => v.nhom === id).map(([tid, v]) => ({ id: tid, ten: v.ten })),
})).filter((n) => n.trieu_chung.length)
ghi('trieu-chung.yaml', { nhom: nhomOut })

// ---- Báo cáo ----
const soBai = baiOut.size
console.log(`${benhOut.length} bệnh, ${benhOut.reduce((s, b) => s + (b.the_benh as unknown[]).length, 0)} thể, ${soBai} bài, ${tcInfo.size} triệu chứng, ${dm.length + Object.keys(VI_GOP).length} vị (dùng ${viDung.size} vị trong danh mục)`)
for (const [ten, noi] of khongKhop) console.log(`KHÔNG KHỚP VỊ: "${ten}" (${noi.length} lần, vd ${noi[0]})`)
writeFileSync('.superpowers/trich/bao-cao.txt', baoCao.join('\n') + '\n')
console.log(`${baoCao.filter((x) => x.startsWith('LIỀU?')).length} liều cần xem; báo cáo đầy đủ: .superpowers/trich/bao-cao.txt`)
if (khongKhop.size) process.exit(1)
