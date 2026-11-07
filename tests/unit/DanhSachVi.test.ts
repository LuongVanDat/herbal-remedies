import { fireEvent, screen } from '@testing-library/svelte'
import { expect, test } from 'vitest'
import DanhSachVi from '../../src/routes/DanhSachVi.svelte'
import { appFixture, renderVoiData } from '../helpers-ui'

const ten = () => screen.queryAllByRole('link').map((a) => a.textContent!.trim()).filter((t) => t !== '')

test('DanhSachVi: liệt kê đủ, sắp theo tên', () => {
  renderVoiData(DanhSachVi, {})
  expect(ten()).toEqual(['Cam thảo', 'Kim ngân hoa', 'Ma hoàng', 'Phụ tử chế', 'Quế chi'])
})
test('DanhSachVi: tìm không dấu (tên, tên khoa học)', async () => {
  renderVoiData(DanhSachVi, {})
  await fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'que chi' } })
  expect(ten()).toEqual(['Quế chi'])
  await fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'lonicerae' } })
  expect(ten()).toEqual(['Kim ngân hoa'])
})
test('DanhSachVi: lọc pho_bien=cao', async () => {
  renderVoiData(DanhSachVi, {})
  await fireEvent.change(screen.getByLabelText('Mức phổ biến'), { target: { value: 'cao' } })
  expect(ten()).toEqual(['Cam thảo', 'Kim ngân hoa', 'Quế chi'])
})
test('DanhSachVi: lọc doc_tinh ∈ {co, rat_doc}', async () => {
  renderVoiData(DanhSachVi, {})
  await fireEvent.click(screen.getByLabelText('Chỉ vị có độc'))
  expect(ten()).toEqual(['Phụ tử chế'])
})

test('DanhSachVi: vị không có pho_bien vẫn hiện, lọc theo mức thì bị loại', async () => {
  const d = appFixture()
  d.viThuoc['que-chi'].pho_bien = null
  renderVoiData(DanhSachVi, {}, d)
  expect(ten()).toContain('Quế chi')
  await fireEvent.change(screen.getByLabelText('Mức phổ biến'), { target: { value: 'cao' } })
  expect(ten()).not.toContain('Quế chi')
})
