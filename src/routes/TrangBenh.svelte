<script lang="ts">
  import BangXepHang from '../components/BangXepHang.svelte'
  import DanhSachTich from '../components/DanhSachTich.svelte'
  import { layData } from '../data-context'
  import { href } from '../router'
  import { xepHang } from '../scoring'
  import { docTc, ghiTc } from '../url-state'
  import KhongTimThay from './KhongTimThay.svelte'

  let { id, tc }: { id: string; tc: string } = $props()
  const data = layData()
  const benh = data.benh.find((b) => b.id === id)

  const hopLe = new Set(
    benh
      ? [
          ...benh.the_benh.flatMap((t) => [...t.trieu_chung.chinh, ...t.trieu_chung.phu, ...t.loai_tru]),
          ...benh.dau_hieu_nguy_hiem.map((d) => d.id),
        ]
      : [],
  )
  // svelte-ignore state_referenced_locally
  const dau = docTc(tc, hopLe)
  let tich = $state<string[]>(dau.ids)
  const daTich = $derived(new Set(tich))
  const kq = $derived(benh ? xepHang(benh, daTich) : null)

  function doiTich(tcId: string) {
    tich = tich.includes(tcId) ? tich.filter((x) => x !== tcId) : [...tich, tcId]
    history.replaceState(history.state, '', href({ ten: 'benh', id, tc: ghiTc(tich) }))
  }
</script>

{#if !benh || !kq}
  <KhongTimThay />
{:else}
  <h1>{benh.ten}</h1>
  {#if benh.ten_yhhd}<p class="mo">{benh.ten_yhhd}</p>{/if}
  {#if dau.boQua > 0}
    <p class="canh-bao vang">Một số triệu chứng trong link không còn tồn tại</p>
  {/if}
  {#if kq.nguyHiem.length}
    <div class="canh-bao do" role="alert">
      <strong>Cần đi khám ngay.</strong> Bạn đã tích dấu hiệu nguy hiểm — đừng tự điều trị.
    </div>
  {/if}
  <DanhSachTich {benh} {daTich} {doiTich} />
  <BangXepHang {benh} {kq} />
{/if}
