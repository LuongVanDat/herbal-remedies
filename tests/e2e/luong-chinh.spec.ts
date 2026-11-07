import { expect, test } from '@playwright/test'

test('luồng chính', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox').fill('cam mao')
  await page.getByRole('link', { name: /Cảm mạo/ }).click()
  await page.getByLabel('Sợ lạnh nhiều').check()
  await page.getByLabel('Không mồ hôi').check()
  await expect(page.getByTestId('xep-hang').locator('li').first()).toContainText('Phong hàn')
  await expect(page).toHaveURL(/tc=so-lanh-nhieu,khong-mo-hoi/)
  await page.getByTestId('xep-hang').getByRole('link', { name: /Phong hàn/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Phong hàn')
  await page.getByRole('link', { name: 'Quế chi' }).click()
  await expect(page.getByText('Có trong các bài thuốc')).toBeVisible()
  await page.goBack()
  await page.goBack()
  await expect(page.getByLabel('Sợ lạnh nhiều')).toBeChecked()
})

test('offline sau lần tải đầu', async ({ page, context }) => {
  await page.goto('/')
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null, null, { timeout: 15000 })
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('searchbox')).toBeVisible()
  await page.goto('/#/vi/que-chi')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Quế chi')
})
