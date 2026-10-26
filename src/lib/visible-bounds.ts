/** Tight geometry bounds in the root SVG's 24-unit coordinate system.
 * SVG container getBBox can rotate a child's bounding rectangle, leaving
 * false padding around circles/curves. Measure the transformed geometry instead.
 * Rounded outline strokes are added by the caller, after non-scaling transforms.
 */
export function visibleBounds(svg: SVGSVGElement) {
  const screen = svg.getScreenCTM();
  if (!screen) return svg.getBBox();
  const rootInverse = screen.inverse();
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;
  for (const shape of svg.querySelectorAll<SVGGeometryElement>('path, circle')) {
    const shapeScreen = shape.getScreenCTM();
    if (!shapeScreen) continue;
    const matrix = rootInverse.multiply(shapeScreen);
    const project = (x: number, y: number) => ({
      x: matrix.a * x + matrix.c * y + matrix.e,
      y: matrix.b * x + matrix.d * y + matrix.f,
    });
    if (shape instanceof SVGCircleElement) {
      const center = project(shape.cx.baseVal.value, shape.cy.baseVal.value);
      const rx = shape.r.baseVal.value * Math.hypot(matrix.a, matrix.c);
      const ry = shape.r.baseVal.value * Math.hypot(matrix.b, matrix.d);
      left = Math.min(left, center.x - rx);
      right = Math.max(right, center.x + rx);
      top = Math.min(top, center.y - ry);
      bottom = Math.max(bottom, center.y + ry);
      continue;
    }
    const length = shape.getTotalLength();
    const point = (distance: number) => {
      const local = shape.getPointAtLength(distance);
      return project(local.x, local.y);
    };
    // Locate each global axis extreme, then refine its surrounding arc interval.
    // Samples only bracket extrema; displayed precision does not rely on the mesh.
    const steps = Math.max(64, Math.ceil(length * 8));
    const samples = Array.from({ length: steps + 1 }, (_, i) => point((i * length) / steps));
    for (const axis of ['x', 'y'] as const) {
      for (const direction of [-1, 1]) {
        let best = 0;
        for (let i = 1; i <= steps; i++)
          if (samples[i][axis] * direction > samples[best][axis] * direction) best = i;
        let lo = (Math.max(0, best - 1) * length) / steps;
        let hi = (Math.min(steps, best + 1) * length) / steps;
        for (let i = 0; i < 20; i++) {
          const a = lo + (hi - lo) / 3;
          const b = hi - (hi - lo) / 3;
          if (point(a)[axis] * direction < point(b)[axis] * direction) lo = a;
          else hi = b;
        }
        const candidate = point((lo + hi) / 2);
        const value =
          direction < 0
            ? Math.min(samples[best][axis], candidate[axis])
            : Math.max(samples[best][axis], candidate[axis]);
        if (axis === 'x') {
          left = Math.min(left, value);
          right = Math.max(right, value);
        } else {
          top = Math.min(top, value);
          bottom = Math.max(bottom, value);
        }
      }
    }
  }
  return Number.isFinite(left)
    ? { x: left, y: top, width: right - left, height: bottom - top }
    : svg.getBBox();
}
