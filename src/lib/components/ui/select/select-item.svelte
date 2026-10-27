<!-- Adapted from shadcn-svelte Select; see static/licenses/shadcn-svelte-MIT.txt. -->
<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import Check from '@squircle-icons/svelte/check';
  let {
    ref = $bindable(null),
    class: className,
    value,
    label,
    children: childrenProp,
    ...restProps
  }: Omit<SelectPrimitive.ItemProps, 'child'> = $props();
</script>

<SelectPrimitive.Item
  bind:ref
  {value}
  {label}
  data-slot="select-item"
  class={['squircle-select-item', className]}
  {...restProps}
>
  {#snippet children({ selected, highlighted })}
    <span
      >{#if childrenProp}{@render childrenProp({ selected, highlighted })}{:else}{label ||
          value}{/if}</span
    >
    <span class="squircle-select-indicator"
      >{#if selected}<Check size={16} />{/if}</span
    >
  {/snippet}
</SelectPrimitive.Item>
