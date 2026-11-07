# Hướng dẫn trích dữ liệu từ QĐ 5013/QĐ-BYT (Tập I)

Mục tiêu: chép **trung thành** nội dung YHCT của từng bệnh ra JSON có cấu trúc, để dựng
app tra cứu bài thuốc cá nhân. Đây là dữ liệu y tế (liều thuốc): **không thêm, không suy đoán,
không "sửa" theo kiến thức riêng**. Thứ gì văn bản không ghi thì không ghi.

## Đầu vào
- Văn bản đã trích chữ, ngăn trang bằng ký tự `\f`: `/home/dat/work/my-project/drug/.superpowers/trich/full.txt`
  Trang PDF N = phần tử thứ N (đếm từ 1) khi `split('\f')`; số trang in = số trang PDF.
  Đọc bằng Python, ví dụ: `python3 -c "t=open('.../full.txt').read().split('\f'); print(t[7-1])"`.
- PDF gốc nếu cần xem lại bố cục: `/home/dat/work/my-project/drug/tai-lieu-goc/qd-5013-huong-dan-tap-1.pdf`
  (`pdftotext -layout -f N -l N <pdf> -`).
- Chỉ đọc. Không sửa file nào ngoài file kết quả của bạn.

## Phạm vi mỗi bệnh
Chỉ phần **III. CÁC THỂ LÂM SÀNG VÀ ĐIỀU TRỊ** (YHCT) + dấu hiệu nguy hiểm/cần can thiệp YHHĐ nêu rõ trong
phần I hoặc IV. Bỏ qua: châm cứu, xoa bóp, cấy chỉ, thủy châm, thuốc tây/YHHĐ, "Đối pháp lập phương"
(không có danh sách vị), thuốc thành phẩm, "các bài thuốc của cơ sở khám chữa bệnh", cồn xoa bóp.

## Định dạng kết quả: một file JSON mỗi bệnh
Ghi vào `scripts/trich/ban-trich/<so-thu-tu-2-chu-so>.json`, ví dụ `01.json`.

```json
{
  "so": 1,
  "id": "<id được giao>",
  "ten": "Đau cột sống thắt lưng (Yêu thống)",      // tên đề mục + tên YHCT trong ngoặc, như mục lục
  "ten_khac": ["Yêu thống", "đau lưng"],              // tên YHCT; thêm tên gọi khác CHỈ nếu văn bản dùng
  "trang_dau": 7, "trang_cuoi": 14,
  "dau_hieu_nguy_hiem": [                              // dấu hiệu văn bản nói cần khám/can thiệp YHHĐ, ngắn gọn, người bệnh tự nhận biết được
    { "ten": "Sốt, gầy sút nhanh, đau ngày càng tăng", "trang": 7 }
  ],
  "the_benh": [
    {
      "ten": "Hàn thấp",                               // tên thể như văn bản, bỏ chữ "Thể"
      "mo_ta": "Thường gặp trong những trường hợp đau thắt lưng do lạnh.",   // câu mô tả ngay sau tên thể, nếu có; không có thì null
      "trang": 8,                                      // trang có mục "Triệu chứng" của thể
      "trieu_chung": [
        { "ten": "Đau nhiều vùng thắt lưng", "nhom": "vi-tri-dau" },
        { "ten": "Đau tăng khi trời lạnh, ẩm", "nhom": "vi-tri-dau" },
        { "ten": "Rêu lưỡi trắng mỏng", "nhom": "luoi" },
        { "ten": "Mạch phù khẩn", "nhom": "mach" }
      ],
      "loai_tru": [ { "ten": "Sưng nóng đỏ tại chỗ", "dan_chung": "ấn đau, không đỏ" } ],
      "phap_tri": "Tán hàn, trừ thấp, ôn thông kinh lạc.",
      "bai_thuoc": [
        {
          "ten": "Can khương thương truật thang",       // tên bài; nghiệm phương không tên → null
          "loai": "co_phuong",                         // co_phuong | nghiem_phuong | tan_phuong | thuoc_nam | dung_ngoai
          "trang": 8,
          "thanh_phan": [
            { "ten": "Can khương", "lieu_g": 8 },
            { "ten": "Bạch truật (sao cám)", "lieu_g": 20 },
            { "ten": "Ngải cứu tươi", "lieu_g": null, "lieu_text": "vừa đủ" }
          ],
          "cach_dung": "Sắc uống mỗi ngày 01 thang, chia 2 lần.",
          "gia_giam": [],
          "giong_the": null                            // nếu văn bản nói "bài thuốc giống thể X" thì ghi tên thể X và để thanh_phan = []
        }
      ]
    }
  ],
  "ghi_chu_trich": ["Những chỗ văn bản mơ hồ/lỗi in/khó đọc, ghi rõ trang"]
}
```
(JSON thật không có chú thích `//`.)

