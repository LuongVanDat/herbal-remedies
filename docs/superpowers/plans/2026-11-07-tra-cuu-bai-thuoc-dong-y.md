# Tra cứu bài thuốc Đông y — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web app tĩnh (PWA, offline) cho phép chọn bệnh → tích triệu chứng → xếp hạng thể bệnh → xem bài thuốc và vị thuốc, mọi thông tin kèm nguồn.

**Architecture:** Dữ liệu YAML trong `data/` được script build đọc, kiểm tra (Zod + quy tắc nghiệp vụ) và xuất `src/generated/data.json`; app Svelte đọc JSON này lúc build. Logic thuần (schema, validate, scoring, search, router, url-state) tách khỏi UI và có unit test; UI chỉ ghép các hàm đó.

**Tech Stack:** Node 22 LTS, npm, Vite, TypeScript (strict), Svelte 5 (runes), Zod 3, `yaml`, `tsx`, Vitest, @testing-library/svelte, Playwright, vite-plugin-pwa, GitHub Actions + GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-07-tra-cuu-bai-thuoc-dong-y-design.md` — đọc kèm plan; các mục được tham chiếu dạng "spec §N".

## Global Constraints

- Không dùng AI/LLM, không backend, không đăng nhập (spec §1).
- Không dùng nguồn bản lậu; chỉ các mã nguồn trong spec §2.
- `id` kebab-case không dấu, regex `^[a-z0-9]+(-[a-z0-9]+)*$`, duy nhất trong mỗi loại.
- Tên trường YAML đúng như spec §3 (tiếng Việt không dấu, snake_case).
- Hệ số điểm: chính = 2, phụ = 1, loại trừ = −2; `nguongSatNhau = 0.15`; `nguongKhop = 0.50` (spec §4).
- Câu chân trang nguyên văn: *"Thông tin tham khảo cá nhân, không thay thế chẩn đoán của thầy thuốc."*
- Nhãn nguồn dạng `<tên ngắn> tr.<trang> · chưa đối chiếu|đã đối chiếu`; liều null → "Chưa có liều chuẩn"; thay thế không nguồn → "chưa xác minh"; `?tc=` có mã lạ → "Một số triệu chứng trong link không còn tồn tại".
- Định tuyến hash (`#/…`), mobile-first, sáng/tối theo `prefers-color-scheme`.
- `src/generated/` không commit (đã có trong `.gitignore`).

## Review Focus

1. **Văn bản gốc ghi liều dạng khoảng** ("12–16g") trong khi spec chỉ có `lieu_g: number` → schema phải báo lỗi rõ ràng kèm tên file và trường, không crash (Task 2). *Câu hỏi mở cho người dùng — xem cuối plan.*
2. **Chuỗi Unicode tổ hợp (NFD)** trong YAML hoặc từ bàn phím điện thoại → `boDau` phải cho cùng kết quả với NFC (Task 1).
3. **`?tc=` bẩn** (`,a,,a,` hoặc mã lạ) → bỏ phần rỗng, khử trùng lặp, đếm số mã bỏ qua (Task 6).
4. **File YAML rỗng hoặc thư mục con thiếu** → báo lỗi schema theo tên file hoặc coi như danh sách rỗng, không ném exception (Task 5).
5. **Bệnh chỉ có một thể** → `khoPhanBiet` phải là `null`, không truy cập phần tử thứ hai (Task 4).

---

## File map

```
package.json, vite.config.ts, tsconfig.json, svelte.config.js, playwright.config.ts, index.html
.github/workflows/ci.yml
data/{benh,bai-thuoc,vi-thuoc}/*.yaml, data/trieu-chung.yaml, data/nguon.yaml
scripts/build-data.ts          CLI: đọc → kiểm tra → xuất JSON
src/
  schema.ts                    Zod schema + kiểu (Task 2)
  load.ts                      đọc thư mục YAML → RawData (Task 5)
  validate.ts                  quy tắc spec §6 (Task 3)
  app-data.ts                  RawData → AppData (Task 5)
  scoring.ts, config.ts        spec §4 (Task 4)
  search.ts                    bỏ dấu + tìm kiếm (Task 1)
  router.ts, url-state.ts      hash route + ?tc= (Task 6)
  data.ts                      import JSON, export appData: AppData (Task 6)
  App.svelte, main.ts
  routes/{TrangChu,TrangBenh,TrangThe,DanhSachVi,TrangVi,TrangNguon,KhongTimThay}.svelte
  components/{NhanNguon,BangThanhPhan,DanhSachTich,BangXepHang,ChanTrang,ThongBaoCapNhat}.svelte
tests/
  fixtures/valid/…             bộ dữ liệu hợp lệ nhỏ (Task 2)
  fixtures/invalid/<quy-tac>/… mỗi quy tắc một bộ sai (Task 3)
  unit/*.test.ts, e2e/*.spec.ts
```

