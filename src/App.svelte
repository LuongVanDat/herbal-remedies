<script lang="ts">
  import ChanTrang from './components/ChanTrang.svelte'
  import ThongBaoCapNhat from './components/ThongBaoCapNhat.svelte'
  import { datData } from './data-context'
  import { appData } from './data'
  import { parseHash, type Route } from './router'
  import DanhSachVi from './routes/DanhSachVi.svelte'
  import KhongTimThay from './routes/KhongTimThay.svelte'
  import TrangBenh from './routes/TrangBenh.svelte'
  import TrangChu from './routes/TrangChu.svelte'
  import TrangNguon from './routes/TrangNguon.svelte'
  import TrangThe from './routes/TrangThe.svelte'
  import TrangVi from './routes/TrangVi.svelte'

  datData(appData)
  let route = $state<Route>(parseHash(location.hash))
  $effect(() => {
    const nghe = () => {
      route = parseHash(location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', nghe)
    return () => window.removeEventListener('hashchange', nghe)
  })
</script>

<ThongBaoCapNhat />
<header class="dau-trang"><a href="#/">Bài thuốc Đông y</a></header>
<main>
  {#if route.ten === 'chu'}
    <TrangChu />
  {:else if route.ten === 'benh'}
    {#key route.id}<TrangBenh id={route.id} tc={route.tc} />{/key}
  {:else if route.ten === 'the'}
    {#key `${route.benhId}/${route.theId}`}<TrangThe benhId={route.benhId} theId={route.theId} />{/key}
  {:else if route.ten === 'dsVi'}
    <DanhSachVi />
  {:else if route.ten === 'vi'}
    {#key route.id}<TrangVi id={route.id} />{/key}
  {:else if route.ten === 'nguon'}
    <TrangNguon />
  {:else}
    <KhongTimThay />
  {/if}
  <ChanTrang />
</main>
