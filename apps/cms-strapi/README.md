# cms-strapi

Multi-site editorial CMS for **IntraWeb Technology**, built on Strapi 5.51.1
(TypeScript). It is the single source of truth for editorial content
(pages, articles, projects, case studies, services, FAQs, testimonials,
navigation, redirects) shared across the `personal` (johnschibelli.dev)
and `intraweb` (intrawebtech.com) sites. See
[`docs/strapi-migration/contracts.md`](../../docs/strapi-migration/contracts.md)
and [`docs/strapi-migration/content-model.md`](../../docs/strapi-migration/content-model.md)
in the repo root for the frozen content model and API contracts. Operational
data (auth, billing, portal RBAC) is explicitly **out of scope** here — see
the Portal boundary section of the contracts doc.

## Content model highlights

- **Sites** (`personal`, `intraweb`) are the ownership root. `Site.key` is
  immutable after creation (enforced by a lifecycle hook) since frontends
  hardcode it.
- Single-site types (Site Settings, Navigation, Page, Service, Redirect)
  relate to exactly one Site; multi-site types (Article, Project, Case
  Study, Testimonial, FAQ Item) use a many-to-many `sites` relation;
  global types (Author, Category, Tag, Technology) have no Site relation.
- `Page.sections` is the only dynamic zone (`blocks.hero`, `blocks.rich-text`,
  `blocks.cta`, `blocks.faq-section`, `blocks.media`, `blocks.stats`).
- Uniqueness rules (`Site.key`, `(site, slug)` on Page, one Site Settings
  per Site, slug-per-site on Article/Project/Case Study) are enforced via
  content-type lifecycle hooks in `src/api/*/content-types/*/lifecycles.ts`
  — see inline comments for Draft & Publish / Document Service caveats.

## Bootstrap seed

On every boot, `src/index.ts` idempotently ensures the two contract-defined
`Site` rows (`personal`, `intraweb`) exist — it only inserts missing keys
and never mutates existing rows. For fuller seeding/migration workflows see
`scripts/seed-sites.ts` and `scripts/migrate/`.

## Health check

`GET /api/health` (no auth) returns `{ "ok": true }` for liveness probes.

## Database

`config/database.ts` supports `sqlite` (dev default), `postgres` (prod —
the `pg` driver is a dependency), and `mysql` via `DATABASE_CLIENT`. Copy
`.env.example` to `.env` and fill in real secrets — **never commit `.env`**.
The live instance at `cms.intrawebtech.com` is a deploy target only; do not
point local development at it, and do not write production schemas without
an explicit inventory + backup + approval step (see ADR-002 in the docs
site).

---

# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
