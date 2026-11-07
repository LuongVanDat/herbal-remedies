<script lang="ts">
  import ChanTrang from './components/ChanTrang.svelte'
  import ThongBaoCapNhat from './components/ThongBaoCapNhat.svelte'
  import { datData } from './data-context'
  import { appData } from './data'
  import { tick } from 'svelte'
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
  // Vị trí cuộn theo đường dẫn (bỏ ?query): quay lại trang đã xem thì về đúng chỗ, trang mới thì lên đầu.
  const viTri = new Map<string, number>()
  const khoa = () => location.hash.split('?')[0] || '#/'
  $effect(() => {
    const nghe = async () => {
      route = parseHash(location.hash)
      const k = khoa()
      await tick()
      window.scrollTo(0, viTri.get(k) ?? 0)
    }
    const cuon = () => viTri.set(khoa(), window.scrollY)
    window.addEventListener('hashchange', nghe)
    window.addEventListener('scroll', cuon, { passive: true })
    return () => {
      window.removeEventListener('hashchange', nghe)
      window.removeEventListener('scroll', cuon)
    }
  })
</script>

<ThongBaoCapNhat />
<header class="dau-trang"><a href="#/">Bài thuốc Đông y</a></header>
<main>
  {#if route.ten === 'chu'}
    <TrangChu />
  {:else if route.ten === 'benh'}
    {#key `${route.id}?${route.tc}`}<TrangBenh id={route.id} tc={route.tc} />{/key}
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
