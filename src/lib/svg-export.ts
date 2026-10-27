/** Serialize the rendered library component, preserving its actual geometry and selected style. */
export function serializeIconSvg(source: SVGSVGElement, size: number, label: string): string {
  const svg = source.cloneNode(true) as SVGSVGElement;
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label);
  svg.removeAttribute('aria-hidden');
  svg.removeAttribute('class');
  // Hydration markers are framework internals, not SVG artwork.
  const comments: Node[] = [];
  const walker = document.createTreeWalker(svg, NodeFilter.SHOW_COMMENT);
  while (walker.nextNode()) comments.push(walker.currentNode);
  for (const comment of comments) comment.parentNode?.removeChild(comment);
  return new XMLSerializer().serializeToString(svg) + '\n';
}
