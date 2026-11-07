<script lang="ts">
  import { useRegisterSW } from 'virtual:pwa-register/svelte'

  const { needRefresh, updateServiceWorker } = useRegisterSW()
</script>

{#if $needRefresh}
  <div class="cap-nhat" role="status">
    Có dữ liệu mới — <button type="button" onclick={() => updateServiceWorker(true)}>tải lại</button>
    <button type="button" class="dong" aria-label="Đóng" onclick={() => needRefresh.set(false)}>×</button>
  </div>
{/if}

<style>
  .cap-nhat {
    position: fixed; top: 0.6rem; left: 50%; transform: translateX(-50%); z-index: 10;
    background: var(--chu); color: var(--nen); padding: 0.5rem 0.9rem; border-radius: 999px;
    display: flex; gap: 0.5rem; align-items: center; font-size: 0.9rem; max-width: calc(100vw - 32px);
  }
  button { font: inherit; background: none; border: 0; color: inherit; text-decoration: underline; cursor: pointer; padding: 0; }
  .dong { text-decoration: none; font-size: 1.1rem; }
</style>
