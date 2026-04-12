/**
 * n8n Workflow SDK source — validate, dedupe, PATCH HubSpot deal on catalog Stripe checkout.
 *
 * Portal POSTs JSON from `triggerStripeCatalogCheckout` (see `StripeCatalogCheckoutPayload` in
 * `src/lib/n8n/webhooks.ts`) to `N8N_BASE_URL/webhook/portal-stripe-catalog-payment`.
 *
 * Environment on n8n host: WEBHOOK_SECRET (must match portal)
 * Credential: HubSpot PAT as httpBearerAuth — scopes need `crm.objects.deals.write` (and read).
 *
 * HubSpot Deal custom properties (create in Settings → Data management → Deals → Properties
 * with these internal names, or edit the Code node `propertyMap` to match your schema):
 *   - stripe_catalog_session_id   (single-line text)
 *   - stripe_catalog_paid_at      (datetime)
 *   - stripe_catalog_amount_cents (number)
 *   - stripe_catalog_currency     (single-line text)
 *   - stripe_catalog_sku          (single-line text)
 *   - stripe_catalog_type         (single-line text)
 *   - stripe_catalog_customer_email (single-line text)
 *   - stripe_catalog_promo_code   (single-line text) — promotion_code id if present
 *
 * Dedupe uses workflow static data keyed by `stripe_checkout_session_id` (Stripe retries).
 */
import { workflow, trigger, node, ifElse, newCredential, expr, sticky } from '@n8n/workflow-sdk'

const stickyMain = sticky(
  'Path: portal-stripe-catalog-payment\nValidate x-intrawebtech-secret vs $env.WEBHOOK_SECRET.\nDedupe: $getWorkflowStaticData global stripeCatalogSessions.\nPATCH deal only when metadata.hubspot_deal_id is set.\nCreate HubSpot deal properties listed in file header or change propertyMap in Code.',
  [],
  { color: 5 },
)

const webhookTrigger = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'portal-stripe-catalog-payment',
    parameters: {
      httpMethod: 'POST',
      path: 'portal-stripe-catalog-payment',
      responseMode: 'responseNode',
      options: {},
    },
    position: [240, 400],
  },
  output: [
    {
      headers: { 'x-intrawebtech-secret': 'dev' },
      body: {
        event: 'stripe_catalog_checkout_completed',
        stripe_checkout_session_id: 'cs_test_demo',
        stripe_payment_intent_id: 'pi_test_demo',
        stripe_payment_link_id: 'plink_test_demo',
        stripe_subscription_id: null,
        mode: 'payment',
        amount_total: 350000,
        currency: 'usd',
        customer_email: 'payer@example.com',
        metadata: {
          sku: 'IW-WEB-STR',
          type: 'deposit',
          hubspot_deal_id: '12345678901',
        },
        discounts: { amount_discount_cents: 0, promotion_code_id: null, coupon_id: null },
      },
    },
  ],
})

