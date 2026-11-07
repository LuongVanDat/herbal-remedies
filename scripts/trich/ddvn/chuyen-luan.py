"""Trích mục "Cách dùng, liều lượng" (và "Kiêng kỵ"/"Thận trọng") của các chuyên luận dược liệu,
vị thuốc trong Dược điển Việt Nam V (bản quét, chữ nhận dạng OCR còn lỗi).

Neo theo từng tiêu đề mục "Cách dùng, liều lượng": lấy các dòng sau nó tới tiêu đề mục kế tiếp;
chuyên luận chứa nó là dòng tên Latin gần nhất phía trên (dòng ngay trên tên Latin là tên tiếng Việt).
Giữ nguyên văn OCR để người đối chiếu; phần phân tích liều làm ở scripts/trich/ddvn/lieu.ts.

    python3 -I scripts/trich/ddvn/chuyen-luan.py tai-lieu-goc/ddvn5/trang.json scripts/trich/ddvn/chuyen-luan.json
"""
import difflib
import json
import re
import sys
import unicodedata


def bo_dau(s: str) -> str:
    s = unicodedata.normalize('NFD', s)
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').replace('đ', 'd').replace('Đ', 'D')


MUC = ['mo ta', 'vi phau', 'bot', 'dinh tinh', 'do am', 'tro toan phan', 'tro khong tan trong acid hydrocloric',
       'tap chat', 'dinh luong', 'che bien', 'bao che', 'bao quan', 'tinh vi, quy kinh', 'cong nang, chu tri',
       'cach dung, lieu luong', 'kieng ky', 'than trong', 'chat chiet duoc trong duoc lieu', 'kim loai nang',
       'chi so acid', 'mat khoi luong do lam kho', 'ty le vun nat', 'giam khoi luong do lam kho']
MUC_KHOA = {m.replace(' ', ''): m for m in MUC}

LATIN_DAU = '''radix rhizoma fructus herba folium semen cortex flos tuber caulis cornu concha carapax spina
laminaria sargassum bombyx calyx styli stylus scolopendra bulbus ramulus pericarpium exocarpium colla os lignum
resina squama periostracum massa medulla spica stigma thallus arillus cacumen pollen mel benzoinum poria
ganoderma cordyceps gypsum talcum alumen borneolum moschus calculus hirudo scorpio gecko zaocys agkistrodon
eupolyphaga mylabris pheretima ootheca endothelium plastrum margarita haliotis ostrea corium testa nidus oleum
gummi catechu indigo aloe myrrha olibanum sanguis cinnabaris realgar natrii magnetitum haematitum kaolin
fluoritum mirabilitum sulfur lapis succinum fel cera cicada omphalia pseudobulbus lumbricus squamae
retinervus fasciculus vespae galla nodus semen sclerotium caulis et cortex'''.split()


def khoa_muc(dong: str):
    return MUC_KHOA.get(re.sub(r'[^a-z,]', '', bo_dau(dong).lower()))


def la_latin(dong: str) -> bool:
    if not re.fullmatch(r"[A-Za-zÀ-ỹ.' ]{5,70}", dong):
        return False
    tu = dong.split()
    if not 2 <= len(tu) <= 7 or not tu[0][0].isupper():
        return False
    dau = bo_dau(tu[0]).lower()
    return bool(difflib.get_close_matches(dau, LATIN_DAU, n=1, cutoff=0.75))


def la_tieu_de(dong: str) -> bool:
    chu = [c for c in dong if c.isalpha()]
    return len(chu) >= 4 and sum(c.isupper() for c in chu) / len(chu) > 0.7


def so_trang_in(trang):
    """Số trang in cho mọi trang PDF: mốc gần nhất phía trước có độ lệch khớp với một mốc kề."""
    moc = [(t['trang_pdf'], t['trang_pdf'] - t['trang_in']) for t in trang if t['trang_in']]
    tin = [moc[i] for i in range(len(moc)) if
           (i > 0 and moc[i - 1][1] == moc[i][1]) or (i + 1 < len(moc) and moc[i + 1][1] == moc[i][1])]
    ra, j = {}, -1
    for t in trang:
        while j + 1 < len(tin) and tin[j + 1][0] <= t['trang_pdf']:
            j += 1
        ra[t['trang_pdf']] = t['trang_pdf'] - tin[j][1] if j >= 0 else None
    return ra


def doc_muc(dong, i):
    """Các dòng sau tiêu đề mục ở vị trí i, tới tiêu đề mục/chuyên luận kế tiếp."""
    ra = []
    for _, d in dong[i + 1:i + 30]:
        if khoa_muc(d) or la_latin(d) or la_tieu_de(d):
            break
        if re.fullmatch(r'\d{1,4}', d) or re.fullmatch(r'[\s,._\-]*', d):
            continue
        ra.append(d)
    return ' '.join(ra)


def main(vao: str, ra: str):
    trang = json.load(open(vao, encoding='utf-8'))
    so_in = so_trang_in(trang)
    dong = []
    for t in trang:
        dong += [(t['trang_pdf'], d.strip()) for d in t['text'].split('\n') if d.strip()]

    kq, khong_ro, mat_ranh_gioi = [], 0, 0
    for i, (p, d) in enumerate(dong):
        if khoa_muc(d) != 'cach dung, lieu luong':
            continue
        j = next((j for j in range(i - 1, max(0, i - 700), -1) if la_latin(dong[j][1])), None)
        if j is None:
            khong_ro += 1
            continue
        # Ranh giới chuyên luận bị mất (tên Latin chuyên luận sau OCR hỏng): giữa tên Latin và mục liều
        # có hơn một mục "Mô tả" hoặc có mục liều khác → không biết liều này của ai, bỏ.
        giua = [khoa_muc(d2) for _, d2 in dong[j + 1:i]]
        if giua.count('mo ta') > 1 or 'cach dung, lieu luong' in giua:
            mat_ranh_gioi += 1
            continue
        # Kiêng kỵ / thận trọng ngay sau mục liều (trước tiêu đề chuyên luận kế tiếp)
        kk = []
        for k in range(i + 1, min(len(dong), i + 40)):
            m = khoa_muc(dong[k][1])
            if m in ('kieng ky', 'than trong'):
                kk.append(doc_muc(dong, k))
            elif m or la_latin(dong[k][1]):
                break
        kq.append({
            'ten': dong[j - 1][1], 'latin': dong[j][1],
            'trang_pdf': p, 'trang_in': so_in.get(p),
            'lieu_text': doc_muc(dong, i),
            'kieng_ky_text': ' '.join(x for x in kk if x),
        })
    json.dump(kq, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(kq)} mục liều có chuyên luận, {khong_ro} không tìm được tên Latin, {mat_ranh_gioi} bỏ vì mất ranh giới chuyên luận')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
