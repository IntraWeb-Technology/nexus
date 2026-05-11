const CARDS = [
  {
    title: "Workflow automation",
    body: "Triggered systems that move work forward without manual handoffs.",
  },
  {
    title: "AI-native infrastructure",
    body: "AI systems designed into your operational environment from the start.",
  },
  {
    title: "Reporting systems",
    body: "Operational reporting that pulls from where work actually happens.",
  },
  {
    title: "Client platforms",
    body: "Custom portals that give clients visibility and control without manual updates.",
  },
  {
    title: "CRM and sales ops",
    body: "CRM infrastructure connected to fulfillment, delivery, and revenue recognition.",
  },
  {
    title: "System integrations",
    body: "Connections between tools that were never designed to work together.",
  },
] as const;

export function SystemTypeCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {CARDS.map((card) => (
        <article key={card.title} className="about-card about-card--system flex min-h-[132px] flex-col p-5 md:min-h-[140px] md:p-6">
          <h3 className="text-[16px] font-semibold leading-snug tracking-[-0.02em] text-[color:var(--about-text)] md:text-[17px]">
            {card.title}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--about-text-secondary)] md:text-[15px]">{card.body}</p>
        </article>
      ))}
    </div>
  );
}
