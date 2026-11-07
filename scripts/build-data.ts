import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { buildAppData } from '../src/app-data'
import { loadData } from '../src/load'
import { validate, type VanDe } from '../src/validate'

const { values } = parseArgs({
  options: {
    check: { type: 'boolean', default: false },
    dir: { type: 'string', default: process.env.DATA_DIR || 'data' },
    out: { type: 'string', default: 'src/generated/data.json' },
  },
})

const dong = (nhan: string, v: VanDe) => `${nhan} [${v.ma}] ${v.file}${v.truong ? ` › ${v.truong}` : ''}: ${v.thongDiep}`

const { raw, loiSchema } = await loadData(values.dir!)
const { loi, canhBao } = loiSchema.length ? { loi: loiSchema, canhBao: [] } : validate(raw)

for (const v of loi) console.log(dong('LỖI', v))
for (const v of canhBao) console.log(dong('CẢNH BÁO', v))
console.log(`\n${values.dir}: ${loi.length} lỗi, ${canhBao.length} cảnh báo`)

if (loi.length) process.exit(1)
if (!values.check) {
  await mkdir(dirname(values.out!), { recursive: true })
  await writeFile(values.out!, JSON.stringify(buildAppData(raw)))
  console.log(`Đã ghi ${values.out}`)
}