const validateDedupeBuild = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Validate secret dedupe build PATCH',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const item = $input.first().json;
const headers = item.headers || {};
const headerSecret = headers['x-intrawebtech-secret'] ?? headers['X-Intrawebtech-Secret'] ?? '';
if (headerSecret !== ($env.WEBHOOK_SECRET || '')) {
  return [{ json: { authorized: false, httpStatus: 401, message: 'Unauthorized', flow: 'error' } }];
}
const body = item.body !== undefined && typeof item.body === 'object' && !Array.isArray(item.body) ? item.body : item;
const sid = String(body.stripe_checkout_session_id || '').trim();
if (!sid) {
  return [{ json: { authorized: false, httpStatus: 400, message: 'stripe_checkout_session_id required', flow: 'error' } }];
}
const staticData = $getWorkflowStaticData('global');
if (!staticData.stripeCatalogSessions) staticData.stripeCatalogSessions = {};
if (staticData.stripeCatalogSessions[sid]) {
  return [{
    json: {
      authorized: true,
      httpStatus: 200,
      flow: 'dedupe',
      stripe_checkout_session_id: sid,
    },
  }];
}
staticData.stripeCatalogSessions[sid] = Date.now();
const keys = Object.keys(staticData.stripeCatalogSessions);
if (keys.length > 3000) {
  keys.sort((a, b) => staticData.stripeCatalogSessions[a] - staticData.stripeCatalogSessions[b]);
  for (let i = 0; i < keys.length - 2500; i++) {
    delete staticData.stripeCatalogSessions[keys[i]];
  }
}
const meta = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};
const dealId = String(meta.hubspot_deal_id || '').replace(/[^0-9]/g, '') || String(meta.hubspot_deal_id || '').trim();
if (!dealId) {
  return [{
    json: {
      authorized: true,
      httpStatus: 200,
      flow: 'no_deal',
      stripe_checkout_session_id: sid,
      message: 'metadata.hubspot_deal_id missing; skipped HubSpot PATCH',
    },
  }];
}
const disc = body.discounts && typeof body.discounts === 'object' ? body.discounts : {};
const promo = disc.promotion_code_id != null ? String(disc.promotion_code_id) : '';
const paidAt = new Date().toISOString();
const propertyMap = {
  stripe_catalog_session_id: sid,
  stripe_catalog_paid_at: paidAt,
  stripe_catalog_amount_cents: body.amount_total != null ? String(body.amount_total) : '',
  stripe_catalog_currency: body.currency != null ? String(body.currency) : '',
  stripe_catalog_sku: meta.sku != null ? String(meta.sku) : '',
  stripe_catalog_type: meta.type != null ? String(meta.type) : '',
  stripe_catalog_customer_email: body.customer_email != null ? String(body.customer_email) : '',
  stripe_catalog_promo_code: promo,
  stripe_catalog_payment_intent_id: body.stripe_payment_intent_id != null ? String(body.stripe_payment_intent_id) : '',
  stripe_catalog_payment_link_id: body.stripe_payment_link_id != null ? String(body.stripe_payment_link_id) : '',
  stripe_catalog_mode: body.mode != null ? String(body.mode) : '',
};
return [{
  json: {
    authorized: true,
    httpStatus: 200,
    flow: 'patch',
    dealId,
    patchUrl: 'https://api.hubapi.com/crm/v3/objects/deals/' + encodeURIComponent(dealId),
    patchBody: { properties: propertyMap },
    stripe_checkout_session_id: sid,
  },
}];`,
    },
    position: [520, 400],
  },
  output: [
    {
      authorized: true,
      httpStatus: 200,
      flow: 'patch',
      dealId: '12345678901',
      patchUrl: 'https://api.hubapi.com/crm/v3/objects/deals/12345678901',
      patchBody: { properties: { stripe_catalog_session_id: 'cs_test_demo' } },
      stripe_checkout_session_id: 'cs_test_demo',
    },
  ],
})

const branchFlow = ifElse({
  version: 2.2,
  config: {
    name: 'flow eq patch?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
        conditions: [
          {
            id: 'f',
            leftValue: '={{ $json.flow }}',
            rightValue: 'patch',
            operator: { type: 'string', operation: 'equals', name: 'filter.operator.equals' },
          },
        ],
        combinator: 'and',
      },
    },
    position: [760, 400],
  },
})

const hubspotPatchDeal = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'HubSpot PATCH deal',
    parameters: {
      method: 'PATCH',
      url: expr('={{ $json.patchUrl }}'),
      authentication: 'genericCredentialType',
      genericAuthType: 'httpBearerAuth',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('={{ $json.patchBody }}'),
      options: { response: { response: { neverError: true } } },
    },
    credentials: {
      httpBearerAuth: newCredential('HubSpot Portal PAT'),
    },
    position: [1020, 280],
  },
  output: [{ statusCode: 200 }],
})

const respondOk = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond 200 ok',
    parameters: {
      respondWith: 'json',
      responseBody: expr('={{ { ok: true, patched: true } }}'),
      options: { responseCode: 200 },
    },
    position: [1280, 280],
  },
})

const respondNoPatch = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond 200 no PATCH',
    parameters: {
      respondWith: 'json',
      responseBody: expr(
        '={{ { ok: true, flow: $json.flow, message: $json.message, stripe_checkout_session_id: $json.stripe_checkout_session_id } }}',
      ),
      options: { responseCode: 200 },
    },
    position: [1020, 520],
  },
  output: [{}],
})

const respondError = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond error',
    parameters: {
      respondWith: 'json',
      responseBody: expr(
        '={{ { ok: false, message: $json.message, httpStatus: $json.httpStatus } }}',
      ),
      options: {
        responseCode: expr('={{ Number($json.httpStatus) > 0 ? Number($json.httpStatus) : 401 }}'),
      },
    },
    position: [760, 640],
  },
  output: [{}],
})

const branchAuthorized = ifElse({
  version: 2.2,
  config: {
    name: 'authorized?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
        conditions: [
          {
            id: 'a',
            leftValue: '={{ $json.authorized }}',
            rightValue: true,
            operator: { type: 'boolean', operation: 'equals', name: 'filter.operator.equals' },
          },
        ],
        combinator: 'and',
      },
    },
    position: [640, 400],
  },
})

export default workflow(
  'portal-stripe-catalog-payment',
  'Stripe catalog checkout → validate dedupe PATCH HubSpot deal',
)
  .add(stickyMain)
  .add(webhookTrigger)
  .to(validateDedupeBuild)
  .to(branchAuthorized.onTrue(branchFlow.onTrue(hubspotPatchDeal.to(respondOk)).onFalse(respondNoPatch)).onFalse(respondError))
