/** @jest-environment node */
import {
  LEAD_INTAKE_HUBSPOT_DEAL_STAGE_DEFAULT,
  buildN8nContactLeadWebhookPayload,
  resolveLeadIntakeDealStageForHubSpot,
} from "../n8nLeadIntakeDealStage";

describe("resolveLeadIntakeDealStageForHubSpot", () => {
  const prev = process.env.N8N_CONTACT_DEAL_STAGE;

  afterEach(() => {
    if (prev === undefined) delete process.env.N8N_CONTACT_DEAL_STAGE;
    else process.env.N8N_CONTACT_DEAL_STAGE = prev;
  });

  it("defaults to appointmentscheduled when no env and no override", () => {
    delete process.env.N8N_CONTACT_DEAL_STAGE;
    expect(resolveLeadIntakeDealStageForHubSpot()).toBe(LEAD_INTAKE_HUBSPOT_DEAL_STAGE_DEFAULT);
  });

  it("uses N8N_CONTACT_DEAL_STAGE when set to a numeric id", () => {
    process.env.N8N_CONTACT_DEAL_STAGE = "123456789";
    expect(resolveLeadIntakeDealStageForHubSpot()).toBe("123456789");
  });

  it("uses N8N_CONTACT_DEAL_STAGE when set to presentationscheduled", () => {
    process.env.N8N_CONTACT_DEAL_STAGE = "presentationscheduled";
    expect(resolveLeadIntakeDealStageForHubSpot()).toBe("presentationscheduled");
  });

  it("never returns qualifiedtobuy from env (falls back to default)", () => {
    process.env.N8N_CONTACT_DEAL_STAGE = "qualifiedtobuy";
    expect(resolveLeadIntakeDealStageForHubSpot()).toBe(LEAD_INTAKE_HUBSPOT_DEAL_STAGE_DEFAULT);
  });

  it("never returns qualifiedtobuy from client override", () => {
    delete process.env.N8N_CONTACT_DEAL_STAGE;
    expect(resolveLeadIntakeDealStageForHubSpot("qualifiedtobuy")).toBe(
      LEAD_INTAKE_HUBSPOT_DEAL_STAGE_DEFAULT,
    );
  });

  it("client override wins when valid and not qualified", () => {
    process.env.N8N_CONTACT_DEAL_STAGE = "presentationscheduled";
    expect(resolveLeadIntakeDealStageForHubSpot("closedlost")).toBe("closedlost");
  });

  it("skips invalid client override and falls back", () => {
    delete process.env.N8N_CONTACT_DEAL_STAGE;
    expect(resolveLeadIntakeDealStageForHubSpot("Not A Stage Label")).toBe(
      LEAD_INTAKE_HUBSPOT_DEAL_STAGE_DEFAULT,
    );
  });
});

describe("buildN8nContactLeadWebhookPayload", () => {
  const prev = process.env.N8N_CONTACT_DEAL_STAGE;

  afterEach(() => {
    if (prev === undefined) delete process.env.N8N_CONTACT_DEAL_STAGE;
    else process.env.N8N_CONTACT_DEAL_STAGE = prev;
  });

  it("includes contactId, createDeal, tier, painOverride and non-qualified dealStage", () => {
    delete process.env.N8N_CONTACT_DEAL_STAGE;
    const body = buildN8nContactLeadWebhookPayload({
      contactId: "hs-123",
      tier: "growth",
    });
    expect(body).toEqual({
      contactId: "hs-123",
      createDeal: true,
      dealStage: LEAD_INTAKE_HUBSPOT_DEAL_STAGE_DEFAULT,
      tier: "growth",
      painOverride: "",
    });
    expect(body.dealStage).not.toBe("qualifiedtobuy");
  });
});
