import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { FIXTURE_DIR } from '../helpers'

const tmp: string[] = []
const moi = () => { const d = mkdtempSync(join(tmpdir(), 'btdy-cli-')); tmp.push(d); return d }
afterEach(() => tmp.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })))
const chay = (...args: string[]) =>
  spawnSync('node_modules/.bin/tsx', ['scripts/build-data.ts', ...args], { encoding: 'utf8' })

test('CLI --check trên fixture hợp lệ: exit 0, không ghi file', () => {
  const out = join(moi(), 'data.json')
  const r = chay('--check', '--dir', FIXTURE_DIR, '--out', out)
  expect(r.status).toBe(0)
  expect(existsSync(out)).toBe(false)
  expect(r.stdout).toContain('CẢNH BÁO')
}, 30000)

test('CLI không --check: ghi JSON AppData', () => {
  const out = join(moi(), 'sub', 'data.json')
  const r = chay('--dir', FIXTURE_DIR, '--out', out)
  expect(r.status).toBe(0)
  expect(JSON.parse(readFileSync(out, 'utf8')).viThuoc['que-chi'].ten).toBe('Quế chi')
}, 30000)

test('CLI trên thư mục lỗi: exit 1, stdout có "LỖI" và tên file', () => {
  const d = moi()
  cpSync(FIXTURE_DIR, d, { recursive: true })
  writeFileSync(join(d, 'bai-thuoc', 'hong.yaml'),
    'id: hong\nten: Hỏng\nthanh_phan:\n  - { vi: khong-co, lieu_g: 3, vai_tro: null }\ncach_dung: a\nnguon: { ma: test, trang: 1, trang_thai: chua_doi_chieu }\n')
  const out = join(d, 'data.json')
  const r = chay('--dir', d, '--out', out)
  expect(r.status).toBe(1)
  expect(r.stdout).toMatch(/LỖI \[tham-chieu\] .*hong\.yaml/)
  expect(existsSync(out)).toBe(false)
}, 30000)

test('CLI đọc DATA_DIR khi không có --dir', () => {
  const out = join(moi(), 'data.json')
  const r = spawnSync('node_modules/.bin/tsx', ['scripts/build-data.ts', '--out', out], {
    encoding: 'utf8', env: { ...process.env, DATA_DIR: FIXTURE_DIR },
  })
  expect(r.status).toBe(0)
  expect(existsSync(out)).toBe(true)
}, 30000)
