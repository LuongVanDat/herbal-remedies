import { expect, test } from 'vitest'
import { boPhanDung, chiaChinhPhu, slug, timVi, xacNhanLieu, type DongDanhMuc } from '../../scripts/trich/lib'

const dm: DongDanhMuc[] = [
  { stt: 46, trang: 153, ten: 'Cam thảo', ten_khac: [], nguon_goc: 'B', ten_khoa_hoc: 'Radix et Rhizoma Glycyrrhizae', ten_cay: 'Glycyrrhiza spp.' },
  { stt: 18, trang: 152, ten: 'Bạch linh', ten_khac: ['Phục linh'], nguon_goc: 'B', ten_khoa_hoc: 'Poria', ten_cay: 'Poria cocos' },
  { stt: 26, trang: 153, ten: 'Bạch truật', ten_khac: [], nguon_goc: 'B', ten_khoa_hoc: 'Rhizoma Atractylodis macrocephalae', ten_cay: 'x' },
  { stt: 255, trang: 160, ten: 'Phụ tử', ten_khac: [], nguon_goc: 'B', ten_khoa_hoc: 'Radix Aconiti lateralis', ten_cay: 'x' },
]

test('slug bỏ dấu, kebab-case', () => {
  expect(slug('Can thận hư (thiên dương hư)')).toBe('can-than-hu-thien-duong-hu')
  expect(slug('  Đau âm ỉ, chân gối yếu ')).toBe('dau-am-i-chan-goi-yeu')
})

test('timVi: trùng tên, tên khác, bỏ phần cách chế trong ngoặc, bí danh', () => {
  const bd = { 'chich thao': 'Cam thảo', 'hac phu tu': 'Phụ tử' }
  expect(timVi('Cam thảo', dm, bd)?.ten).toBe('Cam thảo')
  expect(timVi('Phục linh', dm, bd)?.ten).toBe('Bạch linh')
  expect(timVi('Bạch truật (sao cám)', dm, bd)?.ten).toBe('Bạch truật')
  expect(timVi('Bach truật', dm, bd)?.ten).toBe('Bạch truật')
  expect(timVi('Chích thảo', dm, bd)?.ten).toBe('Cam thảo')
  expect(timVi('Hắc phụ tử', dm, bd)?.ten).toBe('Phụ tử')
  expect(timVi('Không có', dm, bd)).toBeNull()
})

test('chiaChinhPhu: triệu chứng riêng của thể là chính, dùng chung với thể khác là phụ', () => {
  const r = chiaChinhPhu([['a', 'b', 'x'], ['a', 'c'], ['a', 'b']])
  expect(r[0]).toEqual({ chinh: ['x'], phu: ['a', 'b'] })
  expect(r[1]).toEqual({ chinh: ['c'], phu: ['a'] })
  expect(r[2]).toEqual({ chinh: ['a', 'b'], phu: [] }) // không có triệu chứng riêng → tất cả là chính
})

test('xacNhanLieu: tìm tên và số gam cạnh nhau trong chữ trang (cho phép số 0 đầu, khoảng trắng, xuống dòng giữa tên)', () => {
  const trang = '  Can khương  08g  Quế chi  08g\n  Bach truật (sao cám) 20g  Hy thiêm thảo  20g\n  Thiên niên\n kiện 20g'
  expect(xacNhanLieu(trang, 'Can khương', 8)).toBe(true)
  expect(xacNhanLieu(trang, 'Quế chi', 8)).toBe(true)
  expect(xacNhanLieu(trang, 'Quế chi', 12)).toBe(false)
  expect(xacNhanLieu(trang, 'Bạch truật (sao cám)', 20)).toBe(true) // lỗi in "Bach"
  expect(xacNhanLieu(trang, 'Hy thiêm thảo', 20)).toBe(true)
  expect(xacNhanLieu(trang, 'Thiên niên kiện', 20)).toBe(true)
})

test('boPhanDung dịch từ tên khoa học vị thuốc', () => {
  expect(boPhanDung('Radix et Rhizoma Glycyrrhizae')).toBe('Rễ và thân rễ')
  expect(boPhanDung('Rhizoma Zingiberis')).toBe('Thân rễ')
  expect(boPhanDung('Semen Coicis')).toBe('Hạt')
  expect(boPhanDung('Poria')).toBeUndefined()
})

test('xacNhanLieu: chấp nhận dạng "A, B, C mỗi vị 30g" (cùng câu)', () => {
  const trang = '- Nghiệm phương: Râu mèo, Kim tiền thảo, vỏ rễ cây dâu,\n rau má mỗi vị 30g, nếu dùng tươi liều gấp 3. Bài khác: Cam thảo 04g.'
  expect(xacNhanLieu(trang, 'Râu mèo', 30)).toBe(true)
  expect(xacNhanLieu(trang, 'vỏ rễ cây dâu', 30)).toBe(true)
  expect(xacNhanLieu(trang, 'Râu mèo', 20)).toBe(false)
  expect(xacNhanLieu(trang, 'Cam thảo', 30)).toBe(false)
})