---

### Task 1: Khởi tạo dự án + tìm kiếm không dấu

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `svelte.config.js`, `index.html`, `src/main.ts`, `src/App.svelte` (tạm hiển thị "OK")
- Create: `src/search.ts`
- Test: `tests/unit/search.test.ts`

**Interfaces:**
- Produces: `boDau(s: string): string`; `timKiem<T>(items: T[], q: string, truong: (t: T) => string[]): T[]`

- [ ] **Step 1:** `npm create vite@latest . -- --template svelte-ts`, sau đó cài `zod yaml` và dev `tsx vitest @testing-library/svelte jsdom @playwright/test vite-plugin-pwa`. Scripts trong `package.json`: `"data": "tsx scripts/build-data.ts"`, `"check": "tsx scripts/build-data.ts --check"`, `"predev": "npm run data"`, `"prebuild": "npm run data"`, `"dev": "vite"`, `"build": "vite build"`, `"test": "vitest run"`, `"e2e": "playwright test"`. Vite `base: './'`.
- [ ] **Step 2: Viết test thất bại**

```ts
import { boDau, timKiem } from '../../src/search';
test('bỏ dấu và đ', () => expect(boDau('Cảm Mạo Đau đầu')).toBe('cam mao dau dau'));
test('NFD cho cùng kết quả NFC', () => expect(boDau('Cảm mạo'.normalize('NFD'))).toBe('cam mao'));
test('gộp khoảng trắng, trim', () => expect(boDau('  mất   ngủ ')).toBe('mat ngu'));
test('tìm theo nhiều trường, không dấu, theo từng từ', () => {
  const ds = [{ ten: 'Cảm mạo', khac: ['cảm lạnh'] }, { ten: 'Thất miên', khac: ['mất ngủ'] }];
  expect(timKiem(ds, 'mat ngu', t => [t.ten, ...t.khac]).map(t => t.ten)).toEqual(['Thất miên']);
  expect(timKiem(ds, 'lanh cam', t => [t.ten, ...t.khac])).toHaveLength(1);
  expect(timKiem(ds, '', t => [t.ten])).toHaveLength(2);
});
```

- [ ] **Step 3:** `npm test` → FAIL (module not found).
- [ ] **Step 4:** Cài đặt `src/search.ts`: `normalize('NFD')`, xóa `\p{M}`, `đ/Đ → d`, lowercase, gộp khoảng trắng. `timKiem`: mọi từ của truy vấn đều phải xuất hiện trong chuỗi ghép các trường; truy vấn rỗng trả về toàn bộ, giữ thứ tự.
- [ ] **Step 5:** `npm test` → PASS; `npx vite build` không lỗi (tạm bỏ `prebuild` hoặc chạy `vite build` trực tiếp vì chưa có script data).
- [ ] **Step 6:** Commit `feat: khởi tạo dự án và tìm kiếm không dấu`.

---

### Task 2: Schema Zod + bộ dữ liệu mẫu hợp lệ

**Files:**
- Create: `src/schema.ts`
- Create: `tests/fixtures/valid/` (`nguon.yaml`, `trieu-chung.yaml`, `benh/cam-mao.yaml`, `bai-thuoc/{ma-hoang-thang,ngan-kieu-tan}.yaml`, `vi-thuoc/{ma-hoang,que-chi,cam-thao,kim-ngan-hoa,phu-tu-che}.yaml`)
- Test: `tests/unit/schema.test.ts`

