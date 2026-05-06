import "./globals.css";

export const metadata = {
  title: "Diagnose — Why didn't they call you back?",
  description: "An honest career diagnosis tool for Tier-2 engineering students. Built for the AIC × Anthropic Claude Hackathon.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
