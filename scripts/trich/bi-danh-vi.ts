/**
 * Tên vị in trong bài (QĐ 5013) → tên chuẩn trong danh mục vị thuốc cuối tài liệu (tr.152–165).
 * ly_do:
 *  - "cách viết": chỉ khác chính tả / thứ tự chữ / viết tắt thông dụng.
 *  - "cách chế": cùng dược liệu, khác cách bào chế/dạng dùng (tên in vẫn hiển thị trong bảng).
 *  - "tên khác": danh mục ghi tên này trong ngoặc ở dòng đó.
 *  - "tên khoa học": suy từ tên cây ghi trong danh mục — CẦN NGƯỜI ĐỐI CHIẾU.
 */
export const BI_DANH: Record<string, { ten: string; ly_do: string }> = {
  'Đương qui': { ten: 'Đương quy', ly_do: 'cách viết' },
  'Nhục quế': { ten: 'Quế nhục', ly_do: 'cách viết' },
  'Đan bì': { ten: 'Mẫu đơn bì', ly_do: 'cách viết' },
  'Cốt toái': { ten: 'Cốt toái bổ', ly_do: 'cách viết' },
  'Hy thiêm thảo': { ten: 'Hy thiêm', ly_do: 'cách viết' },
  'Rễ cỏ xước': { ten: 'Cỏ xước', ly_do: 'cách viết (danh mục: Radix Achyranthis asperae — rễ)' },
  'Chích thảo': { ten: 'Cam thảo', ly_do: 'cách chế (cam thảo chích)' },
  'Hắc phụ tử': { ten: 'Phụ tử chế', ly_do: 'cách chế' },
  'Ngải cứu tươi': { ten: 'Ngải cứu', ly_do: 'cách chế (dùng tươi)' },
  'Rễ cây xấu hổ': { ten: 'Trinh nữ', ly_do: 'tên khác (danh mục: Trinh nữ (xấu hổ)) — văn bản dùng rễ, danh mục ghi Herba' },
  'Cam thảo nam': { ten: 'Cam thảo đất', ly_do: 'tên khoa học (Scoparia dulcis)' },
  'Nghệ vàng': { ten: 'Khương hoàng', ly_do: 'tên khoa học (Curcuma longa)' },
}

/** Tên in không chỉ rõ một dòng danh mục (danh mục có nhiều loài) → vị gộp riêng, liệt kê các STT. Khóa đã bỏ dấu. */
export const VI_GOP: Record<string, { id: string; ten: string; stt: number[] }> = {
  'dang sam': { id: 'dang-sam', ten: 'Đảng sâm', stt: [97, 98, 99] },
  'ha thu o': { id: 'ha-thu-o', ten: 'Hà thủ ô', stt: [120, 121] },
}
