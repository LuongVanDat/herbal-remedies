import { screen, within } from '@testing-library/svelte'
import { expect, test } from 'vitest'
import TrangNguon from '../../src/routes/TrangNguon.svelte'
import { renderVoiData } from '../helpers-ui'

test('TrangNguon: mỗi văn bản có link url và số đã/chưa đối chiếu từ thongKe', () => {
  renderVoiData(TrangNguon, {})
  const li = screen.getByRole('listitem')
  expect(within(li).getByRole('link', { name: /Nguồn dữ liệu kiểm thử/ })).toHaveAttribute('href', 'https://example.org/test')
  expect(li).toHaveTextContent('0/TEST')
  expect(li).toHaveTextContent('4 đã đối chiếu · 9 chưa đối chiếu')
})