## Quy tắc chi tiết
1. **Triệu chứng**: tách câu "Triệu chứng" thành từng triệu chứng ngắn, giữ nguyên chữ của văn bản
   (được bỏ liên từ, viết hoa chữ đầu). Một triệu chứng = một ý người dùng có thể tự tích được
   ("Đau tăng khi trời lạnh, ẩm"). Không gộp lưỡi với mạch. Không diễn giải thuật ngữ.
   `nhom` chọn một trong: `vi-tri-dau` (đau/tính chất đau/vận động), `han-nhiet` (sốt, sợ lạnh, nóng, chân tay lạnh…),
   `mo-hoi`, `dau-mat` (đầu, mặt, mắt, tai, mũi, họng, miệng), `tieu-hoa` (ăn uống, khát, bụng, đại tiện, nôn),
   `tieu-tien`, `ho-hap` (ho, đờm, khó thở), `da` (da, ban, ngứa, phù), `than-kinh` (ngủ, tinh thần, chóng mặt, tê, liệt),
   `toan-than` (mệt, gầy, sắc mặt, cân nặng…), `phu-nu-tre-em`, `luoi`, `mach`, `khac`.
2. **Thể có biến thể**: nếu văn bản tách triệu chứng theo nhánh ("Trường hợp dương hư thì…; nếu âm hư thì…")
   mà dùng chung pháp/phương, tạo **hai thể** "Can thận hư (thiên dương hư)" và "Can thận hư (thiên âm hư)",
   mỗi thể = triệu chứng chung + triệu chứng nhánh đó, `bai_thuoc` giống nhau (ở thể thứ hai dùng `giong_the`).
   Nếu văn bản có bài thuốc riêng cho từng nhánh thì gán đúng bài cho từng nhánh.
3. **loai_tru**: chỉ khi văn bản **phủ định rõ** ("không đỏ", "không sốt", "không có mồ hôi" khi thể khác có),
   ghi `ten` là triệu chứng bị phủ định viết dạng khẳng định và **dùng đúng chữ** của triệu chứng đó ở thể khác
   cùng bệnh nếu có; `dan_chung` = chữ gốc. Không suy luận hàn/nhiệt.
4. **Liều**: số gam như in ("08g" → 8, "0,5g" → 0.5). Khoảng ("4-8g"), "vừa đủ", số lượng (quả, lá, con),
   đơn vị khác (ml, viên) → `lieu_g: null` + `lieu_text` nguyên văn. Tên vị **giữ nguyên chữ in**, kể cả
   cách chế ("sao cám", "chích", "tươi", "Hắc phụ tử", "Chích thảo"), kể cả lỗi in ("Bach truật") — ghi lỗi in vào `ghi_chu_trich`.
5. **Bài thuốc dùng ngoài** có vị và lượng cụ thể (vd "Ngải cứu tươi 100g sao nóng với muối…") → `loai: "dung_ngoai"`,
   `cach_dung` nguyên văn. Bỏ các dòng chung chung.
6. **Gia giảm**: mỗi câu gia giảm một phần tử, nguyên văn.
7. Bảng hai cột vị thuốc trong text bị xếp xen kẽ trái/phải theo dòng — đọc đủ cả hai cột, kiểm tra lại số vị
   bằng cách đếm số "g" trong khối. Nếu thấy chữ bị dính/lệch, mở PDF trang đó để đối chiếu.
8. Khi xong mỗi bệnh, tự kiểm: mọi `lieu_g` khác null phải xuất hiện cạnh tên vị trên đúng `trang` của bài
   (bài kéo sang trang sau thì `trang` = trang bắt đầu bài; ghi chú nếu bài trải 2 trang).
9. Không cần viết code ngoài việc đọc file; kết quả cuối cùng trả về: danh sách file đã ghi, số thể/bài/vị mỗi bệnh,
   và toàn bộ `ghi_chu_trich`.