**Interfaces:**
- Produces (Zod schema + `z.infer` type cùng tên không hậu tố `Schema`):
  `IdSchema`, `NguonRefSchema` → `NguonRef { ma; trang?: number; muc?: string; trang_thai: 'chua_doi_chieu'|'da_doi_chieu' }` (refine: phải có `trang` hoặc `muc`),
  `NguonFileSchema` → `{ van_ban: NguonVanBan[] }`, `NguonVanBan { ma; ten; ten_ngan; so_hieu; ngay; url }`,
  `TrieuChungFileSchema` → `{ nhom: NhomTrieuChung[] }`, `NhomTrieuChung { id; ten; trieu_chung: {id; ten}[] }`,
  `BenhSchema` → `Benh`, `TheBenh`, `DauHieuNguyHiem` (spec §3.3; `loai_tru`, `ten_khac`, `dau_hieu_nguy_hiem` mặc định `[]`; `chinh` `.min(1)`),
  `BaiThuocSchema` → `BaiThuoc`, `ThanhPhan` (spec §3.4; `vai_tro: 'quan'|'than'|'ta'|'su'|null`; `lieu_g: z.number().positive()`; `vuot_lieu_ly_do: string|null` mặc định null),
  `ViThuocSchema` → `ViThuoc`, `ThayThe` (spec §3.5; `lieu_dung` nullable; `doc_tinh.muc` enum `khong|it|co|rat_doc`; `pho_bien.muc` enum `cao|trung_binh|thap`; `thay_the[].nguon` nullable).
- Mọi object dùng `.strict()` để bắt sai tên trường.
- `ten_ngan` trong `NguonVanBan` (vd "QĐ 5013") dùng cho nhãn nguồn — bổ sung so với spec §2, cần cho §5.

- [ ] **Step 1: Viết test thất bại**

```ts
test('mọi file trong fixtures/valid parse thành công', ...)   // duyệt thư mục, chọn schema theo thư mục
test('id có dấu hoặc viết hoa bị từ chối', () => expect(IdSchema.safeParse('Cam-mao').success).toBe(false));
test('NguonRef thiếu cả trang và muc bị từ chối', ...)
test('lieu_g dạng chuỗi "12-16" bị từ chối, lỗi chỉ ra path thanh_phan.0.lieu_g', () => {
  const r = BaiThuocSchema.safeParse({ ...baiHopLe, thanh_phan: [{ vi: 'que-chi', lieu_g: '12-16', vai_tro: null }] });
  expect(r.success).toBe(false);
  expect(r.error!.issues[0].path).toEqual(['thanh_phan', 0, 'lieu_g']);
});
test('trường lạ bị từ chối (strict)', ...)
```

- [ ] **Step 2:** `npm test -- schema` → FAIL.
- [ ] **Step 3:** Viết `src/schema.ts` và fixtures. Fixture `cam-mao` có 2 thể: `phong-han` (chinh `so-lanh-nhieu, khong-mo-hoi`; phu `dau-dau, reu-luoi-trang-mong`; loai_tru `sot-cao, khat-nuoc` → bài `ma-hoang-thang`) và `phong-nhiet` (chinh `sot-cao, ra-mo-hoi`; phu `khat-nuoc, dau-dau`; loai_tru `so-lanh-nhieu` → bài `ngan-kieu-tan`); 1 `dau_hieu_nguy_hiem`. `phu-tu-che` có `doc_tinh.muc: co` + cảnh báo; `cam-thao` có một `thay_the` với `nguon: null`. Số liệu trong fixture là dữ liệu test, ghi `nguon.ma: test` (khai trong `nguon.yaml` của fixture).
- [ ] **Step 4:** `npm test -- schema` → PASS.
- [ ] **Step 5:** Commit `feat: schema dữ liệu và fixtures`.

---

### Task 3: Quy tắc kiểm tra dữ liệu

**Files:**
- Create: `src/validate.ts`
- Create: `tests/fixtures/invalid/<ma-quy-tac>/…` (bản sao fixture hợp lệ đã sửa đúng 1 chỗ, hoặc dựng in-memory trong test từ RawData hợp lệ — ưu tiên in-memory, chỉ dùng thư mục khi test cần đi qua `loadData`)
- Test: `tests/unit/validate.test.ts`

**Interfaces:**
- Consumes: kiểu từ Task 2.
- Produces:
  `type Loaded<T> = { file: string; data: T }`
  `type RawData = { benh: Loaded<Benh>[]; baiThuoc: Loaded<BaiThuoc>[]; viThuoc: Loaded<ViThuoc>[]; trieuChung: Loaded<TrieuChungFile>; nguon: Loaded<NguonFile> }`
  `type VanDe = { ma: MaQuyTac; file: string; truong: string; thongDiep: string }`
  `validate(raw: RawData): { loi: VanDe[]; canhBao: VanDe[] }`
  (`RawData`, `Loaded` export từ `src/validate.ts`.)

