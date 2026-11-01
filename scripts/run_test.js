const path = require('path');
const createJiti = require('jiti');

const jiti = createJiti(__dirname, {
  alias: {
    '@': path.join(__dirname, '..', 'src')
  }
});

jiti('./test_payment_scenarios.ts');
