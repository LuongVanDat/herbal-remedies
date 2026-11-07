import type { BaiThuoc, Benh, NguonVanBan, NhomTrieuChung, ViThuoc } from './schema'
import { tatCaNguon, type RawData } from './validate'

export type AppData = {
  benh: Benh[]
  baiThuoc: Record<string, BaiThuoc>
  viThuoc: Record<string, ViThuoc>
  trieuChung: Record<string, { ten: string; nhom: string }>
  nhomTrieuChung: NhomTrieuChung[]
  nguon: Record<string, NguonVanBan>
  viTrongBai: Record<string, string[]>
  thongKe: Record<string, { daDoiChieu: number; chuaDoiChieu: number }>
}

export function buildAppData(raw: RawData): AppData {
  const theoId = <T extends { id: string }>(ds: { data: T }[]) => Object.fromEntries(ds.map((d) => [d.data.id, d.data]))

  const trieuChung: AppData['trieuChung'] = {}
  for (const n of raw.trieuChung.data.nhom) for (const t of n.trieu_chung) trieuChung[t.id] = { ten: t.ten, nhom: n.id }

  const viTrongBai: AppData['viTrongBai'] = {}
  for (const { data } of raw.baiThuoc)
    for (const tp of data.thanh_phan) {
      const ds = (viTrongBai[tp.vi] ??= [])
      if (!ds.includes(data.id)) ds.push(data.id)
    }

  const thongKe: AppData['thongKe'] = {}
  for (const v of raw.nguon.data.van_ban) thongKe[v.ma] = { daDoiChieu: 0, chuaDoiChieu: 0 }
  for (const { nguon } of tatCaNguon(raw)) {
    const t = (thongKe[nguon.ma] ??= { daDoiChieu: 0, chuaDoiChieu: 0 })
    if (nguon.trang_thai === 'da_doi_chieu') t.daDoiChieu++
    else t.chuaDoiChieu++
  }

  return {
    benh: raw.benh.map((b) => b.data),
    baiThuoc: theoId(raw.baiThuoc),
    viThuoc: theoId(raw.viThuoc),
    trieuChung,
    nhomTrieuChung: raw.trieuChung.data.nhom,
    nguon: Object.fromEntries(raw.nguon.data.van_ban.map((v) => [v.ma, v])),
    viTrongBai,
    thongKe,
  }
}
