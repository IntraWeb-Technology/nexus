import type { Schema, Struct } from '@strapi/strapi';

export interface AboutApproach extends Struct.ComponentSchema {
  collectionName: 'components_about_approachs';
  info: {
    description: 'About approach section';
    displayName: 'About Approach';
    icon: 'book';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    bodyCondensed: Schema.Attribute.Text;
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    chapterCondensed: Schema.Attribute.String;
    figure: Schema.Attribute.Component<'publishing.media', false>;
    figureCaption: Schema.Attribute.String;
    stages: Schema.Attribute.JSON & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutArchitecture extends Struct.ComponentSchema {
  collectionName: 'components_about_architectures';
  info: {
    description: 'About architecture section';
    displayName: 'About Architecture';
    icon: 'book';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    figure: Schema.Attribute.Component<'publishing.media', false>;
    figureCaption: Schema.Attribute.String;
    layers: Schema.Attribute.JSON & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutFocus extends Struct.ComponentSchema {
  collectionName: 'components_about_focuss';
  info: {
    description: 'About focus section';
    displayName: 'About Focus';
    icon: 'book';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    bodyCondensed: Schema.Attribute.Text;
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    status: Schema.Attribute.String;
    statusLabel: Schema.Attribute.String;
    themes: Schema.Attribute.String;
    themesLabel: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutNotes extends Struct.ComponentSchema {
  collectionName: 'components_about_notess';
  info: {
    description: 'About notes section';
    displayName: 'About Notes';
    icon: 'book';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    bodyCondensed: Schema.Attribute.Text;
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    pullQuote: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface AboutOpening extends Struct.ComponentSchema {
  collectionName: 'components_about_openings';
  info: {
    description: 'About opening section';
    displayName: 'About Opening';
    icon: 'book';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    deck: Schema.Attribute.Text & Schema.Attribute.Required;
    deckCondensed: Schema.Attribute.Text;
    marginNoteBody: Schema.Attribute.Text;
    marginNoteLabel: Schema.Attribute.String;
    meta: Schema.Attribute.String;
    metaCondensed: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutPhilosophy extends Struct.ComponentSchema {
  collectionName: 'components_about_philosophys';
  info: {
    description: 'About philosophy section';
    displayName: 'About Philosophy';
    icon: 'book';
  };
  attributes: {
    attribution: Schema.Attribute.String;
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    quoteCondensed: Schema.Attribute.Text;
  };
}

export interface AboutPrinciples extends Struct.ComponentSchema {
  collectionName: 'components_about_principless';
  info: {
    description: 'About principles section';
    displayName: 'About Principles';
    icon: 'book';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.JSON & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutReading extends Struct.ComponentSchema {
  collectionName: 'components_about_readings';
  info: {
    description: 'About reading section';
    displayName: 'About Reading';
    icon: 'book';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.JSON & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutStyle extends Struct.ComponentSchema {
  collectionName: 'components_about_styles';
  info: {
    description: 'About style section';
    displayName: 'About Style';
    icon: 'book';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.JSON & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutTimeline extends Struct.ComponentSchema {
  collectionName: 'components_about_timelines';
  info: {
    description: 'About timeline section';
    displayName: 'About Timeline';
    icon: 'book';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    entries: Schema.Attribute.JSON & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_ctas';
  info: {
    description: 'Call to action block';
    displayName: 'CTA';
    icon: 'cursor';
  };
  attributes: {
    body: Schema.Attribute.Text;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksFaqSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_faq_sections';
  info: {
    description: 'FAQ section referencing FAQ items';
    displayName: 'FAQ Section';
    icon: 'question';
  };
  attributes: {
    items: Schema.Attribute.Relation<'oneToMany', 'api::faq-item.faq-item'>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    description: 'Page hero section';
    displayName: 'Hero';
    icon: 'picture';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images' | 'videos' | 'files'>;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    secondaryCta: Schema.Attribute.Component<'shared.link', false>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksMedia extends Struct.ComponentSchema {
  collectionName: 'components_blocks_media';
  info: {
    description: 'Media block with caption';
    displayName: 'Media';
    icon: 'landscape';
  };
  attributes: {
    alt: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images' | 'videos' | 'files' | 'audios'> &
      Schema.Attribute.Required;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    description: 'Rich text content block';
    displayName: 'Rich Text';
    icon: 'write';
  };
  attributes: {
    body: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface BlocksStats extends Struct.ComponentSchema {
  collectionName: 'components_blocks_stats';
  info: {
    description: 'Statistics row';
    displayName: 'Stats';
    icon: 'chartBubble';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.stat-item', true>;
  };
}

export interface CaseArchitecture extends Struct.ComponentSchema {
  collectionName: 'components_case_architectures';
  info: {
    description: 'Architecture narrative + node paths';
    displayName: 'Case Architecture';
    icon: 'diagram';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    deliveryPath: Schema.Attribute.JSON & Schema.Attribute.Required;
    intro: Schema.Attribute.Text & Schema.Attribute.Required;
    legend: Schema.Attribute.JSON;
    mobileNodes: Schema.Attribute.JSON;
    requestPath: Schema.Attribute.JSON & Schema.Attribute.Required;
    tabletDelivery: Schema.Attribute.JSON;
    tabletRequest: Schema.Attribute.JSON;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseDecision extends Struct.ComponentSchema {
  collectionName: 'components_case_decisions';
  info: {
    description: 'Decision matrix item';
    displayName: 'Case Decision';
    icon: 'cursor';
  };
  attributes: {
    choice: Schema.Attribute.Text & Schema.Attribute.Required;
    consequence: Schema.Attribute.Text & Schema.Attribute.Required;
    context: Schema.Attribute.Text & Schema.Attribute.Required;
    decisionId: Schema.Attribute.String & Schema.Attribute.Required;
    statement: Schema.Attribute.Text & Schema.Attribute.Required;
    statementMobile: Schema.Attribute.Text;
    statementTablet: Schema.Attribute.Text;
    tradeoff: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface CaseFigureSlot extends Struct.ComponentSchema {
  collectionName: 'components_case_figure_slots';
  info: {
    description: 'Named figure slot';
    displayName: 'Case Figure Slot';
    icon: 'picture';
  };
  attributes: {
    media: Schema.Attribute.Component<'publishing.media', false> &
      Schema.Attribute.Required;
    slot: Schema.Attribute.Enumeration<
      [
        'hero',
        'architecture',
        'implementationPrimary',
        'implementationUi',
        'implementationWorkflow',
        'implementationTablet',
        'implementationMobile',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface CaseOutcomes extends Struct.ComponentSchema {
  collectionName: 'components_case_outcomes';
  info: {
    description: 'Outcomes chapter';
    displayName: 'Case Outcomes';
    icon: 'trophy';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    intro: Schema.Attribute.Text & Schema.Attribute.Required;
    items: Schema.Attribute.JSON & Schema.Attribute.Required;
    note: Schema.Attribute.Text;
    summaryMobile: Schema.Attribute.Text;
    summaryTablet: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    titleMobile: Schema.Attribute.String;
  };
}

export interface CaseOverview extends Struct.ComponentSchema {
  collectionName: 'components_case_overviews';
  info: {
    description: 'Case overview columns';
    displayName: 'Case Overview';
    icon: 'book';
  };
  attributes: {
    bodyMobile: Schema.Attribute.Text;
    bodyTablet: Schema.Attribute.JSON;
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    columns: Schema.Attribute.JSON & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    titleMobile: Schema.Attribute.String;
  };
}

export interface CaseProseSection extends Struct.ComponentSchema {
  collectionName: 'components_case_prose_sections';
  info: {
    description: 'Problem / implementation prose';
    displayName: 'Case Prose Section';
    icon: 'write';
  };
  attributes: {
    bodyMobile: Schema.Attribute.Text;
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    intro: Schema.Attribute.Text;
    paragraphs: Schema.Attribute.JSON & Schema.Attribute.Required;
    paragraphsTablet: Schema.Attribute.JSON;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    titleMobile: Schema.Attribute.String;
  };
}

export interface CaseRowSection extends Struct.ComponentSchema {
  collectionName: 'components_case_row_sections';
  info: {
    description: 'Constraints / delivery / lessons';
    displayName: 'Case Row Section';
    icon: 'bulletList';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    rows: Schema.Attribute.JSON & Schema.Attribute.Required;
    summaryMobile: Schema.Attribute.Text;
    summaryTablet: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    titleMobile: Schema.Attribute.String;
  };
}

export interface HomeBridge extends Struct.ComponentSchema {
  collectionName: 'components_home_bridges';
  info: {
    description: 'About/contact/writing bridge copy';
    displayName: 'Home Bridge';
    icon: 'link';
  };
  attributes: {
    body: Schema.Attribute.Text;
    bodyCompact: Schema.Attribute.Text;
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    cta: Schema.Attribute.Component<'shared.link', false>;
    ctaLabel: Schema.Attribute.String;
    href: Schema.Attribute.String;
    meta: Schema.Attribute.String;
    summary: Schema.Attribute.Text;
    title: Schema.Attribute.String;
    workLink: Schema.Attribute.Component<'shared.link', false>;
  };
}

export interface HomeFeatured extends Struct.ComponentSchema {
  collectionName: 'components_home_featureds';
  info: {
    description: 'Featured proof copy';
    displayName: 'Home Featured';
    icon: 'star';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    cta: Schema.Attribute.Component<'shared.link', false> &
      Schema.Attribute.Required;
    figure: Schema.Attribute.Component<'publishing.media', false>;
    highlights: Schema.Attribute.JSON;
    highlightsLabel: Schema.Attribute.String;
    meta: Schema.Attribute.String;
    outcome: Schema.Attribute.Text & Schema.Attribute.Required;
    outcomeLabel: Schema.Attribute.String & Schema.Attribute.Required;
    problem: Schema.Attribute.Text & Schema.Attribute.Required;
    problemLabel: Schema.Attribute.String & Schema.Attribute.Required;
    status: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeHero extends Struct.ComponentSchema {
  collectionName: 'components_home_heroes';
  info: {
    description: 'Home hero copy + media';
    displayName: 'Home Hero';
    icon: 'picture';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    deck: Schema.Attribute.Text & Schema.Attribute.Required;
    media: Schema.Attribute.Component<'publishing.media', false>;
    mediaNote: Schema.Attribute.String;
    primaryCta: Schema.Attribute.Component<'shared.link', false> &
      Schema.Attribute.Required;
    secondaryCta: Schema.Attribute.Component<'shared.link', false> &
      Schema.Attribute.Required;
    title: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface HomePhilosophy extends Struct.ComponentSchema {
  collectionName: 'components_home_philosophies';
  info: {
    description: 'Philosophy quote + principles';
    displayName: 'Home Philosophy';
    icon: 'quote';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    diagramCaption: Schema.Attribute.String;
    principles: Schema.Attribute.JSON & Schema.Attribute.Required;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    stages: Schema.Attribute.JSON & Schema.Attribute.Required;
  };
}

export interface HomeSelectedItem extends Struct.ComponentSchema {
  collectionName: 'components_home_selected_items';
  info: {
    description: 'Selected-work slot';
    displayName: 'Home Selected Item';
    icon: 'bulletList';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<['feature', 'offset', 'band']> &
      Schema.Attribute.Required;
    outcome: Schema.Attribute.Text & Schema.Attribute.Required;
    project: Schema.Attribute.Relation<'oneToOne', 'api::project.project'> &
      Schema.Attribute.Required;
  };
}

export interface HomeWritingItem extends Struct.ComponentSchema {
  collectionName: 'components_home_writing_items';
  info: {
    description: 'Writing teaser selection';
    displayName: 'Home Writing Item';
    icon: 'file';
  };
  attributes: {
    article: Schema.Attribute.Relation<'oneToOne', 'api::article.article'> &
      Schema.Attribute.Required;
    note: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PublishingCallout extends Struct.ComponentSchema {
  collectionName: 'components_publishing_callouts';
  info: {
    description: 'Semantic callout';
    displayName: 'Callout';
    icon: 'alien';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    bodyCompact: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['tradeoff', 'note', 'warning']> &
      Schema.Attribute.Required;
  };
}

export interface PublishingCode extends Struct.ComponentSchema {
  collectionName: 'components_publishing_codes';
  info: {
    description: 'Code evidence';
    displayName: 'Code Block';
    icon: 'code';
  };
  attributes: {
    caption: Schema.Attribute.String;
    captionCompact: Schema.Attribute.String;
    code: Schema.Attribute.Text & Schema.Attribute.Required;
    language: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PublishingEvidence extends Struct.ComponentSchema {
  collectionName: 'components_publishing_evidences';
  info: {
    description: 'Engineering evidence';
    displayName: 'Evidence Block';
    icon: 'check';
  };
  attributes: {
    href: Schema.Attribute.String;
    hrefLabel: Schema.Attribute.String;
    kind: Schema.Attribute.Enumeration<
      [
        'ci',
        'deploy',
        'test',
        'coverage',
        'performance',
        'a11y',
        'repository',
        'documentation',
      ]
    > &
      Schema.Attribute.Required;
    meta: Schema.Attribute.Component<'publishing.meta-item', true> &
      Schema.Attribute.Required;
    status: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PublishingMedia extends Struct.ComponentSchema {
  collectionName: 'components_publishing_media';
  info: {
    description: 'CMS media with evidence classification';
    displayName: 'Publishing Media';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String & Schema.Attribute.Required;
    asset: Schema.Attribute.Media<'images'>;
    caption: Schema.Attribute.Text;
    captionShort: Schema.Attribute.String;
    composedKey: Schema.Attribute.Enumeration<
      [
        'architecture-diagram',
        'content-map-render',
        'rsc-request-path',
        'atlas-boundaries',
        'about-approach',
        'about-architecture',
        'home-philosophy',
      ]
    >;
    evidenceClass: Schema.Attribute.Enumeration<['production', 'composed']> &
      Schema.Attribute.Required;
    kind: Schema.Attribute.Enumeration<
      [
        'application-screenshot',
        'architecture-diagram',
        'workflow-diagram',
        'browser-capture',
        'figma-artifact',
        'ci-pipeline',
        'repository-structure',
        'terminal-output',
        'code-comparison',
      ]
    > &
      Schema.Attribute.Required;
    label: Schema.Attribute.String;
    sizes: Schema.Attribute.String;
  };
}

export interface PublishingMetaItem extends Struct.ComponentSchema {
  collectionName: 'components_publishing_meta_items';
  info: {
    description: 'Label \u00B7 value pair';
    displayName: 'Meta Item';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PublishingSection extends Struct.ComponentSchema {
  collectionName: 'components_publishing_sections';
  info: {
    description: 'Article/Doc chapter with optional primitives';
    displayName: 'Publishing Section';
    icon: 'layer';
  };
  attributes: {
    bodyMobile: Schema.Attribute.Text;
    callout: Schema.Attribute.Component<'publishing.callout', false>;
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    code: Schema.Attribute.Component<'publishing.code', false>;
    evidence: Schema.Attribute.Component<'publishing.evidence', false>;
    figure: Schema.Attribute.Component<'publishing.media', false>;
    paragraphs: Schema.Attribute.JSON & Schema.Attribute.Required;
    paragraphsTablet: Schema.Attribute.JSON;
    sectionId: Schema.Attribute.String & Schema.Attribute.Required;
    table: Schema.Attribute.Component<'publishing.table', false>;
    terminal: Schema.Attribute.Component<'publishing.terminal', false>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PublishingTable extends Struct.ComponentSchema {
  collectionName: 'components_publishing_tables';
  info: {
    description: 'Comparison matrix';
    displayName: 'Editorial Table';
    icon: 'grid';
  };
  attributes: {
    caption: Schema.Attribute.String;
    captionCompact: Schema.Attribute.String;
    columns: Schema.Attribute.JSON & Schema.Attribute.Required;
    rows: Schema.Attribute.JSON & Schema.Attribute.Required;
  };
}

export interface PublishingTerminal extends Struct.ComponentSchema {
  collectionName: 'components_publishing_terminals';
  info: {
    description: 'Terminal evidence';
    displayName: 'Terminal Block';
    icon: 'server';
  };
  attributes: {
    caption: Schema.Attribute.String;
    captionCompact: Schema.Attribute.String;
    lines: Schema.Attribute.JSON & Schema.Attribute.Required;
  };
}

export interface SharedContactInformation extends Struct.ComponentSchema {
  collectionName: 'components_shared_contact_informations';
  info: {
    description: 'Site contact details';
    displayName: 'Contact Information';
    icon: 'phone';
  };
  attributes: {
    addressLine1: Schema.Attribute.String;
    addressLine2: Schema.Attribute.String;
    city: Schema.Attribute.String;
    country: Schema.Attribute.String;
    email: Schema.Attribute.Email;
    phone: Schema.Attribute.String;
    postalCode: Schema.Attribute.String;
    region: Schema.Attribute.String;
  };
}

export interface SharedFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_features';
  info: {
    description: 'Service or product feature';
    displayName: 'Feature';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    description: 'Labeled hyperlink';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SharedNavigationItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_navigation_items';
  info: {
    description: 'Nav item with optional child links';
    displayName: 'Navigation Item';
    icon: 'bulletList';
  };
  attributes: {
    children: Schema.Attribute.Component<'shared.link', true>;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Shared SEO metadata';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogDescription: Schema.Attribute.Text;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String;
    structuredData: Schema.Attribute.JSON;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: 'Social platform link';
    displayName: 'Social Link';
    icon: 'twitter';
  };
  attributes: {
    label: Schema.Attribute.String;
    platform: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedStatItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_stat_items';
  info: {
    description: 'Single statistic for blocks.stats';
    displayName: 'Stat Item';
    icon: 'chartCircle';
  };
  attributes: {
    description: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface WorkFeaturedCopy extends Struct.ComponentSchema {
  collectionName: 'components_work_featured_copies';
  info: {
    description: 'Featured project editorial overlay';
    displayName: 'Work Featured Copy';
    icon: 'star';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    cta: Schema.Attribute.Component<'shared.link', false>;
    ctaNote: Schema.Attribute.String;
    figure: Schema.Attribute.Component<'publishing.media', false>;
    figureCompact: Schema.Attribute.Component<'publishing.media', false>;
    flagshipLabel: Schema.Attribute.String;
    role: Schema.Attribute.String;
    status: Schema.Attribute.String;
    summary: Schema.Attribute.Text;
    summaryMobile: Schema.Attribute.Text;
    themes: Schema.Attribute.JSON;
    themesCompact: Schema.Attribute.String;
    themesLabel: Schema.Attribute.String;
    timeframe: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface WorkIntro extends Struct.ComponentSchema {
  collectionName: 'components_work_intros';
  info: {
    description: 'Work index intro';
    displayName: 'Work Intro';
    icon: 'book';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    deck: Schema.Attribute.Text & Schema.Attribute.Required;
    deckMobile: Schema.Attribute.Text;
    editorialNoteBody: Schema.Attribute.Text;
    editorialNoteLabel: Schema.Attribute.String;
    meta: Schema.Attribute.Component<'publishing.meta-item', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface WorkTaxonomy extends Struct.ComponentSchema {
  collectionName: 'components_work_taxonomies';
  info: {
    description: 'Taxonomy band copy';
    displayName: 'Work Taxonomy';
    icon: 'layer';
  };
  attributes: {
    chapter: Schema.Attribute.String & Schema.Attribute.Required;
    deck: Schema.Attribute.Text & Schema.Attribute.Required;
    groups: Schema.Attribute.JSON;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'about.approach': AboutApproach;
      'about.architecture': AboutArchitecture;
      'about.focus': AboutFocus;
      'about.notes': AboutNotes;
      'about.opening': AboutOpening;
      'about.philosophy': AboutPhilosophy;
      'about.principles': AboutPrinciples;
      'about.reading': AboutReading;
      'about.style': AboutStyle;
      'about.timeline': AboutTimeline;
      'blocks.cta': BlocksCta;
      'blocks.faq-section': BlocksFaqSection;
      'blocks.hero': BlocksHero;
      'blocks.media': BlocksMedia;
      'blocks.rich-text': BlocksRichText;
      'blocks.stats': BlocksStats;
      'case.architecture': CaseArchitecture;
      'case.decision': CaseDecision;
      'case.figure-slot': CaseFigureSlot;
      'case.outcomes': CaseOutcomes;
      'case.overview': CaseOverview;
      'case.prose-section': CaseProseSection;
      'case.row-section': CaseRowSection;
      'home.bridge': HomeBridge;
      'home.featured': HomeFeatured;
      'home.hero': HomeHero;
      'home.philosophy': HomePhilosophy;
      'home.selected-item': HomeSelectedItem;
      'home.writing-item': HomeWritingItem;
      'publishing.callout': PublishingCallout;
      'publishing.code': PublishingCode;
      'publishing.evidence': PublishingEvidence;
      'publishing.media': PublishingMedia;
      'publishing.meta-item': PublishingMetaItem;
      'publishing.section': PublishingSection;
      'publishing.table': PublishingTable;
      'publishing.terminal': PublishingTerminal;
      'shared.contact-information': SharedContactInformation;
      'shared.feature': SharedFeature;
      'shared.link': SharedLink;
      'shared.navigation-item': SharedNavigationItem;
      'shared.seo': SharedSeo;
      'shared.social-link': SharedSocialLink;
      'shared.stat-item': SharedStatItem;
      'work.featured-copy': WorkFeaturedCopy;
      'work.intro': WorkIntro;
      'work.taxonomy': WorkTaxonomy;
    }
  }
}
