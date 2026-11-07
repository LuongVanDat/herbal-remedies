<script lang="ts">
  import { layData } from '../data-context'
  import type { NguonRef } from '../schema'

  let { nguon }: { nguon: NguonRef | null } = $props()
  const data = layData()
  const nhan = $derived.by(() => {
    if (!nguon) return null
    const ten = data.nguon[nguon.ma]?.ten_ngan ?? nguon.ma
    const vt = nguon.trang !== undefined ? `tr.${nguon.trang}` : nguon.muc
    return `${ten} ${vt} · ${nguon.trang_thai === 'da_doi_chieu' ? 'đã đối chiếu' : 'chưa đối chiếu'}`
  })
</script>

{#if nguon && nhan}
  <a class="nhan-nguon {nguon.trang_thai === 'da_doi_chieu' ? 'da' : 'chua'}" href="#/nguon">{nhan}</a>
{:else}
  <span class="nhan-nguon chua-xac-minh">chưa xác minh</span>
{/if}

<style>
  .nhan-nguon {
    display: inline-block; font-size: 0.75rem; padding: 0.1rem 0.5rem; border-radius: 999px;
    border: 1px solid currentColor; text-decoration: none; white-space: nowrap; vertical-align: middle;
  }
  .da { color: var(--xanh); }
  .chua { color: var(--vang); }
  .chua-xac-minh { color: var(--do); }
</style>
