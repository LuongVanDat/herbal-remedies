import { expect, test } from 'vitest'
import { buildAppData } from '../../src/app-data'
import { taiFixtureHopLe } from '../helpers'

const app = buildAppData(taiFixtureHopLe())

test('buildAppData: tra cứu theo id', () => {
  expect(app.benh.map((b) => b.id)).toEqual(['cam-mao'])
  expect(app.baiThuoc['ngan-kieu-tan'].ten).toBe('Ngân kiều tán')
  expect(app.viThuoc['que-chi'].ten).toBe('Quế chi')
  expect(app.trieuChung['sot-cao']).toEqual({ ten: 'Sốt cao', nhom: 'han-nhiet' })
  expect(app.nguon.test.ten_ngan).toBe('TEST')
  expect(app.nhomTrieuChung).toHaveLength(4)
})

test('buildAppData: viTrongBai["cam-thao"] chứa cả 2 bài', () => {
  expect(app.viTrongBai['cam-thao'].sort()).toEqual(['ma-hoang-thang', 'ngan-kieu-tan'])
  expect(app.viTrongBai['que-chi']).toEqual(['ma-hoang-thang'])
})

test('buildAppData: thongKe đếm mọi NguonRef (thể, bài, vị, lieu_dung, thay_the) theo mã', () => {
  // thể: 1 chưa, 1 đã; bài: 1 chưa, 1 đã; vị nguon: 4 chưa, 1 đã (que-chi);
  // lieu_dung: ma-hoang, kim-ngan-hoa, phu-tu-che chưa; que-chi đã; thay_the: không có nguồn
  expect(app.thongKe).toEqual({ test: { daDoiChieu: 4, chuaDoiChieu: 9 } })
})
