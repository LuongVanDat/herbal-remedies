# Thiết kế: Web app tra cứu bài thuốc Đông y (dùng cá nhân)

- Ngày: 2026-11-07
- Trạng thái: chờ người dùng duyệt spec

## 1. Mục tiêu và phạm vi

**Mục tiêu:** Một web app cá nhân. Người dùng chọn bệnh và tích các triệu chứng đang có. App xếp hạng các thể bệnh theo mức độ khớp, sau đó cho xem bài thuốc tương ứng. Mỗi vị thuốc có đủ thông tin: liều dùng, cách dùng, độc tính, kiêng kỵ, mức độ phổ biến và vị có thể thay thế. **Mọi thông tin đều ghi rõ nguồn và trạng thái đối chiếu.**

**Người dùng nói rõ:**
- Tra cứu bài thuốc dựa trên tình trạng bệnh, chỉ dùng cá nhân.
- Cần độ chính xác. Với từng vị thuốc cần có: độ phổ biến, vị thay thế, liều dùng, cách dùng.
- Dữ liệu lấy từ nguồn chuẩn (hướng A). Người dùng không có file sách.
- Nhập bệnh theo cách: chọn bệnh, rồi tích triệu chứng.
- Web tĩnh, cài được lên điện thoại (PWA), dùng được khi không có mạng.
- Dữ liệu sửa trực tiếp trong file YAML, có lệnh kiểm tra dữ liệu, lưu lịch sử bằng git.
- Công nghệ: Vite + TypeScript + Svelte.

**Giả định (người dùng đã xác nhận qua các bước duyệt):**
- Chỉ có một người dùng. Không có đăng nhập, không có backend.
- Ưu tiên dữ liệu đúng và có nguồn, giao diện xếp sau.
- "Phổ biến" nghĩa là dễ mua ở Việt Nam. Căn cứ phải ghi rõ, ví dụ "có trong danh mục BHYT".

**Không làm (ngoài phạm vi):** AI hoặc LLM ở bất kỳ khâu nào. Nhập mô tả bệnh tự do. Trang quản trị. Đồng bộ dữ liệu online. Danh sách yêu thích. Xuất PDF. Tài khoản người dùng.

**Tiêu chí thành công:**
1. Với mỗi bệnh trong dữ liệu, tích triệu chứng thì ra bảng xếp hạng thể bệnh có giải thích được.
2. Mỗi bài thuốc và vị thuốc hiển thị nguồn kèm số trang và trạng thái đối chiếu.
3. Build bị chặn nếu dữ liệu vi phạm các quy tắc an toàn ở mục 6.
4. App mở được trên điện thoại khi không có mạng.

## 2. Nguồn dữ liệu

Chỉ dùng nguồn hợp pháp. Văn bản pháp luật không được bảo hộ bản quyền (Điều 15, Luật Sở hữu trí tuệ). **Không** dùng bản lậu của các sách còn bản quyền, ví dụ sách của Đỗ Tất Lợi hay giáo trình Phương tễ học.

| Mã | Văn bản | Vai trò |
|---|---|---|
| `qd-5013` | QĐ 5013/QĐ-BYT (01/12/2020): Hướng dẫn chẩn đoán và điều trị bệnh theo YHCT, kết hợp YHCT với YHHĐ | Nguồn cốt lõi: bệnh → thể → triệu chứng → pháp trị → bài thuốc → liều |
| `tt-05-2015` | TT 05/2015/TT-BYT (sửa đổi bởi TT 27/2020/TT-BYT) | Danh mục vị thuốc: tên chuẩn, trạng thái BHYT (dùng làm căn cứ "phổ biến") |
| `cv-855-2022` | Công văn 855/YDCT-QLD (2022) | Danh mục dược liệu và vị thuốc, dùng để đối chiếu tên |
| `dd-vn-v` / `dd-vn-vi` | Dược điển Việt Nam V/VI | Liều dùng chuẩn, tính vị, quy kinh, công năng, kiêng kỵ. Chỉ dùng khi có bản đáng tin cậy |
| `sach-*` | Sách giấy người dùng tự sở hữu | Dùng để đối chiếu. Người dùng tự nhập hoặc tự xác minh, ghi kèm số trang |

