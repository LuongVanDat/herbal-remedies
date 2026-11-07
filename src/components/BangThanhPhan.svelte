<script lang="ts">
  import { layData } from '../data-context'
  import { coDoc, coNhanDoc, DOC_TINH, PHO_BIEN, VAI_TRO } from '../labels'
  import { href } from '../router'
  import type { BaiThuoc } from '../schema'

  let { bai }: { bai: BaiThuoc } = $props()
  const data = layData()
  const GOC_NGAN = { trong_nuoc: 'Trong nước', nhap_khau: 'Nhập khẩu', ca_hai: 'Trong & ngoài nước' } as const
</script>

<div class="bang-cuon">
  <table aria-label="Thành phần {bai.ten}">
    <thead><tr><th>Vị</th><th>Liều</th><th>Vai trò</th><th>Phổ biến / nguồn gốc</th><th>Lưu ý</th></tr></thead>
    <tbody>
      {#each bai.thanh_phan as tp, i (i)}
        {@const v = data.viThuoc[tp.vi]}
        <tr class:co-doc={v && coDoc(v)}>
          <td>
            <a href={href({ ten: 'vi', id: tp.vi })}>{tp.ten_trong_bai ?? v?.ten ?? tp.vi}</a>
            {#if tp.ten_trong_bai && v && tp.ten_trong_bai !== v.ten}<div class="mo nho">vị: {v.ten}</div>{/if}
          </td>
          <td class="so">{tp.lieu_g !== null ? `${tp.lieu_g}g` : tp.lieu_text}</td>
          <td>{tp.vai_tro ? VAI_TRO[tp.vai_tro] : '—'}</td>
          <td>
            {#if v?.pho_bien}<span class="pb {v.pho_bien.muc}">{PHO_BIEN[v.pho_bien.muc]}</span>
            {:else if v?.nguon_goc}<span class="mo nho">{GOC_NGAN[v.nguon_goc]}</span>
            {:else}<span class="mo">—</span>{/if}
          </td>
          <td class="luu-y">
            {#if v && coNhanDoc(v)}
              <div class:doc={coDoc(v)} class:it-doc={!coDoc(v)}>
                <strong>⚠ {DOC_TINH[v.doc_tinh.muc]}</strong>{#if v.doc_tinh.canh_bao?.trim()}: {v.doc_tinh.canh_bao}{/if}
              </div>
            {/if}
            {#if v && !v.lieu_dung}
              <div class="mo">Chưa có liều chuẩn</div>
            {/if}
            {#if tp.vuot_lieu_ly_do && v?.lieu_dung}
              <div class="doc">Vượt liều chuẩn (tối đa {v.lieu_dung.max_g}g): {tp.vuot_lieu_ly_do}</div>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<p class="mo nho ghi-chu">
  Nhãn ⚠ chỉ gắn cho vị có dữ liệu độc tính (vd thuộc danh mục dược liệu độc của Bộ Y tế). Vị không có nhãn độc chưa
  chắc an toàn — xem trang từng vị.
</p>

<style>
  .so { white-space: nowrap; font-variant-numeric: tabular-nums; }
  .pb { font-size: 0.8rem; white-space: nowrap; }
  .pb.cao { color: var(--xanh); }
  .pb.trung_binh { color: var(--vang); }
  .pb.thap { color: var(--do); }
  .co-doc { background: var(--nen-do); }
  .doc { color: var(--do); font-size: 0.85rem; }
  .it-doc { color: var(--vang); font-size: 0.85rem; }
  .nho { font-size: 0.8rem; }
  .ghi-chu { margin: 0.3rem 0 0; }
</style>
