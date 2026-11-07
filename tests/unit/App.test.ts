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

test('Back khôi phục vị trí cuộn; trang mới cuộn lên đầu', async () => {
  const cuon = vi.fn()
  window.scrollTo = cuon as any
  history.replaceState(null, '', '/#/benh/cam-mao')
  const { default: App } = await import('../../src/App.svelte')
  const { unmount } = render(App)
  const di = async (h: string) => {
    history.replaceState(null, '', h)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    flushSync()
    await new Promise((r) => setTimeout(r, 0))
  }
  Object.defineProperty(window, 'scrollY', { value: 640, configurable: true })
  window.dispatchEvent(new Event('scroll'))
  await di('/#/vi/que-chi')
  expect(cuon).toHaveBeenLastCalledWith(0, 0)
  await di('/#/benh/cam-mao?tc=sot-cao')
  expect(cuon).toHaveBeenLastCalledWith(0, 640)
  unmount()
})
