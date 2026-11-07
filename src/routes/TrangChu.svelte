<script lang="ts">
  import { layData } from '../data-context'
  import { href } from '../router'
  import { timKiem } from '../search'

  const data = layData()
  let q = $state('')
  const ketQua = $derived(timKiem(data.benh, q, (b) => [b.ten, b.ten_yhhd ?? '', ...b.ten_khac]))
</script>

<h1>Tra cứu bài thuốc</h1>
<input type="search" placeholder="Tìm bệnh (gõ không dấu cũng được)…" bind:value={q} aria-label="Tìm bệnh" />

{#if ketQua.length === 0}
  <p class="mo">Không tìm thấy bệnh phù hợp.</p>
{:else}
  <ul class="danh-sach">
    {#each ketQua as b (b.id)}
      <li>
        <a href={href({ ten: 'benh', id: b.id, tc: '' })}>
          <strong>{b.ten}</strong>
          {#if b.ten_yhhd}<span class="mo"> — {b.ten_yhhd}</span>{/if}
        </a>
      </li>
    {/each}
  </ul>
{/if}

<nav class="loi-vao">
  <a class="nut" href={href({ ten: 'dsVi' })}>Tra vị thuốc</a>
  <a class="nut" href={href({ ten: 'nguon' })}>Nguồn tham khảo</a>
</nav>
