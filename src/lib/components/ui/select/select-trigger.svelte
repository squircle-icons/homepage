<!-- Adapted from shadcn-svelte Select; see static/licenses/shadcn-svelte-MIT.txt. -->
<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import ChevronDown from '@squircle-icons/svelte/chevron-down';
  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: Omit<SelectPrimitive.TriggerProps, 'child'> = $props();
</script>

<SelectPrimitive.Trigger
  bind:ref
  data-slot="select-trigger"
  class={['squircle-select-trigger', className]}
  {...restProps}
>
  {@render children?.()}
  <ChevronDown size={16} />
</SelectPrimitive.Trigger>