Chỉ ghi các văn bản thật sự được dùng vào `data/nguon.yaml`. Mỗi mục gồm: mã, tên đầy đủ, số hiệu, ngày ban hành, URL.

## 3. Cấu trúc dữ liệu

```
data/
  benh/<id>.yaml
  bai-thuoc/<id>.yaml
  vi-thuoc/<id>.yaml
  trieu-chung.yaml
  nguon.yaml
```

Mã `id` viết dạng kebab-case, không dấu, và không trùng trong cùng một loại.

### 3.1 Nguồn (khai báo dùng chung)

```yaml
nguon: { ma: qd-5013, trang: 42, trang_thai: chua_doi_chieu }  # trang_thai: chua_doi_chieu | da_doi_chieu
```

`ma` phải có trong `nguon.yaml`. Trường `trang` là bắt buộc, trừ khi văn bản là trang web không chia trang. Khi đó dùng `muc` (mục hoặc điều) thay cho `trang`.

### 3.2 Triệu chứng (`trieu-chung.yaml`)

```yaml
nhom:
  - id: han-nhiet
    ten: Hàn nhiệt
    trieu_chung:
      - { id: so-lanh-nhieu, ten: Sợ lạnh nhiều }
      - { id: sot-cao, ten: Sốt cao }
```

Mỗi triệu chứng chỉ được khai báo một lần, ở đây. Các file bệnh tham chiếu đến triệu chứng qua `id`.

### 3.3 Bệnh (`benh/<id>.yaml`)

```yaml
id: cam-mao
ten: Cảm mạo
ten_yhhd: Cảm cúm, nhiễm virus đường hô hấp trên
ten_khac: [cảm lạnh]                 # tùy chọn, dùng cho tìm kiếm
dau_hieu_nguy_hiem:                  # tùy chọn; tích vào thì app hiện khung "Cần đi khám ngay"
  - { id: sot-cao-keo-dai, ten: "Sốt cao > 39°C quá 3 ngày" }
the_benh:
  - id: phong-han
    ten: Phong hàn
    trieu_chung:
      chinh: [so-lanh-nhieu, khong-mo-hoi]   # ít nhất 1 triệu chứng
      phu:   [dau-dau]
    loai_tru: [sot-cao, khat-nuoc]           # tùy chọn: triệu chứng mâu thuẫn với thể này
    phap_tri: Tân ôn giải biểu
    bai_thuoc: [ma-hoang-thang]
    nguon: { ma: qd-5013, trang: …, trang_thai: chua_doi_chieu }
```

Dấu hiệu nguy hiểm khai báo riêng trong từng bệnh, không nằm trong danh mục triệu chứng dùng chung, và không được dùng để tính điểm.

### 3.4 Bài thuốc (`bai-thuoc/<id>.yaml`)

```yaml
id: ma-hoang-thang
ten: Ma hoàng thang
xuat_xu: Thương hàn luận              # tùy chọn
thanh_phan:
  - { vi: ma-hoang, lieu_g: 6, vai_tro: quan }       # vai_tro: quan | than | ta | su | null
  - { vi: que-chi,  lieu_g: 4, vai_tro: than, vuot_lieu_ly_do: null }
cach_dung: "Sắc uống, ngày 1 thang, chia 2 lần."
gia_giam: ["Ho nhiều: thêm …"]        # tùy chọn
kieng_ky: ["…"]                       # tùy chọn
nguon: { ma: qd-5013, trang: …, trang_thai: chua_doi_chieu }
```

(Các số liều trong ví dụ chỉ để minh họa cú pháp. Dữ liệu thật lấy từ văn bản nguồn.)

