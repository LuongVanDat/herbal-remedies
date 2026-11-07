import { fireEvent, screen, within } from '@testing-library/svelte'
import { beforeEach, expect, test } from 'vitest'
import TrangBenh from '../../src/routes/TrangBenh.svelte'
import { renderVoiData } from '../helpers-ui'

beforeEach(() => history.replaceState(null, '', '/#/benh/cam-mao'))
const xepHang = () => screen.getByTestId('xep-hang')

test('danh sách tích gồm hợp triệu chứng mọi thể, kể cả loai_tru, nhóm theo nhóm, không trùng', () => {
  renderVoiData(TrangBenh, { id: 'cam-mao', tc: '' })
  const tich = screen.getByTestId('danh-sach-tich')
  const nhan = within(tich).getAllByRole('checkbox').map((c) => c.closest('label')!.textContent!.trim())
  expect(nhan.sort()).toEqual(
    ['Sợ lạnh nhiều', 'Sốt cao', 'Không mồ hôi', 'Ra mồ hôi', 'Đau đầu', 'Khát nước', 'Rêu lưỡi trắng mỏng'].sort(),
  )
  expect(within(tich).getByRole('group', { name: 'Hàn nhiệt' })).toBeInTheDocument()
  expect(within(tich).getByRole('group', { name: 'Lưỡi – Mạch' })).toBeInTheDocument()
})

test('chưa tích: hiện "Hãy tích triệu chứng", không hiện %', () => {
  renderVoiData(TrangBenh, { id: 'cam-mao', tc: '' })
  expect(within(xepHang()).getByText(/Hãy tích triệu chứng/)).toBeInTheDocument()
  expect(xepHang().textContent).not.toMatch(/%/)
})

test('tích so-lanh-nhieu + khong-mo-hoi: dòng đầu "Phong hàn" và cập nhật location.hash có tc=', async () => {
  renderVoiData(TrangBenh, { id: 'cam-mao', tc: '' })
  await fireEvent.click(screen.getByLabelText('Sợ lạnh nhiều'))
  await fireEvent.click(screen.getByLabelText('Không mồ hôi'))
  const dong = within(xepHang()).getAllByRole('listitem')
  expect(dong[0]).toHaveTextContent('Phong hàn')
  expect(dong[0]).toHaveTextContent('67%')
  expect(location.hash).toBe('#/benh/cam-mao?tc=so-lanh-nhieu,khong-mo-hoi')
})

test('khôi phục trạng thái tích từ tc', () => {
  renderVoiData(TrangBenh, { id: 'cam-mao', tc: 'sot-cao,ra-mo-hoi' })
  expect(screen.getByLabelText('Sốt cao')).toBeChecked()
  expect(within(xepHang()).getAllByRole('listitem')[0]).toHaveTextContent('Phong nhiệt')
})

test('tc có mã lạ: hiện "Một số triệu chứng trong link không còn tồn tại"', () => {
  renderVoiData(TrangBenh, { id: 'cam-mao', tc: 'sot-cao,khong-ton-tai' })
  expect(screen.getByText('Một số triệu chứng trong link không còn tồn tại')).toBeInTheDocument()
})

test('tích dấu hiệu nguy hiểm: hiện khung "Cần đi khám ngay", bảng xếp hạng vẫn hiện', async () => {
  renderVoiData(TrangBenh, { id: 'cam-mao', tc: '' })
  expect(screen.queryByText(/Cần đi khám ngay/)).toBeNull()
  await fireEvent.click(screen.getByLabelText('Sốt cao > 39°C quá 3 ngày'))
  expect(screen.getByRole('alert')).toHaveTextContent('Cần đi khám ngay')
  expect(xepHang()).toBeInTheDocument()
  expect(location.hash).toContain('sot-cao-keo-dai')
})

test('khoPhanBiet: hiện cảnh báo khó phân biệt kèm tên triệu chứng phân biệt', () => {
  renderVoiData(TrangBenh, { id: 'cam-mao', tc: 'dau-dau' })
  const cb = screen.getByTestId('kho-phan-biet')
  expect(cb).toHaveTextContent('Khó phân biệt Phong hàn và Phong nhiệt')
  expect(cb).toHaveTextContent('Sợ lạnh nhiều')
  expect(cb).toHaveTextContent('Ra mồ hôi')
})

test('khongRo: hiện "không có thể nào khớp rõ — nên đi khám thầy thuốc"', () => {
  renderVoiData(TrangBenh, { id: 'cam-mao', tc: 'dau-dau' })
  expect(screen.getByText('Không có thể nào khớp rõ — nên đi khám thầy thuốc.')).toBeInTheDocument()
})

test('mở rộng một dòng: hiện khớp / thiếu / mâu thuẫn; link tới #/benh/cam-mao/phong-han', async () => {
  renderVoiData(TrangBenh, { id: 'cam-mao', tc: 'so-lanh-nhieu,sot-cao' })
  const dong = within(xepHang()).getAllByRole('listitem').find((li) => li.textContent!.includes('Phong hàn'))!
  await fireEvent.click(within(dong).getByRole('button', { name: /Chi tiết/ }))
  expect(dong).toHaveTextContent('Khớp: Sợ lạnh nhiều')
  expect(dong).toHaveTextContent('Chưa có: Không mồ hôi, Đau đầu, Rêu lưỡi trắng mỏng')
  expect(dong).toHaveTextContent('Mâu thuẫn: Sốt cao')
  expect(within(dong).getByRole('link', { name: /Phong hàn/ })).toHaveAttribute('href', '#/benh/cam-mao/phong-han')
})

test('id bệnh không tồn tại → render KhongTimThay', () => {
  renderVoiData(TrangBenh, { id: 'khong-co', tc: '' })
  expect(screen.getByRole('heading', { name: 'Không tìm thấy' })).toBeInTheDocument()
})
