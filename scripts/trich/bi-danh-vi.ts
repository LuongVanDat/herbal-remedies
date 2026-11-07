/**
 * Tên vị in trong bài (QĐ 5013) → tên chuẩn trong danh mục vị thuốc cuối tài liệu (tr.152–165).
 * ly_do:
 *  - "cách viết": chỉ khác chính tả / thứ tự chữ / viết tắt thông dụng.
 *  - "cách chế": cùng dược liệu, khác cách bào chế/dạng dùng (sống, sao, chích, chế, tươi…).
 *    Tên in vẫn hiện trong bảng thành phần (ten_trong_bai).
 *  - "tên khác": danh mục ghi tên này trong ngoặc ở dòng đó.
 *  - "bộ phận khác": văn bản dùng bộ phận khác của cùng cây với dòng danh mục — CẦN NGƯỜI ĐỐI CHIẾU.
 *  - "tên khoa học": suy từ tên cây ghi trong danh mục — CẦN NGƯỜI ĐỐI CHIẾU.
 */
export const BI_DANH: Record<string, { ten: string; ly_do: string }> = {
  // cách viết
  'Đương qui': { ten: 'Đương quy', ly_do: 'cách viết' },
  'Nhục quế': { ten: 'Quế nhục', ly_do: 'cách viết' },
  'Đan bì': { ten: 'Mẫu đơn bì', ly_do: 'cách viết' },
  'Đơn bì': { ten: 'Mẫu đơn bì', ly_do: 'cách viết' },
  'Cốt toái': { ten: 'Cốt toái bổ', ly_do: 'cách viết' },
  'Hy thiêm thảo': { ten: 'Hy thiêm', ly_do: 'cách viết' },
  'Rễ cỏ xước': { ten: 'Cỏ xước', ly_do: 'cách viết (danh mục: Radix Achyranthis asperae — rễ)' },
  'Ý dĩ nhân': { ten: 'Ý dĩ', ly_do: 'cách viết' },
  'Sa tiền': { ten: 'Xa tiền tử', ly_do: 'cách viết' },
  'Kỷ tử': { ten: 'Câu kỷ tử', ly_do: 'cách viết' },
  'Thiên môn': { ten: 'Thiên môn đông', ly_do: 'cách viết' },
  'Thần khúc': { ten: 'Lục thần khúc', ly_do: 'cách viết' },
  'Cỏ mần trầu': { ten: 'Mần trầu', ly_do: 'cách viết' },
  'Khổ sâm cho lá': { ten: 'Khổ sâm', ly_do: 'cách viết (danh mục: Folium et Ramulus Crotonis tonkinensis)' },
  'Lá khổ sâm': { ten: 'Khổ sâm', ly_do: 'cách viết (danh mục: Folium et Ramulus Crotonis tonkinensis)' },
  'Hạt mã tiền': { ten: 'Mã tiền', ly_do: 'cách viết (danh mục: Semen Strychni — hạt)' },
  'Rễ chút chít': { ten: 'Chút chít', ly_do: 'cách viết' },
  'Rễ cà gai leo': { ten: 'Cà gai leo', ly_do: 'cách viết' },
  'Lá huyết dụ': { ten: 'Huyết dụ', ly_do: 'cách viết (danh mục: Folium Cordylines — lá)' },
  'Bồ công anh nam': { ten: 'Bồ công anh', ly_do: 'cách viết (danh mục: Lactuca indica)' },
  // cách chế
  'Chích thảo': { ten: 'Cam thảo', ly_do: 'cách chế (cam thảo chích)' },
  'Chích cam thảo': { ten: 'Cam thảo', ly_do: 'cách chế' },
  'Hắc phụ tử': { ten: 'Phụ tử chế', ly_do: 'cách chế' },
  'Ngải cứu tươi': { ten: 'Ngải cứu', ly_do: 'cách chế (dùng tươi)' },
  'Sinh ý dĩ': { ten: 'Ý dĩ', ly_do: 'cách chế (sống)' },
  'Sinh thạch cao': { ten: 'Thạch cao', ly_do: 'cách chế (sống)' },
  'Thạch cao sống': { ten: 'Thạch cao', ly_do: 'cách chế (sống)' },
  'Sinh hoàng kỳ': { ten: 'Hoàng kỳ', ly_do: 'cách chế (sống)' },
  'Sinh mẫu lệ': { ten: 'Mẫu lệ', ly_do: 'cách chế (sống)' },
  'Sinh miết giáp': { ten: 'Miết giáp', ly_do: 'cách chế (sống)' },
  'Sinh quy bản': { ten: 'Quy bản', ly_do: 'cách chế (sống)' },
  'Can địa hoàng': { ten: 'Sinh địa', ly_do: 'cách chế (địa hoàng phơi khô)' },
  'Hương phụ chế': { ten: 'Hương phụ', ly_do: 'cách chế' },
  'Bồ hoàng sống': { ten: 'Bồ hoàng', ly_do: 'cách chế (sống)' },
  'Đỗ đen sao': { ten: 'Đậu đen', ly_do: 'cách chế (sao)' },
  'Hòe hoa sao vàng': { ten: 'Hòe hoa', ly_do: 'cách chế (sao vàng)' },
  'Kinh giới tuệ sao đen': { ten: 'Kinh giới', ly_do: 'cách chế (sao đen; tuệ = bông)' },
  'Kinh giới sao đen': { ten: 'Kinh giới', ly_do: 'cách chế (sao đen)' },
  'Trắc bá diệp sao cháy': { ten: 'Trắc bách diệp', ly_do: 'cách chế (sao cháy)' },
  'Chỉ xác sao': { ten: 'Chỉ xác', ly_do: 'cách chế (sao)' },
  'Phèn phi': { ten: 'Phèn chua', ly_do: 'cách chế (phi)' },
  'Nam tinh': { ten: 'Thiên nam tinh', ly_do: 'cách viết' },
  'Đởm nam tinh': { ten: 'Thiên nam tinh', ly_do: 'cách chế (chế với mật)' },
  'Quế tâm': { ten: 'Quế nhục', ly_do: 'cách chế (phần vỏ trong của quế) — CẦN NGƯỜI ĐỐI CHIẾU' },
  // tên khác (ghi trong ngoặc ở danh mục)
  'Rễ cây xấu hổ': { ten: 'Trinh nữ', ly_do: 'tên khác (danh mục: Trinh nữ (xấu hổ)) — văn bản dùng rễ, danh mục ghi Herba' },
  'Rễ xấu hổ': { ten: 'Trinh nữ', ly_do: 'tên khác (danh mục: Trinh nữ (xấu hổ)) — văn bản dùng rễ, danh mục ghi Herba' },
  'Dây gắm': { ten: 'Vương tôn', ly_do: 'tên khác (danh mục: Vương tôn (Gắm))' },
  'Quy vĩ': { ten: 'Đương quy', ly_do: 'tên khác (danh mục: Quy vỹ/quy râu — phần rễ con)' },
  // bộ phận khác — CẦN NGƯỜI ĐỐI CHIẾU
  'Rễ lá lốt': { ten: 'Lá lốt', ly_do: 'bộ phận khác (văn bản dùng rễ)' },
  // tên khoa học — CẦN NGƯỜI ĐỐI CHIẾU
  'Cam thảo nam': { ten: 'Cam thảo đất', ly_do: 'tên khoa học (Scoparia dulcis)' },
  'Nghệ vàng': { ten: 'Khương hoàng', ly_do: 'tên khoa học (Curcuma longa)' },
  'Cành dâu': { ten: 'Tang chi', ly_do: 'tên khoa học (Morus alba — cành)' },
  'Lá dâu': { ten: 'Tang diệp', ly_do: 'tên khoa học (Morus alba — lá)' },
  'vỏ rễ cây dâu': { ten: 'Tang bạch bì', ly_do: 'tên khoa học (Morus alba — vỏ rễ)' },
  'Rễ cỏ tranh': { ten: 'Bạch mao căn', ly_do: 'tên khoa học (Imperata cylindrica — thân rễ)' },
  'Quả dành dành': { ten: 'Chi tử', ly_do: 'tên khoa học (Gardenia — quả)' },
  'Củ mài': { ten: 'Hoài sơn', ly_do: 'tên khoa học (Dioscorea — củ mài)' },
  'Vỏ quýt': { ten: 'Trần bì', ly_do: 'tên khoa học (Citrus reticulata — vỏ quả)' },
  'Gừng': { ten: 'Sinh khương', ly_do: 'tên khoa học (Zingiber officinale — gừng tươi)' },
  'Gừng tươi': { ten: 'Sinh khương', ly_do: 'tên khoa học (Zingiber officinale — gừng tươi)' },
}

