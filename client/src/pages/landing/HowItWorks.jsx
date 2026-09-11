export function HowItWorks() {
  return (
    <section id="how" className="border-t border-edge bg-paper py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-600">How it works</p>
        <h2 className="display mx-auto mt-3 max-w-3xl text-center text-3xl font-semibold tracking-tight md:text-5xl">
          Set up once. Reviews run themselves.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          Four steps. Nothing extra to install on the job site.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {[
            ["1", "Add your review link", "Paste your Google review URL — or any other review page."],
            ["2", "Add the customer & job", "Keep a simple list of who you worked for and what you did."],
            ["3", "Mark the job completed", "ReviewFlow waits your chosen delay, then sends the email."],
            ["4", "They tap Leave a Review", "The button opens your review page. You see sent vs waiting."],
          ].map((item) => (
            <div key={item[0]} className="rounded-2xl border border-edge bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {item[0]}
              </div>
              <h3 className="text-base font-semibold">{item[1]}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item[2]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
