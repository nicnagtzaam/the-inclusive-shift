// Section 17 — Calendly stays fully responsible for booking. This page just
// provides a polished wrapper and embeds Calendly; no booking data is stored
// in this application.

export default function BookPage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/theinclusiveshift";

  return (
    <main>
      <h1>Book a session</h1>
      <div
        className="calendly-inline-widget"
        data-url={calendlyUrl}
        style={{ minWidth: "320px", height: "700px" }}
      />
      <script src="https://assets.calendly.com/assets/external/widget.js" async />
    </main>
  );
}
