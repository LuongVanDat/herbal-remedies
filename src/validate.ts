import type { BaiThuoc, Benh, NguonFile, NguonRef, TrieuChungFile, ViThuoc } from './schema'

export type Loaded<T> = { file: string; data: T }
export type RawData = {
  benh: Loaded<Benh>[]
  baiThuoc: Loaded<BaiThuoc>[]
  viThuoc: Loaded<ViThuoc>[]
  trieuChung: Loaded<TrieuChungFile>
  nguon: Loaded<NguonFile>
}

export type MaQuyTac =
  | 'schema'
  | 'trung-id'
  | 'tham-chieu'
  | 'thieu-nguon'
  | 'vuot-lieu'
  | 'thieu-canh-bao'
  | 'mau-thuan-loai-tru'
  | 'thay-the-chua-xac-minh'
  | 'chua-doi-chieu'
  | 'khong-duoc-dung'
  | 'the-trung-nhau'
  | 'chua-co-lieu'

export type VanDe = { ma: MaQuyTac; file: string; truong: string; thongDiep: string }

/** Mọi NguonRef trong dữ liệu, kèm vị trí — dùng chung cho validate và thống kê. */
export function tatCaNguon(raw: RawData): { file: string; truong: string; nguon: NguonRef }[] {
  const out: { file: string; truong: string; nguon: NguonRef }[] = []
  for (const { file, data } of raw.benh)
    data.the_benh.forEach((t, i) => out.push({ file, truong: `the_benh[${i}].nguon`, nguon: t.nguon }))
  for (const { file, data } of raw.baiThuoc) out.push({ file, truong: 'nguon', nguon: data.nguon })
  for (const { file, data } of raw.viThuoc) {
    out.push({ file, truong: 'nguon', nguon: data.nguon })
    if (data.lieu_dung?.nguon) out.push({ file, truong: 'lieu_dung.nguon', nguon: data.lieu_dung.nguon })
    data.thay_the.forEach((t, i) => {
      if (t.nguon) out.push({ file, truong: `thay_the[${i}].nguon`, nguon: t.nguon })
    })
  }
  return out
}