Mã quy tắc (`MaQuyTac`) — lỗi: `trung-id`, `tham-chieu`, `thieu-nguon`, `vuot-lieu`, `thieu-canh-bao`, `mau-thuan-loai-tru`; cảnh báo: `thay-the-chua-xac-minh`, `chua-doi-chieu`, `khong-duoc-dung`, `the-trung-nhau`, `chua-co-lieu`. (`chinh` rỗng và sai cấu trúc đã do schema chặn.)

- [ ] **Step 1: Viết test thất bại** — một test cho mỗi mã, dạng:

```ts
const ok = taiFixtureHopLe();   // tests/helpers.ts: đọc đồng bộ tests/fixtures/valid bằng yaml + schema Task 2, trả RawData (độc lập với loadData của Task 5)
test('fixture hợp lệ: không lỗi', () => expect(validate(ok).loi).toEqual([]));
test('vuot-lieu', () => {
  const raw = sua(ok, r => { r.baiThuoc[0].data.thanh_phan[0].lieu_g = 999; });
  expect(validate(raw).loi).toContainEqual(expect.objectContaining({ ma: 'vuot-lieu', file: expect.stringContaining('ma-hoang-thang') }));
});
test('vuot-lieu được phép khi có vuot_lieu_ly_do', ...)
test('vuot-lieu không xét khi lieu_dung null (chỉ cảnh báo chua-co-lieu)', ...)
test('tham-chieu: vị, bài thuốc, triệu chứng chinh/phu/loai_tru, thay_the.vi, nguon.ma', ...) // mỗi loại 1 assertion
test('trung-id trong cùng loại; cùng id khác loại thì không lỗi', ...)
test('thieu-canh-bao khi muc co/rat_doc và canh_bao null hoặc ""', ...)
test('mau-thuan-loai-tru', ...)
test('canhBao chứa thay-the-chua-xac-minh cho cam-thao', ...)
test('the-trung-nhau khi 2 thể cùng bộ chinh∪phu', ...)
test('khong-duoc-dung cho triệu chứng khai báo mà không thể nào dùng', ...)
```

`sua` = `structuredClone` rồi áp hàm sửa.

- [ ] **Step 2:** `npm test -- validate` → FAIL.
- [ ] **Step 3:** Cài đặt `validate`. `truong` là path kiểu `thanh_phan[0].lieu_g`. `thieu-nguon` ở đây chỉ xét `lieu_dung != null && !lieu_dung.nguon` (các `nguon` bắt buộc khác schema đã chặn). `chua-doi-chieu` sinh **một** cảnh báo tổng hợp mỗi mã nguồn ("qd-5013: 12 mục chưa đối chiếu"), không phải mỗi mục một dòng.
- [ ] **Step 4:** `npm test -- validate` → PASS.
- [ ] **Step 5:** Commit `feat: quy tắc kiểm tra dữ liệu`.

---

### Task 4: Tính điểm xếp hạng thể bệnh

**Files:**
- Create: `src/config.ts`, `src/scoring.ts`
- Test: `tests/unit/scoring.test.ts`

**Interfaces:**
- Consumes: `Benh` (Task 2).
- Produces:
  `CAU_HINH: CauHinh = { heSoChinh: 2, heSoPhu: 1, heSoLoaiTru: 2, nguongSatNhau: 0.15, nguongKhop: 0.5 }`
  `xepHang(benh: Benh, daTich: Set<string>, cauHinh?: CauHinh): KetQuaXepHang`
  `KetQuaThe = { theId: string; diem: number; khop: string[]; thieu: string[]; mauThuan: string[] }`
  `KetQuaXepHang = { daTichGi: boolean; ketQua: KetQuaThe[]; khoPhanBiet: null | { a: string; b: string; trieuChungPhanBiet: string[] }; khongRo: boolean; nguyHiem: string[] }`

- [ ] **Step 1: Viết test thất bại** (dùng `cam-mao` fixture, nạp bằng `BenhSchema.parse` từ YAML):

