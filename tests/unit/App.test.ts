import { render, screen } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import { expect, test, vi } from 'vitest'
import { appFixture } from '../helpers-ui'

vi.mock('../../src/data', async () => ({ appData: (await import('../helpers-ui')).appFixture() }))
vi.mock('../../src/components/ThongBaoCapNhat.svelte', async () => ({ default: (await import('./TrongRong.svelte')).default }))
void appFixture

test('đổi hash chỉ khác tc trên cùng bệnh → trạng thái tích theo link mới', async () => {
  history.replaceState(null, '', '/#/benh/cam-mao?tc=sot-cao')
  const { default: App } = await import('../../src/App.svelte')
  render(App)
  expect(screen.getByLabelText('Sốt cao')).toBeChecked()
  history.replaceState(null, '', '/#/benh/cam-mao?tc=so-lanh-nhieu')
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  flushSync()
  expect(screen.getByLabelText('Sợ lạnh nhiều')).toBeChecked()
  expect(screen.getByLabelText('Sốt cao')).not.toBeChecked()
})
