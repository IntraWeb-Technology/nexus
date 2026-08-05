type GtagEventPayload = {
  event_category: string;
  event_label: string;
  value?: number;
};

declare global {
  interface Window {
    gtag(command: "config", targetId: string, params?: { page_path?: string }): void;
    gtag(command: "event", action: string, params?: GtagEventPayload): void;
  }
}

export const GA_TRACKING_ID = "G-XXXXXXXXXX"; // Replace with your GA4 ID

export const pageview = (url: string) => {
  window.gtag("config", GA_TRACKING_ID, { page_path: url });
};

export const event = (params: { action: string; category: string; label: string; value?: number }) => {
  const { action, category, label, value } = params;
  window.gtag("event", action, { event_category: category, event_label: label, value });
};