```ts
test('khớp đủ phong hàn', () => {
  const r = xepHang(camMao, new Set(['so-lanh-nhieu','khong-mo-hoi','dau-dau','reu-luoi-trang-mong']));
  expect(r.ketQua[0]).toMatchObject({ theId: 'phong-han', diem: 1, thieu: [] });
});
test('điểm = (dat − tru)/toiDa', () => {
  // phong-nhiet: toiDa 2*2+2=6; tích sot-cao(2)+dau-dau(1)+so-lanh-nhieu(loại trừ −2) → 1/6
  const r = xepHang(camMao, new Set(['sot-cao','dau-dau','so-lanh-nhieu']));
  expect(r.ketQua.find(k => k.theId==='phong-nhiet')!.diem).toBeCloseTo(1/6);
  expect(r.ketQua.find(k => k.theId==='phong-nhiet')!.mauThuan).toEqual(['so-lanh-nhieu']);
});
test('điểm không âm', ...)                      // chỉ tích loại trừ → 0
test('khoPhanBiet khi chênh < 0.15, kèm hiệu đối xứng', ...)  // tích dau-dau → cả hai 1/6 → khoPhanBiet, trieuChungPhanBiet không chứa dau-dau
test('khongRo khi đầu bảng < 0.5 và đã tích', ...)
test('chưa tích gì: daTichGi=false, khongRo=false, khoPhanBiet=null', ...)
test('nguyHiem trả id dấu hiệu đã tích; không ảnh hưởng điểm', ...)
test('bằng điểm giữ thứ tự khai báo', ...)
test('bệnh 1 thể: khoPhanBiet null', ...)       // Review Focus 5
```

- [ ] **Step 2:** `npm test -- scoring` → FAIL.
- [ ] **Step 3:** Cài đặt theo công thức spec §4. Sắp xếp ổn định (`Array.prototype.sort` ổn định từ ES2019). `trieuChungPhanBiet` giữ thứ tự: của thể a trước, rồi b.
- [ ] **Step 4:** `npm test -- scoring` → PASS.
- [ ] **Step 5:** Commit `feat: thuật toán xếp hạng thể bệnh`.

---

### Task 5: Đọc YAML, dựng AppData, CLI build-data

**Files:**
- Create: `src/load.ts`, `src/app-data.ts`, `scripts/build-data.ts`
- Create: `data/nguon.yaml` (khai đủ các văn bản spec §2 với `ten_ngan`, `so_hieu`, `ngay`, `url`), `data/trieu-chung.yaml` (`nhom: []`), thư mục `data/{benh,bai-thuoc,vi-thuoc}/.gitkeep`
- Test: `tests/unit/load.test.ts`, `tests/unit/app-data.test.ts`, `tests/unit/build-cli.test.ts`

**Interfaces:**
- Consumes: schema (Task 2), `validate`, `RawData`, `VanDe` (Task 3).
- Produces:
  `loadData(dir: string): Promise<{ raw: RawData; loiSchema: VanDe[] }>` — mã lỗi schema: `schema`.
  `buildAppData(raw: RawData): AppData`
  `AppData = { benh: Benh[]; baiThuoc: Record<string, BaiThuoc>; viThuoc: Record<string, ViThuoc>; trieuChung: Record<string, { ten: string; nhom: string }>; nhomTrieuChung: NhomTrieuChung[]; nguon: Record<string, NguonVanBan>; viTrongBai: Record<string, string[]>; thongKe: Record<string, { daDoiChieu: number; chuaDoiChieu: number }> }`
  CLI: `tsx scripts/build-data.ts [--check] [--dir <thư mục>] [--out <file>]`, mặc định `--dir data` hoặc biến môi trường `DATA_DIR`, `--out src/generated/data.json`. Mã thoát 1 nếu có lỗi.

- [ ] **Step 1: Viết test thất bại**

```ts
test('loadData fixture hợp lệ: không lỗi schema, đủ số file', ...)
test('file YAML rỗng → 1 lỗi schema đúng tên file, không throw', ...)      // Review Focus 4 (thư mục tạm qua fs.mkdtemp)
test('thiếu thư mục bai-thuoc → coi như rỗng, không throw', ...)
test('chỉ đọc .yaml/.yml', ...)
test('buildAppData: viTrongBai["cam-thao"] chứa cả 2 bài', ...)
test('buildAppData: thongKe đếm mọi NguonRef (thể, bài, vị, lieu_dung, thay_the) theo mã', ...)
test('CLI --check trên fixture hợp lệ: exit 0, không ghi file', ...)     // execa/child_process + tsx
test('CLI trên thư mục lỗi: exit 1, stdout có "LỖI" và tên file', ...)
```

- [ ] **Step 2:** `npm test -- load app-data build-cli` → FAIL.
- [ ] **Step 3:** Cài đặt. `loadData` dùng `fs/promises` + `yaml.parse`, `safeParse`; lỗi Zod chuyển thành `VanDe` với `truong` từ `issue.path`. Script in: từng lỗi `LỖI [ma] file › truong: thongDiep`, từng cảnh báo `CẢNH BÁO …`, dòng tổng kết. Có lỗi schema thì không chạy `validate`.
- [ ] **Step 4:** Tests PASS; `npm run check` trên `data/` thật (đang rỗng) → exit 0.
- [ ] **Step 5:** Commit `feat: script build dữ liệu`.