### 3.5 Vị thuốc (`vi-thuoc/<id>.yaml`)

```yaml
id: que-chi
ten: Quế chi
ten_khac: []
ten_khoa_hoc: Ramulus Cinnamomi
bo_phan_dung: Cành non
tinh_vi: "…"                          # tùy chọn
quy_kinh: []                          # tùy chọn
cong_nang: []                         # tùy chọn
lieu_dung:                            # hoặc null nếu chưa có nguồn đáng tin
  min_g: …
  max_g: …
  nguon: { ma: dd-vn-v, trang: …, trang_thai: chua_doi_chieu }
doc_tinh:
  muc: khong                          # khong | it | co | rat_doc
  canh_bao: null                      # bắt buộc khi muc là co hoặc rat_doc
kieng_ky: []
pho_bien:
  muc: cao                            # cao | trung_binh | thap
  can_cu: "Có trong danh mục TT 05/2015"
thay_the:
  - { vi: <id>, ghi_chu: "…", nguon: null }   # nguon null → app hiện nhãn "chưa xác minh"
nguon: { ma: tt-05-2015, trang: …, trang_thai: chua_doi_chieu }  # nguồn của tên và mô tả
```

Một khung dữ liệu Zod duy nhất (`src/schema.ts`) định nghĩa toàn bộ cấu trúc trên. Bộ kiểm tra dữ liệu và app cùng dùng khung này.

## 4. Cách khớp triệu chứng với thể bệnh

Hàm thuần `xepHang(benh, daTich: Set<string>, cauHinh) → KetQua[]`, đặt trong `src/scoring.ts`.

Với mỗi thể bệnh:
- `toiDa = 2 × |chinh| + 1 × |phu|`
- `dat = 2 × |chinh ∩ daTich| + 1 × |phu ∩ daTich|`
- `tru = 2 × |loai_tru ∩ daTich|`
- `diem = max(0, (dat − tru) / toiDa)`, giá trị từ 0 đến 1

Mỗi phần tử kết quả gồm: `theId`, `diem`, `khop[]`, `thieu[]`, `mauThuan[]`. Danh sách sắp xếp theo điểm giảm dần. Nếu bằng điểm thì giữ thứ tự khai báo trong file.

Các tín hiệu trả kèm:
- `khoPhanBiet`: hai thể đứng đầu chênh nhau dưới `nguongSatNhau` (mặc định 0,15). Kèm danh sách `trieuChungPhanBiet`, là hiệu đối xứng giữa triệu chứng (chính và phụ) của hai thể đó.
- `khongRo`: điểm của thể đứng đầu dưới `nguongKhop` (mặc định 0,50) và đã tích ít nhất 1 triệu chứng.
- `nguyHiem`: đã tích ít nhất một mục trong `dau_hieu_nguy_hiem`.

Hệ số (2/1/2) và các ngưỡng được đặt trong `src/config.ts`. Khi chưa tích triệu chứng nào, app không hiện điểm mà hiện "Hãy tích triệu chứng".

## 5. Giao diện

Thiết kế cho điện thoại trước. Định tuyến dạng hash. Giao diện sáng hoặc tối theo cài đặt hệ thống.

