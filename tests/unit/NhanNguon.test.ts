import { screen } from '@testing-library/svelte'
import { expect, test } from 'vitest'
import NhanNguon from '../../src/components/NhanNguon.svelte'
import { renderVoiData } from '../helpers-ui'

test('NhanNguon: trang + chưa đối chiếu', () => {
  renderVoiData(NhanNguon, { nguon: { ma: 'test', trang: 42, trang_thai: 'chua_doi_chieu' } })
  const n = screen.getByText('TEST tr.42 · chưa đối chiếu')
  expect(n).toHaveClass('chua')
})
test('NhanNguon: muc thay trang, đã đối chiếu', () => {
  renderVoiData(NhanNguon, { nguon: { ma: 'test', muc: 'Mục 2', trang_thai: 'da_doi_chieu' } })
  expect(screen.getByText('TEST Mục 2 · đã đối chiếu')).toHaveClass('da')
})
test('NhanNguon: null → "chưa xác minh"', () => {
  renderVoiData(NhanNguon, { nguon: null })
  expect(screen.getByText('chưa xác minh')).toHaveClass('chua-xac-minh')
})
test('NhanNguon: link tới trang nguồn', () => {
  renderVoiData(NhanNguon, { nguon: { ma: 'test', trang: 1, trang_thai: 'da_doi_chieu' } })
  expect(screen.getByRole('link')).toHaveAttribute('href', '#/nguon')
})
