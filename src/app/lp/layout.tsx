import type { Metadata } from "next";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "AI Universa — Brezplačna 3-dnevna LIVE delavnica",
  description:
    "Pridruži se brezplačni 3-dnevni delavnici in odkrij, kako zaslužiti z umetno inteligenco v 2026. 15.–17. april ob 19:00.",
  openGraph: {
    title: "AI Universa — Brezplačna 3-dnevna LIVE delavnica",
    description:
      "Odkrij, kako navadni Slovenci ustvarjajo €1.000+ mesečno z umetno inteligenco. 15.–17. april 2026.",
    type: "website",
  },
};

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#0a0a14",
        minHeight: "100vh",
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <MetaPixel />
      {children}
    </div>
  );
}
