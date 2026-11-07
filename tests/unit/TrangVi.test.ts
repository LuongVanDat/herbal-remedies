import { screen, within } from '@testing-library/svelte'
import { expect, test } from 'vitest'
import TrangVi from '../../src/routes/TrangVi.svelte'
import { appFixture, renderVoiData } from '../helpers-ui'

test('TrangVi: đủ trường spec §3.5', () => {
  renderVoiData(TrangVi, { id: 'que-chi' })
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quế chi')
  for (const t of ['Ramulus Cinnamomi', 'Cành non', 'Cay, ngọt, ấm', 'Tâm, Phế, Bàng quang', 'Phát hãn giải biểu',
    '4–12g', 'Không độc', 'Phổ biến', 'Dữ liệu kiểm thử'])
    expect(screen.getAllByText(new RegExp(t)).length, t).toBeGreaterThan(0)
  expect(screen.getAllByText('TEST tr.11 · đã đối chiếu').length).toBeGreaterThanOrEqual(2) // nguồn vị + nguồn liều
})

test('TrangVi: lieu_dung null → "Chưa có liều chuẩn"', () => {
  renderVoiData(TrangVi, { id: 'cam-thao' })
  expect(screen.getByText('Chưa có liều chuẩn')).toBeInTheDocument()
})

test('TrangVi: vị có độc hiện cảnh báo nổi bật và kiêng kỵ', () => {
  renderVoiData(TrangVi, { id: 'phu-tu-che' })
  expect(screen.getByRole('alert')).toHaveTextContent('Có độc')
  expect(screen.getByRole('alert')).toHaveTextContent('ngộ độc aconitin')
  expect(screen.getByText('Phụ nữ có thai')).toBeInTheDocument()
})

test('TrangVi: thay thế không nguồn có nhãn "chưa xác minh"; vị thay thế là link', () => {
  renderVoiData(TrangVi, { id: 'cam-thao' })
  const tt = screen.getByTestId('thay-the')
  expect(within(tt).getByRole('link', { name: 'Quế chi' })).toHaveAttribute('href', '#/vi/que-chi')
  expect(within(tt).getByText('chưa xác minh')).toBeInTheDocument()
  expect(tt).toHaveTextContent('Thay thế giả định cho kiểm thử')
})

test('TrangVi: không có vị thay thế → ghi rõ', () => {
  renderVoiData(TrangVi, { id: 'que-chi' })
  expect(screen.getByTestId('thay-the')).toHaveTextContent('Chưa có dữ liệu vị thay thế')
})

test('TrangVi: "Có trong các bài thuốc" liệt kê từ viTrongBai', () => {
  renderVoiData(TrangVi, { id: 'cam-thao' })
  const s = screen.getByRole('region', { name: 'Có trong các bài thuốc' })
  expect(within(s).getAllByRole('listitem').map((li) => li.textContent!.trim().split(/\s+—/)[0]).sort())
    .toEqual(['Ma hoàng thang', 'Ngân kiều tán'])
})

test('TrangVi: id lạ → KhongTimThay', () => {
  renderVoiData(TrangVi, { id: 'khong-co' })
  expect(screen.getByRole('heading', { name: 'Không tìm thấy' })).toBeInTheDocument()
})

test('TrangVi: vị thay thế có độc có nhãn độc tính', () => {
  const d = appFixture()
  d.viThuoc['cam-thao'].thay_the = [{ vi: 'phu-tu-che', ghi_chu: 'x', nguon: null }]
  renderVoiData(TrangVi, { id: 'cam-thao' }, d)
  expect(screen.getByTestId('thay-the')).toHaveTextContent('⚠ Có độc')
})

test('TrangVi: "Có trong các bài thuốc" là link tới thể bệnh dùng bài đó', () => {
  renderVoiData(TrangVi, { id: 'que-chi' })
  const s = screen.getByRole('region', { name: 'Có trong các bài thuốc' })
  expect(within(s).getByRole('link', { name: /Cảm mạo · Phong hàn/ })).toHaveAttribute('href', '#/benh/cam-mao/phong-han')
  expect(s).toHaveTextContent('Ma hoàng thang')
})
