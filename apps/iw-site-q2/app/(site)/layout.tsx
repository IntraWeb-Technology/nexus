import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";

export default function SiteChromeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
