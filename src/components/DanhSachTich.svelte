<script lang="ts">
  import { layData } from '../data-context'
  import type { Benh } from '../schema'

  let { benh, daTich, doiTich }: { benh: Benh; daTich: Set<string>; doiTich: (id: string) => void } = $props()
  const data = layData()

  const cuaBenh = $derived(
    new Set(benh.the_benh.flatMap((t) => [...t.trieu_chung.chinh, ...t.trieu_chung.phu, ...t.loai_tru])),
  )
  const nhom = $derived(
    data.nhomTrieuChung
      .map((n) => ({ ...n, trieu_chung: n.trieu_chung.filter((t) => cuaBenh.has(t.id)) }))
      .filter((n) => n.trieu_chung.length > 0),
  )
</script>

{#if benh.dau_hieu_nguy_hiem.length}
  <fieldset class="nguy-hiem">
    <legend>⚠ Dấu hiệu nguy hiểm</legend>
    {#each benh.dau_hieu_nguy_hiem as d (d.id)}
      <label><input type="checkbox" checked={daTich.has(d.id)} onchange={() => doiTich(d.id)} /> {d.ten}</label>
    {/each}
  </fieldset>
{/if}

<div data-testid="danh-sach-tich">
  {#each nhom as n (n.id)}
    <fieldset>
      <legend>{n.ten}</legend>
      {#each n.trieu_chung as t (t.id)}
        <label><input type="checkbox" checked={daTich.has(t.id)} onchange={() => doiTich(t.id)} /> {t.ten}</label>
      {/each}
    </fieldset>
  {/each}
</div>

<style>
  fieldset { border: 1px solid var(--vien); border-radius: 10px; margin: 0.7rem 0; padding: 0.4rem 0.8rem 0.6rem; }
  legend { font-weight: 600; padding: 0 0.3rem; }
  label { display: flex; gap: 0.6rem; align-items: center; padding: 0.35rem 0; min-height: 2.2rem; }
  input { width: 1.2rem; height: 1.2rem; flex: none; }
  .nguy-hiem { border-color: var(--do); }
  .nguy-hiem legend { color: var(--do); }
</style>