---

### Task 6: Router, trạng thái URL, khung app, trang chủ

**Files:**
- Create: `src/router.ts`, `src/url-state.ts`, `src/data.ts`
- Create: `src/routes/TrangChu.svelte`, `src/routes/KhongTimThay.svelte`, `src/components/ChanTrang.svelte`
- Modify: `src/App.svelte`
- Test: `tests/unit/router.test.ts`, `tests/unit/url-state.test.ts`, `tests/unit/TrangChu.test.ts`

**Interfaces:**
- Consumes: `boDau`, `timKiem` (Task 1); `AppData` (Task 5).
- Produces:
  `type Route = { ten: 'chu' } | { ten: 'benh'; id: string; tc: string } | { ten: 'the'; benhId: string; theId: string } | { ten: 'dsVi' } | { ten: 'vi'; id: string } | { ten: 'nguon' } | { ten: 'khongThay' }`
  `parseHash(hash: string): Route`; `href(r: Route): string`
  `docTc(raw: string, hopLe: Set<string>): { ids: string[]; boQua: number }`; `ghiTc(ids: string[]): string`
  `appData: AppData` (từ `src/data.ts`, import `./generated/data.json`)
  `App.svelte` nghe `hashchange`, render trang theo route; mọi trang có `ChanTrang` (câu chân trang nguyên văn).

- [ ] **Step 1: Viết test thất bại**

```ts
test.each([
  ['', { ten: 'chu' }], ['#/', { ten: 'chu' }],
  ['#/benh/cam-mao?tc=a,b', { ten: 'benh', id: 'cam-mao', tc: 'a,b' }],
  ['#/benh/cam-mao/phong-han', { ten: 'the', benhId: 'cam-mao', theId: 'phong-han' }],
  ['#/vi', { ten: 'dsVi' }], ['#/vi/que-chi', { ten: 'vi', id: 'que-chi' }],
  ['#/nguon', { ten: 'nguon' }], ['#/xyz', { ten: 'khongThay' }],
])('parseHash(%s)', (h, r) => expect(parseHash(h)).toEqual(r));
test('href ∘ parseHash là đồng nhất', ...)
test('docTc bỏ rỗng, khử trùng, đếm mã lạ', () =>
  expect(docTc(',a,,a,zz,', new Set(['a','b']))).toEqual({ ids: ['a'], boQua: 1 }));   // Review Focus 3
test('ghiTc([]) = ""; ghiTc(["a","b"]) = "a,b"', ...)
test('TrangChu: gõ "cam mao" lọc ra Cảm mạo; có link #/vi và #/nguon', ...)  // render với AppData dựng từ fixture
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Cài đặt. Trang chủ tìm theo `ten`, `ten_yhhd`, `ten_khac`. Trang không tìm thấy có nút về `#/`. CSS: biến màu trên `:root`, ghi đè trong `@media (prefers-color-scheme: dark)`.
- [ ] **Step 4:** `npm test` PASS; `DATA_DIR=tests/fixtures/valid npm run dev` mở được trang chủ (kiểm tra tay).
- [ ] **Step 5:** Commit `feat: router, trạng thái URL và trang chủ`.

---

### Task 7: Trang bệnh — tích triệu chứng và bảng xếp hạng

**Files:**
- Create: `src/routes/TrangBenh.svelte`, `src/components/DanhSachTich.svelte`, `src/components/BangXepHang.svelte`
- Test: `tests/unit/TrangBenh.test.ts`

**Interfaces:**
- Consumes: `xepHang`, `CAU_HINH` (Task 4); `docTc`, `ghiTc`, `href` (Task 6); `appData`.
- Produces: `TrangBenh` props `{ id: string; tc: string }`.

- [ ] **Step 1: Viết test thất bại** (render với AppData fixture):

```ts
test('danh sách tích gồm hợp triệu chứng mọi thể, kể cả loai_tru, nhóm theo nhóm, không trùng', ...)
test('chưa tích: hiện "Hãy tích triệu chứng", không hiện %', ...)
test('tích so-lanh-nhieu + khong-mo-hoi: dòng đầu "Phong hàn" và cập nhật location.hash có tc=', ...)
test('tc có mã lạ: hiện "Một số triệu chứng trong link không còn tồn tại"', ...)
test('tích dấu hiệu nguy hiểm: hiện khung "Cần đi khám ngay", bảng xếp hạng vẫn hiện', ...)
test('khoPhanBiet: hiện cảnh báo khó phân biệt kèm tên triệu chứng phân biệt', ...)
test('khongRo: hiện "không có thể nào khớp rõ — nên đi khám thầy thuốc"', ...)
test('mở rộng một dòng: hiện khớp / thiếu / mâu thuẫn; link tới #/benh/cam-mao/phong-han', ...)
test('id bệnh không tồn tại → render KhongTimThay', ...)
```

- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Cài đặt. Trạng thái tích là `$state<Set>` khởi tạo từ `docTc`; mỗi thay đổi ghi lại hash bằng `history.replaceState` (không tạo mục lịch sử mỗi lần tích). Bảng xếp hạng `position: sticky; bottom: 0`, thu gọn hiển thị top 3, chạm để mở toàn bộ. Dấu hiệu nguy hiểm ở đầu, không nằm trong nhóm.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat: trang bệnh với tích triệu chứng và xếp hạng`.

---

### Task 8: Trang thể bệnh, bảng thành phần, nhãn nguồn

**Files:**
- Create: `src/routes/TrangThe.svelte`, `src/components/BangThanhPhan.svelte`, `src/components/NhanNguon.svelte`
- Test: `tests/unit/TrangThe.test.ts`, `tests/unit/NhanNguon.test.ts`

**Interfaces:**
- Consumes: `appData`, `href`, `NguonRef`.
- Produces: `NhanNguon` props `{ nguon: NguonRef | null }` — null → "chưa xác minh"; có giá trị → `"<ten_ngan> tr.<trang>|<muc> · chưa đối chiếu|đã đối chiếu"`, class `chua`/`da`. `BangThanhPhan` props `{ bai: BaiThuoc }`.

- [ ] **Step 1: Viết test thất bại**

```ts
test('NhanNguon: "QĐ 5013 tr.42 · chưa đối chiếu"; muc thay trang; null → "chưa xác minh"', ...)
test('TrangThe: hiện pháp trị, mỗi bài thuốc có bảng: vị (link #/vi/…), liều "…g", vai trò Quân/Thần/Tá/Sứ, nhãn phổ biến', ...)
test('vị có độc: cảnh báo hiện sẵn trong bảng, không cần bấm', ...)
test('hiện cách dùng, gia giảm, kiêng kỵ, nhãn nguồn của bài và của thể', ...)
test('theId không thuộc bệnh → KhongTimThay', ...)
```

- [ ] **Step 2:** FAIL. **Step 3:** cài đặt. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat: trang thể bệnh và bài thuốc`.

---

### Task 9: Trang vị thuốc, danh sách vị, trang nguồn

**Files:**
- Create: `src/routes/TrangVi.svelte`, `src/routes/DanhSachVi.svelte`, `src/routes/TrangNguon.svelte`
- Test: `tests/unit/TrangVi.test.ts`, `tests/unit/DanhSachVi.test.ts`, `tests/unit/TrangNguon.test.ts`

**Interfaces:**
- Consumes: `appData` (`viTrongBai`, `thongKe`), `NhanNguon`, `timKiem`, `href`.

- [ ] **Step 1: Viết test thất bại**

```ts
test('TrangVi: đủ trường spec §3.5; lieu_dung null → "Chưa có liều chuẩn"', ...)
test('TrangVi: thay thế không nguồn có nhãn "chưa xác minh"; vị thay thế là link', ...)
test('TrangVi: "Có trong các bài thuốc" liệt kê từ viTrongBai', ...)
test('DanhSachVi: tìm không dấu; lọc pho_bien=cao; lọc doc_tinh ∈ {co, rat_doc}', ...)
test('TrangNguon: mỗi văn bản có link url và số đã/chưa đối chiếu từ thongKe', ...)
```

