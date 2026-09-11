import { useState } from "react";
import { faqs } from "./data.js";

export function Faq() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="display text-center text-3xl font-semibold tracking-tight md:text-5xl">Questions, answered</h2>
        <p className="mt-4 text-center text-lg text-muted">Short answers so you can get set up quickly.</p>
        <div className="mt-12 divide-y divide-edge overflow-hidden rounded-2xl border border-edge bg-white">
          {faqs.map((item, index) => (
            <div key={item.q} className="px-5">
              <button
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold md:text-lg"
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                {item.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-sm text-muted">
                  {openFaq === index ? "–" : "+"}
                </span>
              </button>
              {openFaq === index && <p className="pb-5 leading-7 text-muted">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
