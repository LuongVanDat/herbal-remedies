<script lang="ts">
  import { layData } from '../data-context'
  import { href } from '../router'
  import type { Benh } from '../schema'
  import type { KetQuaXepHang } from '../scoring'

  let { benh, kq }: { benh: Benh; kq: KetQuaXepHang } = $props()
  const data = layData()
  const tenTC = (id: string) => data.trieuChung[id]?.ten ?? id
  const tenThe = (id: string) => benh.the_benh.find((t) => t.id === id)?.ten ?? id
  const ds = (ids: string[]) => (ids.length ? ids.map(tenTC).join(', ') : '—')

  let moRong = $state<Record<string, boolean>>({})
  let xemHet = $state(false)
  const hienThi = $derived(xemHet ? kq.ketQua : kq.ketQua.slice(0, 3))
</script>

<section class="xep-hang" data-testid="xep-hang" aria-label="Xếp hạng thể bệnh">
  {#if !kq.daTichGi}
    <p class="mo">Hãy tích triệu chứng để xem thể bệnh phù hợp.</p>
  {:else}
    {#if kq.khongRo}
      <p class="canh-bao vang">Không có thể nào khớp rõ — nên đi khám thầy thuốc.</p>
    {/if}
    {#if kq.khoPhanBiet}
      <p class="canh-bao vang" data-testid="kho-phan-biet">
        Khó phân biệt {tenThe(kq.khoPhanBiet.a)} và {tenThe(kq.khoPhanBiet.b)}. Kiểm tra lại các triệu chứng:
        {ds(kq.khoPhanBiet.trieuChungPhanBiet)}.
      </p>
    {/if}
    <ol>
      {#each hienThi as r (r.theId)}
        {@const pt = Math.round(r.diem * 100)}
        <li>
          <div class="dong">
            <a href={href({ ten: 'the', benhId: benh.id, theId: r.theId })}>{tenThe(r.theId)}</a>
            <span class="pt">{pt}%</span>
            <button type="button" onclick={() => (moRong[r.theId] = !moRong[r.theId])} aria-expanded={!!moRong[r.theId]}>
              Chi tiết
            </button>
          </div>
          <div class="thanh" aria-hidden="true"><span style="width: {pt}%"></span></div>
          {#if moRong[r.theId]}
            <div class="chi-tiet">
              <div>Khớp: {ds(r.khop)}</div>
              <div>Chưa có: {ds(r.thieu)}</div>
              {#if r.mauThuan.length}<div class="mau-thuan">Mâu thuẫn: {ds(r.mauThuan)}</div>{/if}
            </div>
          {/if}
        </li>
      {/each}
    </ol>
    {#if kq.ketQua.length > 3}
      <button type="button" onclick={() => (xemHet = !xemHet)}>{xemHet ? 'Thu gọn' : `Xem tất cả ${kq.ketQua.length} thể`}</button>
    {/if}
  {/if}
</section>

<style>
  .xep-hang {
    position: sticky; bottom: 0; background: var(--the); border: 1px solid var(--vien);
    border-radius: 14px 14px 0 0; padding: 0.6rem 0.9rem; max-height: 50vh; overflow-y: auto;
    box-shadow: 0 -4px 16px rgb(0 0 0 / 0.08); margin-top: 1rem;
  }
  ol { margin: 0; padding-left: 1.4rem; }
  li { padding: 0.4rem 0; }
  .dong { display: flex; align-items: center; gap: 0.6rem; }
  .dong a { font-weight: 600; flex: 1; }
  .pt { font-variant-numeric: tabular-nums; }
  button { font: inherit; font-size: 0.85rem; padding: 0.25rem 0.6rem; border-radius: 8px;
    border: 1px solid var(--vien); background: var(--nen); color: var(--chu); }
  .thanh { height: 6px; background: var(--vien); border-radius: 3px; margin-top: 0.25rem; }
  .thanh span { display: block; height: 100%; background: var(--xanh); border-radius: 3px; }
  .chi-tiet { font-size: 0.9rem; color: var(--mo); margin-top: 0.3rem; }
  .mau-thuan { color: var(--do); }
</style>
