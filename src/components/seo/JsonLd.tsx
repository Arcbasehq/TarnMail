// Renders a JSON-LD <script> for structured data (rich results in search).
// Safe: we serialize a plain object we control, not user input.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://tarnmail.xyz";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TarnMail",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    "A privacy-first unified email client for Gmail, Outlook and Yahoo.",
  email: "info@libresearch.ca",
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TarnMail",
  url: siteUrl,
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TarnMail",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "Connect Gmail, Outlook and Yahoo and read all your mail from one encrypted client. No ad profiling, no content mining, no selling your data.",
  offers: [
    { "@type": "Offer", name: "Tarn", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Deep", price: "5", priceCurrency: "USD" },
    { "@type": "Offer", name: "Fathom", price: "12", priceCurrency: "USD" },
  ],
};

export function faqSchema(faqs: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
