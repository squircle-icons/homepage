// shadcn-svelte Select, adapted to Squircle's CSS tokens and original icons.
import { Select as SelectPrimitive } from 'bits-ui';
import './select.css';
export const Root = SelectPrimitive.Root;
export const Value = SelectPrimitive.Value;
export { default as Trigger } from './select-trigger.svelte';
export { default as Content } from './select-content.svelte';
export { default as Item } from './select-item.svelte';