/** Tên in không chỉ rõ một dòng danh mục (danh mục có nhiều loài/dạng) → vị gộp riêng. Khóa đã bỏ dấu. */
export const VI_GOP: Record<string, { id: string; ten: string; stt: number[] }> = {
  'dang sam': { id: 'dang-sam', ten: 'Đảng sâm', stt: [97, 98, 99] },
  'ha thu o': { id: 'ha-thu-o', ten: 'Hà thủ ô', stt: [120, 121] },
  'thuoc duoc': { id: 'thuoc-duoc', ten: 'Thược dược', stt: [23, 381] },
  'sai ho': { id: 'sai-ho', ten: 'Sài hồ', stt: [274, 275] },
  'xuong bo': { id: 'xuong-bo', ten: 'Xương bồ', stt: [307, 331] },
  'dia hoang': { id: 'dia-hoang', ten: 'Địa hoàng', stt: [281, 327] },
  'ban ha': { id: 'ban-ha', ten: 'Bán hạ', stt: [29, 30] },
  'ban ha che': { id: 'ban-ha', ten: 'Bán hạ', stt: [29, 30] },
  'sinh ban ha': { id: 'ban-ha', ten: 'Bán hạ', stt: [29, 30] },
  'tu to': { id: 'tu-to', ten: 'Tử tô (tía tô)', stt: [341, 340, 339] },
}