| Đường dẫn | Nội dung |
|---|---|
| `#/` | Ô tìm bệnh, không dấu vẫn tìm được (theo `ten`, `ten_yhhd`, `ten_khac`). Danh sách tất cả bệnh. Lối vào Tra vị thuốc và Nguồn |
| `#/benh/:id?tc=a,b` | Dấu hiệu nguy hiểm ở đầu trang. Danh sách tích triệu chứng nhóm theo nhóm (lấy hợp các triệu chứng của mọi thể, kể cả `loai_tru`). Bảng xếp hạng dính ở cuối màn hình, mở rộng được để xem khớp, thiếu, mâu thuẫn. Hiện cảnh báo khó phân biệt, không rõ, nguy hiểm khi có. Triệu chứng đã tích lưu trong `?tc=` |
| `#/benh/:id/:theId` | Pháp trị và các bài thuốc. Bảng thành phần gồm: vị (link), liều, vai trò, nhãn phổ biến, nhãn độc tính kèm cảnh báo hiện sẵn. Sau đó là cách dùng, gia giảm, kiêng kỵ |
| `#/vi` | Danh sách vị thuốc, tìm được không dấu, lọc theo mức phổ biến và độc tính |
| `#/vi/:id` | Toàn bộ trường của vị thuốc. Vị thay thế (kèm nguồn hoặc nhãn "chưa xác minh"). Mục "Có trong các bài thuốc" |
| `#/nguon` | Danh sách văn bản kèm link. Thống kê số mục đã đối chiếu và chưa đối chiếu, theo từng nguồn |

Mọi khối thông tin có nguồn đều có **nhãn nguồn** (ví dụ `QĐ 5013 tr.42 · chưa đối chiếu`), màu khác nhau theo trạng thái. Nếu `lieu_dung` là null thì hiện "Chưa có liều chuẩn". Chân trang mọi trang có dòng: *"Thông tin tham khảo cá nhân, không thay thế chẩn đoán của thầy thuốc."*

**PWA:** dùng `vite-plugin-pwa`. Service worker lưu sẵn toàn bộ tài nguyên vào máy. Khi có bản mới, app hiện thông báo "Có dữ liệu mới, tải lại".

## 6. Build, kiểm tra dữ liệu và xử lý lỗi

**Luồng build:** `scripts/build-data.ts` đọc toàn bộ YAML, chạy kiểm tra cấu trúc bằng Zod, chạy các quy tắc ở dưới, rồi xuất `src/generated/data.json` (bao gồm cả thống kê đối chiếu và chỉ mục ngược "vị → các bài thuốc dùng vị đó"). Vite sau đó đóng gói file này vào app. `npm run check` chạy cùng các bước này nhưng không xuất file.

**Lỗi (chặn build):**
1. Không đúng cấu trúc Zod. Trùng `id` trong cùng một loại.
2. Tham chiếu không tồn tại: `bai_thuoc`, `thanh_phan[].vi`, `thay_the[].vi`, `trieu_chung.chinh/phu`, `loai_tru`, `nguon.ma`.
3. Thể bệnh, bài thuốc hoặc vị thuốc thiếu `nguon`. `lieu_dung` khác null mà thiếu `nguon`.
4. `thanh_phan[].lieu_g > vi.lieu_dung.max_g` mà không có `vuot_lieu_ly_do`.
5. `doc_tinh.muc ∈ {co, rat_doc}` mà `canh_bao` để trống.
6. Thể bệnh có `chinh` rỗng. Cùng một triệu chứng vừa nằm trong `chinh/phu` vừa nằm trong `loai_tru` của cùng thể.

**Cảnh báo (in ra, không chặn build):**
- `thay_the` có `nguon: null`.
- Số mục `chua_doi_chieu`, đếm theo từng nguồn.
- Vị thuốc hoặc triệu chứng không được tham chiếu ở đâu.
- Hai thể cùng một bệnh có bộ `chinh ∪ phu` giống hệt nhau.
- Vị thuốc có `lieu_dung: null`.

Mỗi thông báo ghi rõ đường dẫn file và vị trí trường bị lỗi.

**Xử lý lỗi khi chạy:**
- `id` không tồn tại trong đường dẫn → trang "Không tìm thấy", có nút về trang chủ.
- Mã lạ trong `?tc=` → bỏ qua, hiện thông báo nhỏ "Một số triệu chứng trong link không còn tồn tại".
- Không có bước tải dữ liệu khi chạy vì dữ liệu đã đóng gói sẵn.

## 7. Kiểm thử và CI

