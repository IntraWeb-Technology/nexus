/**
 * Unauthenticated liveness endpoint: GET /api/health -> { ok: true }
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/health',
      handler: 'health.check',
      config: {
        auth: false,
      },
    },
  ],
};
