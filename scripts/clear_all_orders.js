/**
 * Utility script to completely wipe all test orders across all accounts in G1Mart.
 * Backs up existing orders to data/backup_orders/ before clearing.
 *
 * Usage:
 *   node scripts/clear_all_orders.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backup_orders');

const ORDERS_FILE = path.join(DATA_DIR, 'g1mart_orders.json');
const SLIP_ORDERS_FILE = path.join(DATA_DIR, 'g1mart_slip_orders.json');
const DEV_CACHE_FILE = path.join(ROOT_DIR, '.next', 'g1mart_orders_dev.json');
const TMP_ORDERS = path.join(os.tmpdir(), 'g1mart_orders.json');
const TMP_SLIP_ORDERS = path.join(os.tmpdir(), 'g1mart_slip_orders.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function clearAllOrders() {
  console.log('--- G1Mart Orders Reset Utility ---');
  ensureDir(BACKUP_DIR);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // 1. Backup & Clear Standard Orders
  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const backupPath = path.join(BACKUP_DIR, `g1mart_orders_${timestamp}.json`);
      fs.copyFileSync(ORDERS_FILE, backupPath);
      console.log(`[Backup] Saved existing orders to: ${path.relative(ROOT_DIR, backupPath)}`);
    } catch (e) {
      console.warn('Could not create backup of orders:', e.message);
    }
  }
  fs.writeFileSync(ORDERS_FILE, '[]', 'utf-8');
  console.log('[Cleared] data/g1mart_orders.json reset to []');

  // 2. Backup & Clear Slip / Photo Orders
  if (fs.existsSync(SLIP_ORDERS_FILE)) {
    try {
      const backupPath = path.join(BACKUP_DIR, `g1mart_slip_orders_${timestamp}.json`);
      fs.copyFileSync(SLIP_ORDERS_FILE, backupPath);
      console.log(`[Backup] Saved existing slip orders to: ${path.relative(ROOT_DIR, backupPath)}`);
    } catch (e) {
      console.warn('Could not create backup of slip orders:', e.message);
    }
  }
  fs.writeFileSync(SLIP_ORDERS_FILE, '[]', 'utf-8');
  console.log('[Cleared] data/g1mart_slip_orders.json reset to []');

  // 3. Clear Next.js dev cache if present
  if (fs.existsSync(DEV_CACHE_FILE)) {
    try {
      fs.unlinkSync(DEV_CACHE_FILE);
      console.log('[Cleared] .next/g1mart_orders_dev.json deleted');
    } catch (e) {}
  }

  // 4. Clear OS temp order files if present
  if (fs.existsSync(TMP_ORDERS)) {
    try {
      fs.unlinkSync(TMP_ORDERS);
      console.log('[Cleared] Temp orders cache deleted');
    } catch (e) {}
  }
  if (fs.existsSync(TMP_SLIP_ORDERS)) {
    try {
      fs.unlinkSync(TMP_SLIP_ORDERS);
      console.log('[Cleared] Temp slip orders cache deleted');
    } catch (e) {}
  }

  console.log('\nAll server order files have been successfully cleared!');
  console.log('NOTE: If your Next.js dev server is running, restart it (`npm run dev`) so in-memory caches clear.');
  console.log('To clear client browser cache, run in browser console:');
  console.log('  localStorage.removeItem("g1mart_account_orders");');
  console.log('  localStorage.removeItem("g1mart_recent_order");');
  console.log('  sessionStorage.clear();');
  console.log('  location.reload();');
}

clearAllOrders();
