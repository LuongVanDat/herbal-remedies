import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'yaml'
import type { ZodType } from 'zod'
import { BaiThuocSchema, BenhSchema, NguonFileSchema, TrieuChungFileSchema, ViThuocSchema } from './schema'
import type { Loaded, RawData, VanDe } from './validate'
import { viErrorMap } from './zod-vi'

const duongDan = (path: (string | number)[]) =>
  path.reduce<string>((s, p) => (typeof p === 'number' ? `${s}[${p}]` : s ? `${s}.${p}` : p), '')

export async function loadData(dir: string): Promise<{ raw: RawData; loiSchema: VanDe[] }> {
  const loiSchema: VanDe[] = []

  async function docFile<T>(file: string, schema: ZodType<T, any, any>): Promise<T | null> {
    let doc: unknown
    try {
      doc = parse(await readFile(file, 'utf8'))
    } catch (e) {
      const thongDiep = (e as NodeJS.ErrnoException).code === 'ENOENT' ? 'Thiếu file' : `YAML lỗi: ${(e as Error).message}`
      loiSchema.push({ ma: 'schema', file, truong: '', thongDiep })
      return null
    }
    const r = schema.safeParse(doc, { errorMap: viErrorMap })
    if (r.success) return r.data
    for (const issue of r.error.issues)
      loiSchema.push({ ma: 'schema', file, truong: duongDan(issue.path), thongDiep: issue.message })
    return null
  }

  async function docThuMuc<T>(sub: string, schema: ZodType<T, any, any>): Promise<Loaded<T>[]> {
    let ten: string[]
    try {
      ten = await readdir(join(dir, sub))
    } catch {
      return []
    }
    const out: Loaded<T>[] = []
    for (const f of ten.filter((f) => /\.ya?ml$/.test(f)).sort()) {
      const file = join(dir, sub, f)
      const data = await docFile(file, schema)
      if (data) out.push({ file, data })
    }
    return out
  }

  const tcFile = join(dir, 'trieu-chung.yaml')
  const nguonFile = join(dir, 'nguon.yaml')
  const raw: RawData = {
    benh: await docThuMuc('benh', BenhSchema),
    baiThuoc: await docThuMuc('bai-thuoc', BaiThuocSchema),
    viThuoc: await docThuMuc('vi-thuoc', ViThuocSchema),
    trieuChung: { file: tcFile, data: (await docFile(tcFile, TrieuChungFileSchema)) ?? { nhom: [] } },
    nguon: { file: nguonFile, data: (await docFile(nguonFile, NguonFileSchema)) ?? { van_ban: [] } },
  }
  return { raw, loiSchema }
}
