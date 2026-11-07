<script lang="ts">
  import { layData } from '../data-context'
  import { coDoc, DOC_TINH, PHO_BIEN } from '../labels'
  import { href } from '../router'
  import type { ViThuoc } from '../schema'
  import { timKiem } from '../search'

  const data = layData()
  const tatCa = Object.values(data.viThuoc).sort((a, b) => a.ten.localeCompare(b.ten, 'vi'))
  let q = $state('')
  let phoBien = $state<'' | NonNullable<ViThuoc['pho_bien']>['muc']>('')
  let chiDoc = $state(false)
  const ketQua = $derived(
    timKiem(tatCa, q, (v) => [v.ten, v.ten_khoa_hoc, ...v.ten_khac]).filter(
      (v) => (!phoBien || v.pho_bien?.muc === phoBien) && (!chiDoc || coDoc(v)),
    ),
  )
</script>

<h1>Tra vị thuốc</h1>
<input type="search" placeholder="Tên vị hoặc tên khoa học…" bind:value={q} aria-label="Tìm vị thuốc" />
<div class="loc">
  <label>Mức phổ biến
    <select bind:value={phoBien}>
      <option value="">Tất cả</option>
      {#each Object.entries(PHO_BIEN) as [k, ten] (k)}<option value={k}>{ten}</option>{/each}
    </select>
  </label>
  <label><input type="checkbox" bind:checked={chiDoc} /> Chỉ vị có độc</label>
</div>

<p class="mo">{ketQua.length} vị</p>
<ul class="danh-sach">
  {#each ketQua as v (v.id)}
    <li>
      <a href={href({ ten: 'vi', id: v.id })}>{v.ten}</a>
      <span class="mo"> <em>{v.ten_khoa_hoc}</em>{#if v.pho_bien} · {PHO_BIEN[v.pho_bien.muc]}{/if}</span>
      {#if coDoc(v)}<span class="doc"> · ⚠ {DOC_TINH[v.doc_tinh.muc]}</span>{/if}
    </li>
  {/each}
</ul>

<style>
  .loc { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin: 0.8rem 0; }
  .loc label { display: flex; gap: 0.4rem; align-items: center; }
  select { font: inherit; padding: 0.3rem; border-radius: 8px; border: 1px solid var(--vien); background: var(--the); color: var(--chu); }
  .danh-sach li { padding: 0.6rem 0.2rem; }
  .danh-sach a { display: inline; padding: 0; font-weight: 600; color: var(--nhan); }
  .doc { color: var(--do); }
</style>
