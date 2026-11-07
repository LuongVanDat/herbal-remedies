# Hướng dẫn đọc liều Dược điển Việt Nam V từ ảnh trang

Nguồn: `tai-lieu-goc/duoc-dien-vn-5.pdf` (DĐVN V, QĐ 5358/QĐ-BYT 28/11/2017; bản quét 2120 trang, tải từ vnras.com).
Chữ OCR (`tai-lieu-goc/ddvn5/all.txt`) nhiều lỗi số/dấu → **liều chỉ được đọc từ ảnh trang**, không từ OCR.

## Công cụ
- Chỉ mục tên (OCR, có biến thể lỗi chính tả): `tai-lieu-goc/ddvn5/chi-muc.json` — {"Tên (bộ phận)": [trang in]}.
  Tìm bằng tên không dấu / tên khác (vd Sinh khương → "Gừng"; Quế nhục → "Quế (vỏ thân…)"; Quy bản → "Qui giáp và qui bản";
  Bạch linh → "Phục linh"). Chuyên luận dược liệu nằm khoảng trang in 1050–1400.
- Đổi trang in → trang PDF: bảng mốc `…/scratchpad/trang-in-sang-pdf.json` ({trang_in_mốc: trang_pdf_mốc}; độ lệch giữ nguyên
  tới mốc kế). Khoảng trang in 1060–1400 thường lệch +99…+102. **Luôn xác nhận số trang in ở chân ảnh.**
- Vẽ ảnh 1 trang: `pdftoppm -f P -l P -r 100 -png tai-lieu-goc/duoc-dien-vn-5.pdf <thư mục riêng>/t` rồi Read file png.
  Chữ nhỏ khó đọc → vẽ lại `-r 150` và cắt (`-x/-y/-W/-H`) nửa trang chứa mục liều.

## Đọc gì
Với mỗi việc: tìm chuyên luận của vị (khớp tên Việt + tên Latin QĐ 5013 + bộ phận dùng). Đọc mục **"Cách dùng, liều lượng"**:
- `min_g`/`max_g`: liều **một ngày**, **dược liệu khô**, đường uống (sắc/hoàn/tán). Có cả tươi và khô → lấy khô.
  Liều đơn "Ngày dùng 4 g" → min = max = 4. Chỉ có liều "mỗi lần"/giọt/ml/không có số gam/ngày → `min_g`,`max_g` = null.
- `cau`: chép **nguyên văn** câu liều từ ảnh (sửa đúng chính tả như bản in, không diễn giải).
- `trang_in`: số trang in nơi có câu liều. `chuyen_luan`: tiêu đề chuyên luận như bản in (vd "PHỤC LINH").
- Vị thuốc là dạng chế (Thục địa, Phụ tử chế, Chích cam thảo…): nếu DĐVN có chuyên luận riêng → dùng nó; nếu chỉ có
  phần "Bào chế" trong chuyên luận gốc → dùng liều chuyên luận gốc **chỉ khi** câu liều nói áp dụng cho dạng đã chế, ghi rõ ở `ghi_chu`.
- Không tìm thấy chuyên luận → `ket_qua: "khong_co_chuyen_luan"` (ghi đã thử tên nào). Không bịa, không lấy từ trí nhớ.

## Đầu ra
Một mảng JSON, mỗi phần tử:
```json
{ "id": "bach-linh", "stt": [18], "ket_qua": "co_lieu" | "khong_ghi_lieu_gam" | "khong_co_chuyen_luan",
  "chuyen_luan": "PHỤC LINH", "trang_in": 1293, "min_g": 9, "max_g": 15, "cau": "Ngày dùng từ 9 g đến 15 g, …", "ghi_chu": "" }
```
Việc có `"kiem_tra": true`: đối chiếu giá trị tự động `tu_dong` với ảnh; trả thêm `"xac_nhan": true|false` và giá trị đúng.
