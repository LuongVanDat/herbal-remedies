import { screen, within } from '@testing-library/svelte'
import { expect, test } from 'vitest'
import TrangThe from '../../src/routes/TrangThe.svelte'
import { appFixture, renderVoiData } from '../helpers-ui'

const bang = (ten: string) => screen.getByRole('table', { name: `Thành phần ${ten}` })

test('TrangThe: hiện pháp trị, mỗi bài thuốc có bảng: vị (link #/vi/…), liều "…g", vai trò Quân/Thần/Tá/Sứ, nhãn phổ biến', () => {
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' })
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Phong hàn')
  expect(screen.getByText(/Tân ôn giải biểu/)).toBeInTheDocument()
  const b = bang('Ma hoàng thang')
  const dong = within(b).getAllByRole('row').slice(1)
  expect(dong).toHaveLength(4)
  const queChi = dong.find((r) => r.textContent!.includes('Quế chi'))!
  expect(within(queChi).getByRole('link', { name: 'Quế chi' })).toHaveAttribute('href', '#/vi/que-chi')
  expect(queChi).toHaveTextContent('4g')
  expect(queChi).toHaveTextContent('Thần')
  expect(queChi).toHaveTextContent('Phổ biến')
  expect(dong.find((r) => r.textContent!.includes('Ma hoàng'))).toHaveTextContent('Quân')
})

test('vị có độc: cảnh báo hiện sẵn trong bảng, không cần bấm', () => {
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' })
  const phuTu = within(bang('Ma hoàng thang')).getAllByRole('row').find((r) => r.textContent!.includes('Phụ tử chế'))!
  expect(phuTu).toHaveTextContent('Có độc')
  expect(phuTu).toHaveTextContent('quá liều gây ngộ độc aconitin')
  expect(phuTu).toHaveTextContent('Hiếm')
})

test('liều vượt có lý do: hiện lý do trong bảng', () => {
  const d = appFixture()
  d.baiThuoc['ma-hoang-thang'].thanh_phan[1] = { vi: 'que-chi', lieu_g: 20, vai_tro: 'than', vuot_lieu_ly_do: 'Văn bản gốc ghi 20g' }
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' }, d)
  const queChi = within(bang('Ma hoàng thang')).getAllByRole('row').find((r) => r.textContent!.includes('Quế chi'))!
  expect(queChi).toHaveTextContent('Vượt liều chuẩn (tối đa 12g): Văn bản gốc ghi 20g')
})

test('hiện cách dùng, gia giảm, kiêng kỵ, nhãn nguồn của bài và của thể', () => {
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' })
  expect(screen.getByText('Sắc uống, ngày 1 thang, chia 2 lần.')).toBeInTheDocument()
  expect(screen.getByText('Ho nhiều: thêm Cát cánh')).toBeInTheDocument()
  expect(screen.getByText('Người ra nhiều mồ hôi')).toBeInTheDocument()
  expect(screen.getByText('TEST tr.1 · chưa đối chiếu')).toBeInTheDocument()   // thể
  expect(screen.getByText('TEST tr.3 · chưa đối chiếu')).toBeInTheDocument()   // bài
  expect(screen.getByText(/Thương hàn luận/)).toBeInTheDocument()
})

test('có link quay lại trang bệnh', () => {
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' })
  expect(screen.getByRole('link', { name: /Cảm mạo/ })).toHaveAttribute('href', '#/benh/cam-mao')
})

test('theId không thuộc bệnh → KhongTimThay', () => {
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'khong-co' })
  expect(screen.getByRole('heading', { name: 'Không tìm thấy' })).toBeInTheDocument()
})

test('I1: vị chưa có liều chuẩn → cột Lưu ý ghi "Chưa có liều chuẩn"', () => {
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' })
  const camThao = within(bang('Ma hoàng thang')).getAllByRole('row').find((r) => r.textContent!.includes('Cam thảo'))!
  expect(camThao).toHaveTextContent('Chưa có liều chuẩn')
  const queChi = within(bang('Ma hoàng thang')).getAllByRole('row').find((r) => r.textContent!.includes('Quế chi'))!
  expect(queChi).not.toHaveTextContent('Chưa có liều chuẩn')
})

