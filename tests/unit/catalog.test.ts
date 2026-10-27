import assert from 'node:assert/strict';
import { selectCatalog } from '../../tools/catalog-selection.js';
import { paginate } from '../../src/lib/pagination.js';

const icons = Array.from({ length: 1003 }, (_, i) => ({
  name: `icon-${i}`,
  reviewStatus: i === 0 ? 'draft' : 'approved',
}));
assert.equal(selectCatalog(icons, 'public').length, 1002);
assert.equal(selectCatalog(icons, 'outline').length, 12);
assert(selectCatalog(icons, 'outline').every((icon) => icon.reviewStatus === 'approved'));
const first = paginate(icons, 1);
assert.equal(first.items.length, 48);
assert.equal(first.items[0], icons[0]);
const last = paginate(icons, 999);
assert.equal(last.page, 21);
assert.equal(last.pageCount, 21);
assert.deepEqual(last.items, icons.slice(960));
assert.equal(paginate(icons, -5).page, 1);
assert.deepEqual(paginate([], 20), { page: 1, pageCount: 1, items: [] });
// A search result clamps a previously selected late page to its available page.
assert.equal(paginate([icons[0]], 21).page, 1);
console.log('Catalog selection and pagination boundary checks passed.');
