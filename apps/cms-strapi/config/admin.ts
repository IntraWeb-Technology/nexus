import type { Core } from '@strapi/strapi';
import { getPreviewPathname } from './preview-paths';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const clientUrl = env('CLIENT_URL', '').replace(/\/$/, '');
  const previewSecret =
    env('PREVIEW_SECRET', '') || env('STRAPI_PREVIEW_SECRET', '');

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET')!,
    },
    apiToken: {
      salt: env('API_TOKEN_SALT')!,
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT')!,
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY')!,
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
      docLinks: env.bool('FLAG_DOC_LINKS', true),
    },
    preview: {
      enabled: Boolean(clientUrl && previewSecret),
      config: {
        allowedOrigins: clientUrl ? [clientUrl] : undefined,
        async handler(uid, { documentId, status }) {
          if (!clientUrl || !previewSecret) return null;

          const document = await strapi
            .documents(uid as Parameters<typeof strapi.documents>[0])
            .findOne({ documentId });
          const pathname = getPreviewPathname(uid, document);
          if (!pathname) return null;

          const params = new URLSearchParams({
            secret: previewSecret,
            url: pathname,
            status: status ?? 'draft',
          });
          return `${clientUrl}/api/preview?${params.toString()}`;
        },
      },
    },
  };
};

export default config;
