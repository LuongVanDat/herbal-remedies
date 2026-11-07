import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { BaiThuocSchema, BenhSchema, NguonFileSchema, TrieuChungFileSchema, ViThuocSchema } from '../src/schema'
import type { RawData } from '../src/validate'

export const FIXTURE_DIR = 'tests/fixtures/valid'

export function taiFixtureHopLe(dir = FIXTURE_DIR): RawData {
  const doc = (p: string) => parse(readFileSync(join(dir, p), 'utf8'))
  const ds = <T>(sub: string, s: { parse: (x: unknown) => T }) =>
    readdirSync(join(dir, sub)).sort().map((f) => ({ file: join(dir, sub, f), data: s.parse(doc(join(sub, f))) }))
  return {
    benh: ds('benh', BenhSchema),
    baiThuoc: ds('bai-thuoc', BaiThuocSchema),
    viThuoc: ds('vi-thuoc', ViThuocSchema),
    trieuChung: { file: join(dir, 'trieu-chung.yaml'), data: TrieuChungFileSchema.parse(doc('trieu-chung.yaml')) },
    nguon: { file: join(dir, 'nguon.yaml'), data: NguonFileSchema.parse(doc('nguon.yaml')) },
  }
}

export function sua(raw: RawData, f: (r: RawData) => void): RawData {
  const c = structuredClone(raw)
  f(c)
  return c
}