export function validate(raw: RawData): { loi: VanDe[]; canhBao: VanDe[] } {
  const loi: VanDe[] = []
  const canhBao: VanDe[] = []
  const L = (ma: MaQuyTac, file: string, truong: string, thongDiep: string) => loi.push({ ma, file, truong, thongDiep })
  const C = (ma: MaQuyTac, file: string, truong: string, thongDiep: string) =>
    canhBao.push({ ma, file, truong, thongDiep })

  const kiemTrung = (items: { id: string; file: string; truong: string }[], loai: string) => {
    const da = new Set<string>()
    for (const it of items) {
      if (da.has(it.id)) L('trung-id', it.file, it.truong, `${loai} trùng id "${it.id}"`)
      da.add(it.id)
    }
  }
  kiemTrung(raw.benh.map((b) => ({ id: b.data.id, file: b.file, truong: 'id' })), 'Bệnh')
  kiemTrung(raw.baiThuoc.map((b) => ({ id: b.data.id, file: b.file, truong: 'id' })), 'Bài thuốc')
  kiemTrung(raw.viThuoc.map((b) => ({ id: b.data.id, file: b.file, truong: 'id' })), 'Vị thuốc')
  kiemTrung(raw.nguon.data.van_ban.map((v, i) => ({ id: v.ma, file: raw.nguon.file, truong: `van_ban[${i}].ma` })), 'Nguồn')
  kiemTrung(
    raw.trieuChung.data.nhom.map((n, i) => ({ id: n.id, file: raw.trieuChung.file, truong: `nhom[${i}].id` })),
    'Nhóm triệu chứng',
  )
  kiemTrung(
    raw.trieuChung.data.nhom.flatMap((n, i) =>
      n.trieu_chung.map((t, j) => ({ id: t.id, file: raw.trieuChung.file, truong: `nhom[${i}].trieu_chung[${j}].id` })),
    ),
    'Triệu chứng',
  )
  for (const { file, data } of raw.benh) {
    kiemTrung(data.the_benh.map((t, i) => ({ id: t.id, file, truong: `the_benh[${i}].id` })), 'Thể bệnh')
    kiemTrung(data.dau_hieu_nguy_hiem.map((d, i) => ({ id: d.id, file, truong: `dau_hieu_nguy_hiem[${i}].id` })), 'Dấu hiệu')
    data.the_benh.forEach((t, i) =>
      kiemTrung(t.bai_thuoc.map((id, j) => ({ id, file, truong: `the_benh[${i}].bai_thuoc[${j}]` })), 'Bài thuốc trong thể'),
    )
  }

  const maNguon = new Set(raw.nguon.data.van_ban.map((v) => v.ma))
  const idTC = new Set(raw.trieuChung.data.nhom.flatMap((n) => n.trieu_chung.map((t) => t.id)))
  const idBai = new Set(raw.baiThuoc.map((b) => b.data.id))
  const viMap = new Map(raw.viThuoc.map((v) => [v.data.id, v.data]))
  for (const { file, data } of raw.benh)
    data.dau_hieu_nguy_hiem.forEach((d, i) => {
      if (idTC.has(d.id))
        L('trung-id', file, `dau_hieu_nguy_hiem[${i}].id`, `Dấu hiệu nguy hiểm trùng id triệu chứng "${d.id}"`)
    })
  const thamChieu = (co: boolean, file: string, truong: string, loai: string, id: string) => {
    if (!co) L('tham-chieu', file, truong, `${loai} "${id}" không tồn tại`)
  }

  for (const n of tatCaNguon(raw)) thamChieu(maNguon.has(n.nguon.ma), n.file, `${n.truong}.ma`, 'Mã nguồn', n.nguon.ma)

  const tcDuocDung = new Set<string>()
  for (const { file, data } of raw.benh) {
    data.the_benh.forEach((t, i) => {
      const p = `the_benh[${i}]`
      const ds: [string, string[]][] = [
        ['trieu_chung.chinh', t.trieu_chung.chinh],
        ['trieu_chung.phu', t.trieu_chung.phu],
        ['loai_tru', t.loai_tru],
      ]
      for (const [ten, ids] of ds)
        ids.forEach((id, j) => {
          tcDuocDung.add(id)
          thamChieu(idTC.has(id), file, `${p}.${ten}[${j}]`, 'Triệu chứng', id)
        })
      t.bai_thuoc.forEach((id, j) => thamChieu(idBai.has(id), file, `${p}.bai_thuoc[${j}]`, 'Bài thuốc', id))
      const coTC = new Set([...t.trieu_chung.chinh, ...t.trieu_chung.phu])
      t.loai_tru.forEach((id, j) => {
        if (coTC.has(id))
          L('mau-thuan-loai-tru', file, `${p}.loai_tru[${j}]`, `"${id}" vừa là triệu chứng vừa là loại trừ của thể "${t.id}"`)
      })
    })
    // the-trung-nhau
    const daGap = new Map<string, string>()
    data.the_benh.forEach((t, i) => {
      const k = [...new Set([...t.trieu_chung.chinh, ...t.trieu_chung.phu])].sort().join(',')
      const truoc = daGap.get(k)
      if (truoc) C('the-trung-nhau', file, `the_benh[${i}]`, `Thể "${t.id}" có cùng bộ triệu chứng với "${truoc}"`)
      else daGap.set(k, t.id)
    })
  }

  const viDuocDung = new Set<string>()
  for (const { file, data } of raw.baiThuoc) {
    data.thanh_phan.forEach((tp, i) => {
      viDuocDung.add(tp.vi)
      const v = viMap.get(tp.vi)
      thamChieu(!!v, file, `thanh_phan[${i}].vi`, 'Vị thuốc', tp.vi)
      if (v?.lieu_dung && tp.lieu_g !== null && tp.lieu_g > v.lieu_dung.max_g && !tp.vuot_lieu_ly_do)
        L('vuot-lieu', file, `thanh_phan[${i}].lieu_g`, `${tp.lieu_g}g vượt liều tối đa ${v.lieu_dung.max_g}g của "${tp.vi}"`)
    })
  }

  for (const { file, data } of raw.viThuoc) {
    if (data.lieu_dung && !data.lieu_dung.nguon) L('thieu-nguon', file, 'lieu_dung.nguon', 'Liều dùng thiếu nguồn')
    if (!data.lieu_dung) C('chua-co-lieu', file, 'lieu_dung', `"${data.id}" chưa có liều chuẩn`)
    if ((data.doc_tinh.muc === 'co' || data.doc_tinh.muc === 'rat_doc') && !data.doc_tinh.canh_bao?.trim())
      L('thieu-canh-bao', file, 'doc_tinh.canh_bao', `Vị có độc tính "${data.doc_tinh.muc}" phải có cảnh báo`)
    data.thay_the.forEach((t, i) => {
      viDuocDung.add(t.vi)
      thamChieu(viMap.has(t.vi), file, `thay_the[${i}].vi`, 'Vị thuốc', t.vi)
      if (!t.nguon) C('thay-the-chua-xac-minh', file, `thay_the[${i}]`, `Thay thế "${t.vi}" chưa có nguồn`)
    })
  }

  // Danh mục vị có thể lớn hơn số vị được dùng (nhập cả danh mục) → gộp một dòng cho dễ đọc.
  const viKhongDung = raw.viThuoc.filter((v) => !viDuocDung.has(v.data.id)).map((v) => v.data.id)
  if (viKhongDung.length)
    C('khong-duoc-dung', raw.viThuoc[0].file.replace(/[^/]*$/, ''), 'id',
      `${viKhongDung.length} vị thuốc chưa bài nào dùng (vd: ${viKhongDung.slice(0, 3).join(', ')})`)
  raw.trieuChung.data.nhom.forEach((n, i) =>
    n.trieu_chung.forEach((t, j) => {
      if (!tcDuocDung.has(t.id))
        C('khong-duoc-dung', raw.trieuChung.file, `nhom[${i}].trieu_chung[${j}]`, `Triệu chứng "${t.id}" không thể bệnh nào dùng`)
    }),
  )

  const dem = new Map<string, number>()
  for (const n of tatCaNguon(raw))
    if (n.nguon.trang_thai === 'chua_doi_chieu') dem.set(n.nguon.ma, (dem.get(n.nguon.ma) ?? 0) + 1)
  for (const [ma, so] of dem) C('chua-doi-chieu', raw.nguon.file, ma, `${ma}: ${so} mục chưa đối chiếu`)

  return { loi, canhBao }
}