test('I2: vị ít độc hiện nhãn và cảnh báo trong bảng', () => {
  const d = appFixture()
  d.viThuoc['ma-hoang'].doc_tinh = { muc: 'it', canh_bao: 'Gây tăng huyết áp, mất ngủ' }
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' }, d)
  const maHoang = within(bang('Ma hoàng thang')).getAllByRole('row').find((r) => r.textContent!.includes('Ma hoàng'))!
  expect(maHoang).toHaveTextContent('Ít độc')
  expect(maHoang).toHaveTextContent('Gây tăng huyết áp, mất ngủ')
})

test('link quay lại giữ các triệu chứng đã tích gần nhất của bệnh', async () => {
  const { ghiNhoTc } = await import('../../src/url-state')
  ghiNhoTc('cam-mao', 'so-lanh-nhieu,khong-mo-hoi')
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' })
  expect(screen.getByRole('link', { name: /Cảm mạo/ }))
    .toHaveAttribute('href', '#/benh/cam-mao?tc=so-lanh-nhieu,khong-mo-hoi')
  ghiNhoTc('cam-mao', '')
})

test('bảng hiện tên vị như trong bài, liều dạng chữ, loại bài và mô tả thể', () => {
  const d = appFixture()
  const b = d.baiThuoc['ma-hoang-thang']
  b.loai = 'co_phuong'
  b.thanh_phan[2] = { vi: 'cam-thao', ten_trong_bai: 'Chích thảo', lieu_g: 6, vai_tro: 'su', vuot_lieu_ly_do: null }
  b.thanh_phan[1] = { vi: 'que-chi', lieu_g: null, lieu_text: 'vừa đủ', vai_tro: 'than', vuot_lieu_ly_do: null }
  d.benh[0].the_benh[0].mo_ta = 'Thường gặp do lạnh.'
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' }, d)
  const dong = within(bang('Ma hoàng thang')).getAllByRole('row')
  const chich = dong.find((r) => r.textContent!.includes('Chích thảo'))!
  expect(within(chich).getByRole('link', { name: 'Chích thảo' })).toHaveAttribute('href', '#/vi/cam-thao')
  expect(chich).toHaveTextContent('vị: Cam thảo')
  expect(dong.find((r) => r.textContent!.includes('Quế chi'))).toHaveTextContent('vừa đủ')
  expect(screen.getByText('Cổ phương')).toBeInTheDocument()
  expect(screen.getByText('Thường gặp do lạnh.')).toBeInTheDocument()
})

test('vị độc tính chưa rõ: không gắn nhãn trong bảng, có ghi chú dưới bảng', () => {
  const d = appFixture()
  d.viThuoc['que-chi'].doc_tinh = { muc: 'chua_ro', canh_bao: null }
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' }, d)
  const queChi = within(bang('Ma hoàng thang')).getAllByRole('row').find((r) => r.textContent!.includes('Quế chi'))!
  expect(queChi).not.toHaveTextContent('⚠')
  expect(screen.getAllByText(/Vị không có nhãn độc chưa chắc an toàn/).length).toBeGreaterThan(0)
})

test('bài không có vai trò: ẩn cột Vai trò', () => {
  const d = appFixture()
  d.baiThuoc['ma-hoang-thang'].thanh_phan.forEach((t) => (t.vai_tro = null))
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' }, d)
  expect(within(bang('Ma hoàng thang')).queryByRole('columnheader', { name: 'Vai trò' })).toBeNull()
})

test('mọi vị đều chưa có liều chuẩn: một ghi chú dưới bảng thay vì lặp từng dòng', () => {
  const d = appFixture()
  for (const v of Object.values(d.viThuoc)) v.lieu_dung = null
  renderVoiData(TrangThe, { benhId: 'cam-mao', theId: 'phong-han' }, d)
  const b = bang('Ma hoàng thang')
  expect(within(b).queryByText('Chưa có liều chuẩn')).toBeNull()
  expect(screen.getAllByText(/Các vị trong bài chưa có liều chuẩn để đối chiếu/).length).toBeGreaterThan(0)
})
