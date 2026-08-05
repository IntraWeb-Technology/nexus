import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { resolveHeaderNavLinks } from "@/lib/strapi-content";

export default async function SiteChromeLayout({ children }: { children: React.ReactNode }) {
  const links = await resolveHeaderNavLinks();

  return (
    <>
      <NavBar links={links} />
      {children}
      <Footer links={links} />
    </>
  );
}
