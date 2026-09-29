import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Inclusive Shift",
  description:
    "Conversations changing how we think about inclusion, neurodiversity, leadership and what it means to create a more human world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
