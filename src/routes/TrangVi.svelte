<script lang="ts">
  import NhanNguon from '../components/NhanNguon.svelte'
  import { layData } from '../data-context'
  import { coDoc, coNhanDoc, DOC_TINH, NGUON_GOC, PHO_BIEN } from '../labels'
  import { href } from '../router'
  import KhongTimThay from './KhongTimThay.svelte'

  let { id }: { id: string } = $props()
  const data = layData()
  const v = $derived(data.viThuoc[id])
  const bai = $derived((data.viTrongBai[id] ?? []).map((b) => data.baiThuoc[b]).filter(Boolean))
  const theDung = (baiId: string) =>
    data.benh.flatMap((b) => b.the_benh.filter((t) => t.bai_thuoc.includes(baiId)).map((t) => ({ b, t })))
</script>

{#if !v}
  <KhongTimThay />
{:else}
  <h1>{v.ten}</h1>
  <p class="mo"><em>{v.ten_khoa_hoc}</em>{#if v.ten_khac.length} · Tên khác: {v.ten_khac.join(', ')}{/if}
    <NhanNguon nguon={v.nguon} /></p>

  {#if coDoc(v)}
    <div class="canh-bao do" role="alert"><strong>⚠ {DOC_TINH[v.doc_tinh.muc]}:</strong> {v.doc_tinh.canh_bao}</div>
  {/if}

  <dl>
    {#if v.ten_cay}<dt>Cây/con/khoáng vật</dt><dd><em>{v.ten_cay}</em></dd>{/if}
    {#if v.bo_phan_dung}<dt>Bộ phận dùng</dt><dd>{v.bo_phan_dung}</dd>{/if}
    {#if v.nguon_goc}<dt>Nguồn gốc</dt><dd>{NGUON_GOC[v.nguon_goc]}</dd>{/if}
    {#if v.tinh_vi}<dt>Tính vị</dt><dd>{v.tinh_vi}</dd>{/if}
    {#if v.quy_kinh.length}<dt>Quy kinh</dt><dd>{v.quy_kinh.join(', ')}</dd>{/if}
    {#if v.cong_nang.length}<dt>Công năng</dt><dd>{v.cong_nang.join('; ')}</dd>{/if}
    <dt>Liều dùng</dt>
    <dd>
      {#if v.lieu_dung}
        {v.lieu_dung.min_g}–{v.lieu_dung.max_g}g/ngày <NhanNguon nguon={v.lieu_dung.nguon ?? null} />
      {:else}
        <span class="mo">Chưa có liều chuẩn</span>
      {/if}
    </dd>
    <dt>Độc tính</dt><dd>{DOC_TINH[v.doc_tinh.muc]}{#if v.doc_tinh.canh_bao && !coDoc(v)} — {v.doc_tinh.canh_bao}{/if}</dd>
    <dt>Phổ biến</dt>
    <dd>
      {#if v.pho_bien}{PHO_BIEN[v.pho_bien.muc]} <span class="mo">({v.pho_bien.can_cu})</span>
      {:else}<span class="mo">Chưa có dữ liệu mức phổ biến</span>{/if}
    </dd>
  </dl>

  {#if v.kieng_ky.length}
    <h2>Kiêng kỵ</h2>
    <ul class="kieng-ky">{#each v.kieng_ky as k, i (i)}<li>{k}</li>{/each}</ul>
  {/if}

  <h2>Vị thay thế</h2>
  <div data-testid="thay-the">
    {#if v.thay_the.length === 0}
      <p class="mo">Chưa có dữ liệu vị thay thế.</p>
    {:else}
      <ul>
        {#each v.thay_the as t, i (i)}
          {@const vt = data.viThuoc[t.vi]}
          <li>
            <a href={href({ ten: 'vi', id: t.vi })}>{vt?.ten ?? t.vi}</a>
            {#if vt && coNhanDoc(vt)}<span class:doc={coDoc(vt)}> ⚠ {DOC_TINH[vt.doc_tinh.muc]}</span>{/if}
            — {t.ghi_chu}
            <NhanNguon nguon={t.nguon} />
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <section aria-labelledby="co-trong">
    <h2 id="co-trong">Có trong các bài thuốc</h2>
    {#if bai.length === 0}
      <p class="mo">Chưa có bài thuốc nào trong dữ liệu dùng vị này.</p>
    {:else}
      <ul>
        {#each bai as b (b.id)}
          <li>
            {b.ten}
            {#each theDung(b.id) as { b: benh, t } (`${benh.id}/${t.id}`)}
              — <a href={href({ ten: 'the', benhId: benh.id, theId: t.id })}>{benh.ten} · {t.ten}</a>
            {/each}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}

<style>
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.4rem 1rem; }
  dt { font-weight: 600; }
  dd { margin: 0; }
  .kieng-ky { color: var(--do); }
  .doc { color: var(--do); }
</style>
