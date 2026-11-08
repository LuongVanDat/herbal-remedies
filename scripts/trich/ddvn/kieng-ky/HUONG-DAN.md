# Hướng dẫn chép mục Kiêng kỵ / Thận trọng Dược điển Việt Nam V từ ảnh trang

Nguồn: `tai-lieu-goc/duoc-dien-vn-5.pdf` (DĐVN V, QĐ 5358/QĐ-BYT; bản quét). Chữ OCR nhiều lỗi →
**chỉ chép từ ảnh trang**, không chép từ OCR, không thêm từ trí nhớ.

## Đầu vào
`viec-NN.json`: mỗi phần tử {id, ten, ten_khoa_hoc, chuyen_luan, trang_in_lieu} — chuyên luận và trang in nơi có mục
"Cách dùng, liều lượng" đã được xác minh trước đó. `chuyen_luan`/`trang_in_lieu` = null → tự tìm chuyên luận
(chỉ mục tên: `tai-lieu-goc/ddvn5/chi-muc.json`, {"Tên (bộ phận)": [trang in]}).

## Công cụ
- Trang in → trang PDF: thường PDF = in + 99…102 (khoảng 1060–1400); bảng mốc
  `/tmp/claude-1000/-home-dat-work-my-project-drug/6f4c1b5f-f246-4b6b-9aa8-db2d263dca87/scratchpad/trang-in-sang-pdf.json`.
  **Luôn xác nhận số trang in ở chân ảnh.**
- Vẽ ảnh: `pdftoppm -f P -l P -r 100 -png tai-lieu-goc/duoc-dien-vn-5.pdf <thư mục riêng>/t` rồi Read file png.
  Chữ nhỏ → vẽ lại `-r 150` và cắt (`-x/-y/-W/-H`) vùng cần đọc. Dùng thư mục ảnh riêng của bạn trong scratchpad.

## Chép gì
Các mục ngay sau "Cách dùng, liều lượng" **của đúng chuyên luận đó** (trước tiêu đề chuyên luận kế tiếp):
"Kiêng kỵ" và/hoặc "Thận trọng" (đôi khi "Chú ý"). Mục có thể tràn sang cột/trang kế.
- `kieng_ky`: mảng câu, chép **nguyên văn** từ ảnh (đúng chính tả bản in; sửa lỗi nhận dạng, không diễn giải,
  không rút gọn). Mỗi câu một phần tử.
- `than_trong`: tương tự cho mục "Thận trọng"/"Chú ý".
- Không có mục nào → hai mảng rỗng, `ket_qua: "khong_co"`. Có → `ket_qua: "co"`.
- Không chắc chuyên luận (vd hai chuyên luận cùng trang, ranh giới không rõ) → `ket_qua: "khong_chac"`, ghi lý do.
- `trang_in`: trang in nơi bắt đầu mục kiêng kỵ/thận trọng (hoặc trang mục liều nếu không có).

## Đầu ra
Ghi `kq-NN.json` (cùng thư mục, cùng số với viec-NN) — mảng JSON, mỗi việc một phần tử:
```json
{ "id": "ban-ha", "ket_qua": "co" | "khong_co" | "khong_chac", "chuyen_luan": "BÁN HẠ (Thân rễ)", "trang_in": 1047,
  "kieng_ky": ["Âm huyết hư, tân dịch kém và người có thai không nên dùng.", "Không kết hợp với các thuốc loại ô đầu."],
  "than_trong": [], "ghi_chu": "" }
```
