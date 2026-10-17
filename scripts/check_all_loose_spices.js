const items = require('../scratch_spices_audit.json');
const loose = items.filter(p => p.brand === 'G1 Mart Loose Staples' || p.brand === 'Local / Unbranded');
console.log('Total loose / unbranded spices:', loose.length);
loose.forEach(p => console.log('[' + p.id + '] ' + p.name + ' | ' + p.brand + ' | active: ' + p.isActive));
