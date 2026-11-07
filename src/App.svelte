<script lang="ts">
  import ChanTrang from './components/ChanTrang.svelte'
  import { datData } from './data-context'
  import { appData } from './data'
  import { parseHash, type Route } from './router'
  import KhongTimThay from './routes/KhongTimThay.svelte'
  import TrangChu from './routes/TrangChu.svelte'

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

<header class="dau-trang"><a href="#/">Bài thuốc Đông y</a></header>
<main>
  {#if route.ten === 'chu'}
    <TrangChu />
  {:else}
    <KhongTimThay />
  {/if}
  <ChanTrang />
</main>
