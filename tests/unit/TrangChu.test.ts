import { fireEvent, screen } from '@testing-library/svelte'
import { expect, test } from 'vitest'
import TrangChu from '../../src/routes/TrangChu.svelte'
import { renderVoiData } from '../helpers-ui'

test('TrangChu: gõ "cam mao" lọc ra Cảm mạo; có link #/vi và #/nguon', async () => {
  renderVoiData(TrangChu, {})
  const o = screen.getByRole('searchbox')
  await fireEvent.input(o, { target: { value: 'cam mao' } })
  expect(screen.getByRole('link', { name: /Cảm mạo/ })).toHaveAttribute('href', '#/benh/cam-mao')
  await fireEvent.input(o, { target: { value: 'cảm lạnh' } })
  expect(screen.getByRole('link', { name: /Cảm mạo/ })).toBeInTheDocument()
  await fireEvent.input(o, { target: { value: 'xyz' } })
  expect(screen.queryByRole('link', { name: /Cảm mạo/ })).toBeNull()
  expect(screen.getByText(/Không tìm thấy bệnh/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Tra vị thuốc/ })).toHaveAttribute('href', '#/vi')
  expect(screen.getByRole('link', { name: /Nguồn tham khảo/ })).toHaveAttribute('href', '#/nguon')
})

test('ChanTrang có câu lưu ý nguyên văn', async () => {
  const { default: ChanTrang } = await import('../../src/components/ChanTrang.svelte')
  renderVoiData(ChanTrang, {})
  expect(screen.getByText('Thông tin tham khảo cá nhân, không thay thế chẩn đoán của thầy thuốc.')).toBeInTheDocument()
})

test('KhongTimThay có nút về trang chủ', async () => {
  const { default: K } = await import('../../src/routes/KhongTimThay.svelte')
  renderVoiData(K, {})
  expect(screen.getByRole('link', { name: /Về trang chủ/ })).toHaveAttribute('href', '#/')
})
