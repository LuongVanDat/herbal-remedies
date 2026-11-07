<script lang="ts">
  import { layData } from '../data-context'
  import { coDoc, DOC_TINH, PHO_BIEN, VAI_TRO } from '../labels'
  import { href } from '../router'
  import type { BaiThuoc } from '../schema'

  let { bai }: { bai: BaiThuoc } = $props()
  const data = layData()
</script>

<div class="bang-cuon">
  <table aria-label="Thành phần {bai.ten}">
    <thead><tr><th>Vị</th><th>Liều</th><th>Vai trò</th><th>Phổ biến</th><th>Lưu ý</th></tr></thead>
    <tbody>
      {#each bai.thanh_phan as tp, i (i)}
        {@const v = data.viThuoc[tp.vi]}
        <tr class:co-doc={v && coDoc(v)}>
          <td><a href={href({ ten: 'vi', id: tp.vi })}>{v?.ten ?? tp.vi}</a></td>
          <td class="so">{tp.lieu_g}g</td>
          <td>{tp.vai_tro ? VAI_TRO[tp.vai_tro] : '—'}</td>
          <td>{#if v}<span class="pb {v.pho_bien.muc}">{PHO_BIEN[v.pho_bien.muc]}</span>{/if}</td>
          <td class="luu-y">
            {#if v && v.doc_tinh.muc !== 'khong'}
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

<style>
  .so { white-space: nowrap; font-variant-numeric: tabular-nums; }
  .pb { font-size: 0.8rem; white-space: nowrap; }
  .pb.cao { color: var(--xanh); }
  .pb.trung_binh { color: var(--vang); }
  .pb.thap { color: var(--do); }
  .co-doc { background: var(--nen-do); }
  .doc { color: var(--do); font-size: 0.85rem; }
  .it-doc { color: var(--vang); font-size: 0.85rem; }
  .mo { font-size: 0.85rem; }
</style>
