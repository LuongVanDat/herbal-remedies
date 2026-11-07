import { CAU_HINH, type CauHinh } from './config'
import type { Benh } from './schema'

export type KetQuaThe = { theId: string; diem: number; khop: string[]; thieu: string[]; mauThuan: string[] }
export type KetQuaXepHang = {
  daTichGi: boolean
  ketQua: KetQuaThe[]
  khoPhanBiet: null | { a: string; b: string; trieuChungPhanBiet: string[] }
  khongRo: boolean
  nguyHiem: string[]
}

export function xepHang(benh: Benh, daTich: Set<string>, cauHinh: CauHinh = CAU_HINH): KetQuaXepHang {
  const { heSoChinh, heSoPhu, heSoLoaiTru, nguongSatNhau, nguongKhop } = cauHinh

  const tcCuaBenh = new Set(
    benh.the_benh.flatMap((t) => [...t.trieu_chung.chinh, ...t.trieu_chung.phu, ...t.loai_tru]),
  )
  const daTichGi = [...daTich].some((id) => tcCuaBenh.has(id))
  const nguyHiem = benh.dau_hieu_nguy_hiem.filter((d) => daTich.has(d.id)).map((d) => d.id)

  const ketQua = benh.the_benh
    .map((t): KetQuaThe => {
      const { chinh, phu } = t.trieu_chung
      const toiDa = heSoChinh * chinh.length + heSoPhu * phu.length
      const co = (id: string) => daTich.has(id)
      const dat = heSoChinh * chinh.filter(co).length + heSoPhu * phu.filter(co).length
      const mauThuan = t.loai_tru.filter(co)
      const tru = heSoLoaiTru * mauThuan.length
      const tatCa = [...chinh, ...phu]
      return {
        theId: t.id,
        diem: Math.max(0, (dat - tru) / toiDa),
        khop: tatCa.filter(co),
        thieu: tatCa.filter((id) => !co(id)),
        mauThuan,
      }
    })
    .sort((x, y) => y.diem - x.diem)

  let khoPhanBiet: KetQuaXepHang['khoPhanBiet'] = null
  if (daTichGi && ketQua.length >= 2 && ketQua[0].diem - ketQua[1].diem < nguongSatNhau) {
    const the = (id: string) => benh.the_benh.find((t) => t.id === id)!
    const tc = (id: string) => [...the(id).trieu_chung.chinh, ...the(id).trieu_chung.phu]
    const [a, b] = [ketQua[0].theId, ketQua[1].theId]
    const sa = new Set(tc(a))
    const sb = new Set(tc(b))
    khoPhanBiet = {
      a,
      b,
      trieuChungPhanBiet: [...tc(a).filter((id) => !sb.has(id)), ...tc(b).filter((id) => !sa.has(id))],
    }
  }

  return { daTichGi, ketQua, khoPhanBiet, khongRo: daTichGi && ketQua[0].diem < nguongKhop, nguyHiem }
}
