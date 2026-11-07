"""Tách bảng 'Danh mục dược liệu, vị thuốc cổ truyền' (QĐ 5013, tr.152–165) theo tọa độ chữ.
Dùng một lần để dựng dữ liệu vị thuốc; kết quả cần người đối chiếu."""
import csv, io, json, re, subprocess, sys

pdf, out = sys.argv[1], sys.argv[2]
tsv = subprocess.run(['pdftotext', '-tsv', '-f', '152', '-l', '165', pdf, '-'], capture_output=True, text=True).stdout
words = [r for r in csv.DictReader(io.StringIO(tsv), delimiter='\t') if r['level'] == '5' and not r['text'].startswith('###')]

def col(x):
    x = float(x)
    return 'stt' if x < 100 else 'ten' if x < 185 else 'goc' if x < 232 else 'vi' if x < 355 else 'cay'

rows, prev = [], None
for page in range(152, 166):
    ws = [w for w in words if int(w['page_num']) == page]
    ws = [w for w in ws if float(w['top']) > (112 if page == 152 else 30) and not (float(w['top']) > 780)]  # bỏ tiêu đề cột, số trang
    anchors = sorted([(float(w['top']) + float(w['height']) / 2, int(w['text']))
                      for w in ws if col(w['left']) == 'stt' and re.fullmatch(r'\d+', w['text'])])
    if not anchors:
        continue
    page_rows = [{'stt': n, 'y': y, 'trang': page, 'ten': [], 'goc': [], 'vi': [], 'cay': []} for y, n in anchors]
    # ranh giới giữa hai dòng = trung điểm hai neo
    for w in ws:
        c = col(w['left'])
        if c == 'stt':
            continue
        y = float(w['top']) + float(w['height']) / 2
        if prev and y < anchors[0][0] - 14:  # phần tràn từ trang trước
            prev[c].append((y, float(w['left']), w['text'])); continue
        if y > anchors[-1][0] + 26:  # ghi chú cuối bảng
            continue
        best = min(page_rows, key=lambda r: abs(r['y'] - y))
        best[c].append((y, float(w['left']), w['text']))
    rows += page_rows
    prev = page_rows[-1]

def ghep(ws):
    dong = []  # gom chữ thành dòng theo y (sai lệch ≤ 4pt), rồi xếp theo x
    for t in sorted(ws):
        if dong and abs(dong[-1][0][0] - t[0]) <= 4:
            dong[-1].append(t)
        else:
            dong.append([t])
    return re.sub(r'\s+', ' ', ' '.join(w[2] for d in dong for w in sorted(d, key=lambda t: t[1]))).strip()

res = []
for r in rows:
    ten = ghep(r['ten'])
    m = re.match(r'^(.*?)\s*\((.*)\)\s*$', ten)
    res.append({'stt': r['stt'], 'trang': r['trang'], 'ten': m.group(1) if m else ten,
                'ten_khac': [s.strip() for s in m.group(2).split(',')] if m else [],
                'nguon_goc': ghep(r['goc']).replace(' ', ''), 'ten_khoa_hoc': ghep(r['vi']), 'ten_cay': ghep(r['cay'])})
json.dump(res, open(out, 'w'), ensure_ascii=False, indent=1)
print(len(res), 'dòng; STT liên tục:', [r['stt'] for r in res] == list(range(1, len(res) + 1)))

# Sửa tay các dòng mà bố cục PDF làm lệch (đã đối chiếu với bản in, tr.155–165)
SUA = {
    97: ('Đảng sâm bắc', ['Tố hoa đảng sâm']),
    159: ('Khiếm thực', []),
    114: ('Đơn lá đỏ', ['Đơn mặt trời']),
    115: ('Đương quy', ['Toàn quy', 'Quy đầu', 'Quy vỹ/quy râu']),
    160: ('Khiên ngưu', ['Hắc sửu', 'Bạch sửu']),
    196: ('Mã đề', []),
    40: ('Bồ kết (quả)', []),
    140: ('Hoàng nàn chế', []),
    167: ('Kim ngân cuộng', []),
    255: ('Phụ tử chế', []),
    340: ('Tô tử', ['Tía tô hạt']),
    367: ('Viễn chí', []),
}
for r in res:
    if r['stt'] in SUA:
        r['ten'], r['ten_khac'] = SUA[r['stt']]
json.dump(res, open(out, 'w'), ensure_ascii=False, indent=1)