- **Vitest:**
  - `scoring`: kiểm thử theo bảng các trường hợp: khớp đủ, có mâu thuẫn, điểm không âm, khó phân biệt, không rõ, nguy hiểm, chưa tích gì.
  - Bộ kiểm tra dữ liệu: mỗi quy tắc ở mục 6 có một bộ dữ liệu mẫu sai trong `tests/fixtures/`.
  - Hàm bỏ dấu tiếng Việt khi tìm kiếm, bao gồm cả `đ` → `d`.
- **Playwright (1 bài thử end-to-end):** trang chủ → tìm bệnh → tích triệu chứng → thấy thể đứng đầu → mở thể bệnh → mở vị thuốc. Thêm một bài kiểm tra tải lại trang khi offline.
- **GitHub Actions:** `npm ci` → `npm run check` → `npm test` → `npm run build` → deploy GitHub Pages. Bước deploy chỉ chạy trên nhánh `main` và khi các bước trước đều qua.

## 8. Cấu trúc mã nguồn

```
data/                   # dữ liệu YAML (mục 3)
scripts/build-data.ts   # đọc YAML, kiểm tra, xuất JSON
src/
  schema.ts             # khung Zod và các kiểu TypeScript
  validate.ts           # các quy tắc ở mục 6 (hàm thuần, dùng chung cho script và test)
  scoring.ts            # mục 4
  search.ts             # bỏ dấu và tìm kiếm
  config.ts             # hệ số và ngưỡng
  routes/               # các trang Svelte (mục 5)
  components/           # NhanNguon, BangThanhPhan, DanhSachTich, BangXepHang…
  generated/data.json   # do build tạo ra, không đưa vào git
tests/
```

Môi trường: Node 22 LTS, npm.

## 9. Quy trình nhập dữ liệu

1. **Thử nghiệm:** trích 2–3 bệnh từ QĐ 5013 cùng các vị thuốc liên quan. Tên và trạng thái BHYT lấy từ TT 05/2015. Liều lấy theo Dược điển khi có bản đáng tin, nếu không thì để `null`. Tất cả ở trạng thái `chua_doi_chieu`.
2. Người dùng đối chiếu với văn bản gốc và điều chỉnh cấu trúc dữ liệu nếu cần.
3. Mở rộng ra toàn bộ các bệnh trong QĐ 5013.

> Ghi chú (07/11/2026): QĐ 3890/QĐ-BYT (27/6/2018) chỉ thành lập Ban biên soạn, QĐ 6390/QĐ-BYT (23/10/2018) chỉ thành lập Hội đồng thẩm định — theo Lời nói đầu QĐ 5013 Tập I. Hai quyết định này không chứa bệnh/bài thuốc; sản phẩm của chúng chính là QĐ 5013. Không phải nguồn dữ liệu.

Mục `thay_the` chỉ được ghi nguồn khi văn bản thật sự có nêu. Các trường hợp còn lại để `nguon: null`.

## 10. Bổ sung sau khi nhập dữ liệu thật (2026-11-07)

Văn bản thật khác giả định ban đầu ở vài chỗ, nên cấu trúc dữ liệu được mở rộng (tương thích ngược):

- **Nguồn văn bản:** QĐ 5013 (Tập I) có **20 bệnh**, không có Cảm mạo. Bản PDF lấy từ cổng Sở Y tế Gia Lai; lưu cục bộ ở `tai-lieu-goc/` (không commit).
- **Thành phần bài thuốc:** thêm `ten_trong_bai` (tên vị như in, vd "Chích thảo" → vị Cam thảo), `lieu_text` khi liều không phải số gam ("vừa đủ", "3 lát", "Văn bản không ghi liều"); `lieu_g` có thể null.
- **Bài thuốc:** thêm `loai` (cổ phương, nghiệm phương, tân phương, thuốc Nam, dùng ngoài, đối pháp lập phương).
- **Thể bệnh:** thêm `mo_ta` (câu "Thường gặp…" của văn bản).
- **Vị thuốc:**
  - `ten_khoa_hoc` không bắt buộc (vị ngoài danh mục cuối tài liệu).
  - Thêm `ten_cay`, `nguon_goc` (trong nước / nhập khẩu / cả hai, theo cột "Nguồn gốc" của danh mục).
  - `bo_phan_dung` không bắt buộc, suy từ từ Latin đầu tên vị thuốc.
  - `pho_bien` có thể null (chưa có nguồn hợp pháp cho mức phổ biến).
  - `doc_tinh.muc` thêm `chua_ro`: mặc định cho mọi vị **không** thuộc Danh mục dược liệu độc (TT 13/2024/TT-BYT). Không bao giờ ghi "không độc" khi chưa có nguồn.
