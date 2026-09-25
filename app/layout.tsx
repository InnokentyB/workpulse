import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkPulse — Move more. Interrupt less.",
  description:
    "A contextual workplace wellbeing agent that finds the least disruptive moment to get you moving.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <template
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: A workday signal desk makes one clear GO or HOLD call; it refuses the generic reminder dashboard.
OWN-WORLD: Warm paper, ink-green signal surfaces, lime action cues, warm-brown hold states, ruled dividers, and measured status typography.
STORY: Compare two work contexts, ask whether now is useful, understand the reason, then complete one tiny activity or continue working.
FIRST VIEWPORT: Compact product header and premise lead directly to a two-option scenario control, three context metrics, and one dominant decision action; mobile compresses scenario choice to keep context and action close.
FORM: Workday signal desk, grounded direction 3 of 7, concept seed 130ef994; code-led execution.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