/** Vị không có trong danh mục cuối tài liệu (thực phẩm, cây thuốc Nam…). Khóa đã bỏ dấu, bỏ phần trong ngoặc. */
export const NGOAI_DANH_MUC: Record<string, { id: string; ten: string; ten_khac?: string[] }> = {
  'ngạnh mễ': { id: 'nganh-me', ten: 'Ngạnh mễ', ten_khac: ['gạo tẻ'] },
  'xích tiểu đậu': { id: 'xich-tieu-dau', ten: 'Xích tiểu đậu', ten_khac: ['đậu đỏ'] },
  'hành tươi cả rễ': { id: 'hanh-tuoi', ten: 'Hành tươi', ten_khac: ['thông bạch'] },
  'hành tươi cả râu': { id: 'hanh-tuoi', ten: 'Hành tươi', ten_khac: ['thông bạch'] },
  'thông bạch': { id: 'hanh-tuoi', ten: 'Hành tươi', ten_khac: ['thông bạch'] },
  'tỏa dương': { id: 'toa-duong', ten: 'Tỏa dương' },
  'dạ giao đằng': { id: 'da-giao-dang', ten: 'Dạ giao đằng' },
  'lộc giác giao': { id: 'loc-giac-giao', ten: 'Lộc giác giao' },
  'sừng hươu': { id: 'sung-huou', ten: 'Sừng hươu' },
  'kê tử hoàng': { id: 'long-do-trung-ga', ten: 'Lòng đỏ trứng gà', ten_khac: ['kê tử hoàng'] },
  'lòng đỏ trứng gà': { id: 'long-do-trung-ga', ten: 'Lòng đỏ trứng gà', ten_khac: ['kê tử hoàng'] },
  'thanh cao': { id: 'thanh-hao', ten: 'Thanh hao', ten_khac: ['thanh cao'] },
  'bột cóc': { id: 'bot-coc', ten: 'Bột cóc' },
  'bột chuối': { id: 'bot-chuoi', ten: 'Bột chuối' },
  'đường': { id: 'duong', ten: 'Đường' },
  'đất lòng bếp': { id: 'dat-long-bep', ten: 'Đất lòng bếp', ten_khac: ['hoàng thổ'] },
  'cam thảo dây': { id: 'cam-thao-day', ten: 'Cam thảo dây' },
  'vỏ rụt': { id: 'vo-rut', ten: 'Vỏ rụt', ten_khac: ['nam mộc hương'] },
  'vỏ cây đại': { id: 'vo-cay-dai', ten: 'Vỏ cây đại' },
  'lá hẹ': { id: 'la-he', ten: 'Lá hẹ' },
  'lá xương sông': { id: 'la-xuong-song', ten: 'Lá xương sông' },
  'lê bì': { id: 'le-bi', ten: 'Lê bì', ten_khac: ['vỏ quả lê'] },
  'lá chanh': { id: 'la-chanh', ten: 'Lá chanh' },
  'vỏ bưởi': { id: 'vo-buoi', ten: 'Vỏ bưởi' },
  'rau đắng đất': { id: 'rau-dang-dat', ten: 'Rau đắng đất' },
  'rau dừa nước': { id: 'rau-dua-nuoc', ten: 'Rau dừa nước' },
  'vỏ cam': { id: 'vo-cam', ten: 'Vỏ cam' },
}