- **Chính/phụ:** văn bản không phân biệt; quy ước triệu chứng chỉ thể đó có (so với các thể cùng bệnh) là **chính**, dùng chung là **phụ**.
- **Loại trừ:** chỉ khi văn bản phủ định rõ ("không đỏ", "không khát").
- **Cảnh báo kiểm tra:** "vị không được dùng" và "chưa có liều chuẩn" gộp thành một dòng mỗi loại.
- **Quy trình dữ liệu:** bản trích JSON (`scripts/trich/ban-trich/`) → `scripts/trich/sinh-du-lieu.ts` → `data/*.yaml`. Script đối chiếu mọi liều với chữ trên trang gốc và từ chối chạy nếu còn tên vị chưa khớp danh mục (bảng ánh xạ có lý do: `scripts/trich/bi-danh-vi.ts`).

### 10.x Liều chuẩn theo Dược điển Việt Nam V (07/11/2026)

- Nguồn `ddvn-5`: DĐVN V (QĐ 5358/QĐ-BYT), bản quét đăng lại ở vnras.com (không có bản trên cổng *.gov.vn); chỉ lấy số liệu liều, dùng cá nhân.
- `vi_thuoc.lieu_dung` = liều một ngày, dược liệu khô, đường uống, từ mục "Cách dùng, liều lượng".
- Quy trình: `scripts/trich/ddvn/cot.py` (tách 2 cột) → `chuyen-luan.py` (trích mục liều + tên Latin) → `lieu.ts` (đọc liều bảo thủ,
  ghép theo tên Latin) → **mọi liều đã đối chiếu ảnh trang** (`doc-anh/*.json`, xem `HUONG-DAN-DOC-ANH.md`) → `quyet-dinh.json` (bỏ qua ca khác bộ phận dùng / câu mơ hồ).
- Thành phần bài có `lieu_g` > `max_g` được sinh `vuot_lieu_ly_do` tự động; bảng hiện "⚠ Vượt liều (tối đa Xg)" và lý do một lần dưới bảng.
- Vị gộp (VI_GOP) chỉ có liều khi mọi vị thành phần cùng liều.

### 10.y Kiêng kỵ / thận trọng theo Dược điển Việt Nam V

- Cùng nguồn `ddvn-5`, cùng chuyên luận đã xác minh khi lấy liều (§10.x). Chữ OCR không dùng trực tiếp: mỗi câu
  được chép nguyên văn từ ảnh trang (`scripts/trich/ddvn/kieng-ky/kq-*.json`, hướng dẫn `kieng-ky/HUONG-DAN.md`).
- Vị thuốc có thêm `than_trong: string[]` và `kieng_ky_nguon` (nguồn chung cho kiêng kỵ + thận trọng).
  Chỉ nhận kết quả `co`; `khong_chac` (không rõ ranh giới chuyên luận) bị bỏ.
- Trang thể bệnh: dưới bảng thành phần, nếu có vị mà câu kiêng kỵ/thận trọng nhắc "có thai/mang thai" → cảnh báo
  "Phụ nữ có thai" liệt kê các vị (kiêng dùng / thận trọng). Chỉ dựa trên câu chép nguyên văn, không suy diễn.
