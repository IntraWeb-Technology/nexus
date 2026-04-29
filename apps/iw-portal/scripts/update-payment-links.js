/**
 * update-payment-links.js
 *
 * Bulk-updates all 20 IntraWeb retainer payment links with the standard option set:
 *   - Collect tax automatically (automatic_tax.enabled = true)
 *   - Allow promotion codes (allow_promotion_codes = true)
 *   - Allow business customers to provide tax IDs (tax_id_collection.enabled = true)
 *   - Collect payment method when needed (payment_method_collection: 'always'; subscription links always attach to a Customer)
 *   - "Subscribe" as call-to-action (submit_type)
 *
 * Note: Stripe does not allow consent_collection on Payment Link *updates* (create-only).
 * To require terms of service, set that when creating links or adjust each link in Dashboard.
 *
 * USAGE:
 *   1. Save this file as update-payment-links.js (in apps/iw-portal/scripts/)
 *   2. Make sure Node 18+ is installed
 *   3. From apps/iw-portal: pnpm install (stripe is already a dependency)
 *   4. Set your secret key:       export STRIPE_SECRET_KEY=sk_live_...
 *      PowerShell:                $env:STRIPE_SECRET_KEY="sk_live_..."
 *   5. Run:                       node scripts/update-payment-links.js
 *
 * The script processes links sequentially with a 200ms delay between each to stay
 * well under Stripe's rate limit. Total runtime: ~10 seconds.
 *
 * Tax: automatic_tax requires tax settings in Stripe. Promotion codes must be allowed
 * for your account/link type where applicable.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports -- run with `node`; CJS require keeps the script copy-paste friendly without a build step
const Stripe = require('stripe');

// Use the SDK default API version (matches installed stripe major version).
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// All 20 payment link IDs created for the IntraWeb retainer catalog
const PAYMENT_LINKS = [
  // Web Care
  { id: 'plink_1TQhqkFFObU2Nf6zqop4yK0h', label: 'Web Care Essential / Monthly' },
  { id: 'plink_1TQhqrFFObU2Nf6zutenYvYO', label: 'Web Care Essential / Annual' },
  { id: 'plink_1TQhqxFFObU2Nf6zMFLhnsW3', label: 'Web Care Pro / Monthly' },
  { id: 'plink_1TQhr2FFObU2Nf6z9awow4El', label: 'Web Care Pro / Annual' },
  { id: 'plink_1TQhr7FFObU2Nf6zihtygIiN', label: 'Web Care Advanced / Monthly' },
  { id: 'plink_1TQhrCFFObU2Nf6zAOrJZyd3', label: 'Web Care Advanced / Annual' },

  // Growth
  { id: 'plink_1TQhrJFFObU2Nf6zBAzOW3Kk', label: 'Growth Foundation / Monthly' },
  { id: 'plink_1TQhrQFFObU2Nf6zA3kCct0s', label: 'Growth Foundation / Annual' },
  { id: 'plink_1TQhrWFFObU2Nf6zhEO5TBFz', label: 'Growth Accelerate / Monthly' },
  { id: 'plink_1TQhrcFFObU2Nf6z17BfCngc', label: 'Growth Accelerate / Annual' },

  // AI Care
  { id: 'plink_1TQhrjFFObU2Nf6zShGh0G1f', label: 'AI Care Essential / Monthly' },
  { id: 'plink_1TQhroFFObU2Nf6zhej5PgpB', label: 'AI Care Essential / Annual' },
  { id: 'plink_1TQhrtFFObU2Nf6zXuGQnkS3', label: 'AI Care Pro / Monthly' },
  { id: 'plink_1TQhrzFFObU2Nf6zpWMA44PJ', label: 'AI Care Pro / Annual' },
  { id: 'plink_1TQhs5FFObU2Nf6zHqElkQRH', label: 'AI Care Enterprise / Monthly' },
  { id: 'plink_1TQhsBFFObU2Nf6zDf9iAqpB', label: 'AI Care Enterprise / Annual' },

  // Bundles
  { id: 'plink_1TQhsGFFObU2Nf6zcJK754rf', label: 'Pro Bundle / Monthly' },
  { id: 'plink_1TQhsMFFObU2Nf6z2E5iYPhA', label: 'Pro Bundle / Annual' },
  { id: 'plink_1TQhsRFFObU2Nf6zJtEYEQyk', label: 'Enterprise Bundle / Monthly' },
  { id: 'plink_1TQhsXFFObU2Nf6z17lFUAvh', label: 'Enterprise Bundle / Annual' },
];

// The configuration to apply to every link
const UPDATE_PAYLOAD = {
  automatic_tax: { enabled: true },
  allow_promotion_codes: true,
  tax_id_collection: { enabled: true },
  // customer_creation is invalid when the link has recurring prices (subscription mode).
  payment_method_collection: 'always',
  submit_type: 'subscribe',
};

// Helper to wait between API calls
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function updateAllLinks() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY. Set it in the environment before running this script.');
    process.exit(1);
  }

  console.log(`Starting update for ${PAYMENT_LINKS.length} payment links…\n`);

  let successCount = 0;
  let failCount = 0;
  const failures = [];

  for (const link of PAYMENT_LINKS) {
    try {
      await stripe.paymentLinks.update(link.id, UPDATE_PAYLOAD);
      console.log(`✅  ${link.label.padEnd(40)}  ${link.id}`);
      successCount++;
    } catch (err) {
      console.error(`❌  ${link.label.padEnd(40)}  ${link.id}`);
      console.error(`    └─ ${err.message}`);
      failCount++;
      failures.push({ link, error: err.message });
    }
    await sleep(200); // gentle on the rate limiter
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Done.  ${successCount} updated, ${failCount} failed.`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    failures.forEach((f) => {
      console.log(`  • ${f.link.label}: ${f.error}`);
    });
    console.log(
      '\nCommon causes: tax not configured in Stripe, invalid parameter for link mode, ' +
        'or the link is inactive.'
    );
    process.exit(1);
  }
}

updateAllLinks().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
