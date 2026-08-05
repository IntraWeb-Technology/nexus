import type { Context } from 'koa';

export default {
  async check(ctx: Context) {
    ctx.body = { ok: true };
  },
};
