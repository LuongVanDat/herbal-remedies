<script lang="ts">
  import BangThanhPhan from '../components/BangThanhPhan.svelte'
  import NhanNguon from '../components/NhanNguon.svelte'
  import { layData } from '../data-context'
  import { LOAI_BAI, LUU_Y_THAI, luuYThai } from '../labels'
  import { href } from '../router'
  import { layTcGanNhat } from '../url-state'
  import KhongTimThay from './KhongTimThay.svelte'

  let { benhId, theId }: { benhId: string; theId: string } = $props()
  const data = layData()
  const benh = data.benh.find((b) => b.id === benhId)
  const the = benh?.the_benh.find((t) => t.id === theId)
  /** Các vị trong bài cần lưu ý khi có thai (theo kiêng kỵ/thận trọng của vị), không lặp. */
  const viLuuYThai = (baiId: string) => {
    const ra = new Map<string, string>()
    for (const tp of data.baiThuoc[baiId]?.thanh_phan ?? []) {
      const v = data.viThuoc[tp.vi]
      const m = v && luuYThai(v)
      if (m && !ra.has(v.id)) ra.set(v.id, `${v.ten} (${LUU_Y_THAI[m]})`)
    }
    return [...ra.values()]
  }
</script>

{#if !benh || !the}
  <KhongTimThay />
{:else}
  <p><a href={href({ ten: 'benh', id: benh.id, tc: layTcGanNhat(benh.id) })}>← {benh.ten}</a></p>
  <h1>{benh.ten} — thể {the.ten}</h1>
  {#if the.mo_ta}<p class="mo">{the.mo_ta}</p>{/if}
  <p><strong>Pháp trị:</strong> {the.phap_tri} <NhanNguon nguon={the.nguon} /></p>

  {#each the.bai_thuoc as baiId (baiId)}
    {@const bai = data.baiThuoc[baiId]}
    {@const thai = viLuuYThai(baiId)}
    {#if bai}
      <section class="bai">
        <h2>{bai.ten}</h2>
        <p class="mo">
          {#if bai.loai}<span class="loai">{LOAI_BAI[bai.loai]}</span> · {/if}{#if bai.xuat_xu}Xuất xứ: {bai.xuat_xu} · {/if}<NhanNguon nguon={bai.nguon} />
        </p>
        <BangThanhPhan {bai} />
        {#if thai.length}
          <p class="canh-bao-thai" data-testid="canh-bao-thai-{baiId}">
            ⚠ <strong>Phụ nữ có thai:</strong> bài có vị cần lưu ý — {thai.join(', ')}. Xem mục kiêng kỵ của từng vị.
          </p>
        {/if}
        <h3>Cách dùng</h3>
        <p>{bai.cach_dung}</p>
        {#if bai.gia_giam.length}
          <h3>Gia giảm</h3>
          <ul>{#each bai.gia_giam as g, i (i)}<li>{g}</li>{/each}</ul>
        {/if}
        {#if bai.kieng_ky.length}
          <h3>Kiêng kỵ</h3>
          <ul class="kieng-ky">{#each bai.kieng_ky as k, i (i)}<li>{k}</li>{/each}</ul>
        {/if}
      </section>
    {/if}
  {/each}
{/if}

<style>
  .bai { border-top: 1px solid var(--vien); margin-top: 1.5rem; }
  h3 { font-size: 1rem; margin: 1rem 0 0.3rem; }
  .kieng-ky { color: var(--do); }
  .canh-bao-thai { color: var(--do); font-size: 0.9rem; }
  .loai { font-weight: 600; color: var(--nhan); }
</style>