- [ ] **Step 2:** FAIL. **Step 3:** cài đặt. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat: trang vị thuốc và nguồn`.

---

### Task 10: PWA offline, e2e, CI/CD

**Files:**
- Modify: `vite.config.ts` (thêm `VitePWA({ registerType: 'prompt', manifest: { name: 'Tra cứu bài thuốc', short_name: 'Bài thuốc', lang: 'vi', display: 'standalone', … } })`)
- Create: `src/components/ThongBaoCapNhat.svelte` (dùng `virtual:pwa-register/svelte`; nội dung "Có dữ liệu mới — tải lại"), icon `public/icon-192.png`, `public/icon-512.png`
- Create: `playwright.config.ts` (webServer: `DATA_DIR=tests/fixtures/valid npm run build && npx vite preview --port 4173`), `tests/e2e/luong-chinh.spec.ts`
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Viết e2e thất bại**

```ts
test('luồng chính', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('cam mao');
  await page.getByRole('link', { name: 'Cảm mạo' }).click();
  await page.getByLabel('Sợ lạnh nhiều').check();
  await page.getByLabel('Không mồ hôi').check();
  await expect(page.getByTestId('xep-hang').locator('li').first()).toContainText('Phong hàn');
  await page.getByTestId('xep-hang').getByRole('link', { name: /Phong hàn/ }).click();
  await page.getByRole('link', { name: 'Quế chi' }).click();
  await expect(page.getByText('Có trong các bài thuốc')).toBeVisible();
});
test('offline sau lần tải đầu', async ({ page, context }) => {
  await page.goto('/'); await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true); await page.reload();
  await expect(page.getByRole('searchbox')).toBeVisible();
});
```

- [ ] **Step 2:** `npx playwright install chromium && npm run e2e` → FAIL (chưa có PWA, test offline đỏ).
- [ ] **Step 3:** Cấu hình PWA + thông báo cập nhật.
- [ ] **Step 4:** `npm run e2e` → PASS.
- [ ] **Step 5:** Viết `ci.yml`: trigger push/PR; job `test`: Node 22, `npm ci`, `npm run check`, `npm test`, `npx playwright install --with-deps chromium`, `npm run e2e`, `npm run build`; job `deploy` (`needs: test`, chỉ `main`): `actions/upload-pages-artifact` thư mục `dist` + `actions/deploy-pages`. Kiểm tra cú pháp bằng `npx --yes action-validator .github/workflows/ci.yml` (hoặc đọc lại kỹ nếu không có mạng).
- [ ] **Step 6:** Commit `feat: PWA offline, e2e và CI/CD`.

---

### Task 11: Dữ liệu thử nghiệm từ QĐ 5013

Không có TDD theo nghĩa code; "test" là `npm run check` và sự đối chiếu của người dùng.

**Files:**
- Create: `data/benh/*.yaml` (2–3 bệnh), `data/bai-thuoc/*.yaml`, `data/vi-thuoc/*.yaml`; Modify: `data/trieu-chung.yaml`

- [ ] **Step 1:** Tải toàn văn QĐ 5013/QĐ-BYT (ưu tiên cổng Bộ Y tế / vbpl.vn; nếu chỉ có bản trên luatvietnam.vn hoặc Sở Y tế thì ghi URL đó vào `nguon.yaml`) vào thư mục scratch riêng; `pdftotext -layout`. Không commit PDF.
- [ ] **Step 2:** Báo người dùng danh sách bệnh có trong văn bản, đề xuất 2–3 bệnh phổ biến cho thử nghiệm; **chờ người dùng chọn**.
- [ ] **Step 3:** Trích từng bệnh: thể, triệu chứng (phân chính/phụ theo cách văn bản trình bày — nếu văn bản không phân biệt, xếp triệu chứng đặc trưng phân biệt các thể vào `chinh` và ghi chú trong commit), `loai_tru` chỉ khi suy ra trực tiếp từ triệu chứng thể đối lập, pháp trị, bài thuốc, liều, cách dùng, số trang. Vị thuốc: tên theo TT 05/2015, `pho_bien` từ danh mục BHYT, `lieu_dung: null` trừ khi có nguồn Dược điển đáng tin. Mọi `trang_thai: chua_doi_chieu`. Không điền thông tin không có trong nguồn.
- [ ] **Step 4:** `npm run check` → exit 0; liệt kê cảnh báo cho người dùng.
- [ ] **Step 5:** `npm run dev`, đi thử luồng với dữ liệu thật.
- [ ] **Step 6:** Commit `data: thử nghiệm <các bệnh> từ QĐ 5013`.
- [ ] **Step 7:** Bàn giao cho người dùng đối chiếu; ghi lại các điểm schema chưa khớp văn bản (đặc biệt liều dạng khoảng) để quyết định trước khi mở rộng.

---

## Câu hỏi mở (không chặn Task 1–10)

- **Liều dạng khoảng:** văn bản YHCT thường ghi "12–16g". Spec hiện chỉ cho `lieu_g: number`. Nếu Task 11 xác nhận văn bản ghi khoảng, cần sửa spec (vd `lieu_g: number | { min: number; max: number }`) trước khi mở rộng dữ liệu.
