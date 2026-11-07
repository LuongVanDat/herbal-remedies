"""Tách văn bản Dược điển Việt Nam V (bản quét 2 cột) thành text theo đúng thứ tự đọc.

Đầu vào: file `pdftotext -bbox-layout` của PDF. Đầu ra: JSON [{trang_pdf, trang_in, text}].
Thứ tự đọc: dòng trải qua giữa trang (tiêu đề chuyên luận) chia trang thành các đoạn;
trong mỗi đoạn đọc hết cột trái rồi tới cột phải.

    python3 -I scripts/trich/ddvn/cot.py tai-lieu-goc/ddvn5/bbox.html tai-lieu-goc/ddvn5/trang.json
"""
import html
import json
import re
import sys

RE_PAGE = re.compile(r'<page width="([\d.]+)" height="([\d.]+)">')
RE_LINE = re.compile(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', re.S)
RE_WORD = re.compile(r'<word[^>]*>(.*?)</word>', re.S)


def doc_trang(khoi: str, rong: float):
    giua = rong / 2
    dong = []
    for m in RE_LINE.finditer(khoi):
        x0, y0, x1 = float(m.group(1)), float(m.group(2)), float(m.group(3))
        chu = ' '.join(html.unescape(w) for w in RE_WORD.findall(m.group(5))).strip()
        if chu:
            dong.append((x0, y0, x1, chu))
    # Dòng trải qua giữa trang (lề 15pt) là dòng ngang toàn trang
    ngang = sorted([d for d in dong if d[0] < giua - 15 and d[2] > giua + 15], key=lambda d: d[1])
    con_lai = [d for d in dong if not (d[0] < giua - 15 and d[2] > giua + 15)]
    moc = [d[1] for d in ngang] + [1e9]
    ra, truoc = [], -1.0
    for i, y_moc in enumerate(moc):
        doan = [d for d in con_lai if truoc <= d[1] < y_moc]
        trai = sorted([d for d in doan if (d[0] + d[2]) / 2 < giua], key=lambda d: (round(d[1]), d[0]))
        phai = sorted([d for d in doan if (d[0] + d[2]) / 2 >= giua], key=lambda d: (round(d[1]), d[0]))
        ra += [d[3] for d in trai] + [d[3] for d in phai]
        if i < len(ngang):
            ra.append(ngang[i][3])
            truoc = ngang[i][1]
    return ra


def main(vao: str, ra: str):
    s = open(vao, encoding='utf-8').read()
    vi_tri = [(m.start(), float(m.group(1))) for m in RE_PAGE.finditer(s)] + [(len(s), 0)]
    trang = []
    for i in range(len(vi_tri) - 1):
        khoi = s[vi_tri[i][0]:vi_tri[i + 1][0]]
        dong = doc_trang(khoi, vi_tri[i][1])
        # Số trang in: một dòng chỉ gồm chữ số ở đầu hoặc cuối trang
        so = [d for d in dong[:3] + dong[-3:] if re.fullmatch(r'\d{1,4}', d)]
        trang.append({'trang_pdf': i + 1, 'trang_in': int(so[0]) if so else None, 'text': '\n'.join(dong)})
    json.dump(trang, open(ra, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'{len(trang)} trang, {sum(1 for t in trang if t["trang_in"])} có số trang in')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
