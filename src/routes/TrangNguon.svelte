<script lang="ts">
  import { layData } from '../data-context'

  const data = layData()
  const ds = Object.values(data.nguon)
</script>

<h1>Nguồn tham khảo</h1>
<p class="mo">Chỉ dùng văn bản pháp luật (không bị bảo hộ bản quyền) và sách giấy tự sở hữu để đối chiếu.</p>
<ul class="nguon">
  {#each ds as n (n.ma)}
    {@const tk = data.thongKe[n.ma] ?? { daDoiChieu: 0, chuaDoiChieu: 0 }}
    <li>
      <a href={n.url} target="_blank" rel="noopener noreferrer">{n.ten}</a>
      <div class="mo">{n.so_hieu} · {n.ngay}</div>
      <div>{tk.daDoiChieu} đã đối chiếu · {tk.chuaDoiChieu} chưa đối chiếu</div>
    </li>
  {/each}
</ul>

<style>
  .nguon { list-style: none; padding: 0; }
  .nguon li { padding: 0.8rem 0; border-bottom: 1px solid var(--vien); }
</style>
