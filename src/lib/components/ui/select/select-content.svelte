<!-- Adapted from shadcn-svelte Select; see static/licenses/shadcn-svelte-MIT.txt. -->
<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  let {
    ref = $bindable(null),
    class: className,
    children,
    sideOffset = 6,
    ...restProps
  }: Omit<SelectPrimitive.ContentProps, 'child'> = $props();
</script>

<SelectPrimitive.Portal>
  <SelectPrimitive.Content
    bind:ref
    {sideOffset}
    align="end"
    data-slot="select-content"
    class={['squircle-select-content', className]}
    {...restProps}
  >
    <SelectPrimitive.Viewport>
      {@render children?.()}
    </SelectPrimitive.Viewport>
  </SelectPrimitive.Content>
</SelectPrimitive.Portal>
