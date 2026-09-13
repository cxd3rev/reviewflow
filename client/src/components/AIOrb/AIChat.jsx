import { useEffect, useRef } from "react";

export default function AIChat({
  t,
  messages,
  input,
  onInput,
  onSend,
  onClose,
  thinking,
  offline,
}) {
  const listRef = useRef(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    fieldRef.current?.focus();
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, thinking]);

  function submit(event) {
    event.preventDefault();
    onSend();
  }

  return (
    <section className="ai-orb-panel" role="dialog" aria-label={t("orb.open")} aria-modal="false">
      <header className="ai-orb-panel-head">
        <div>
          <p className="ai-orb-panel-kicker">{t("orb.name")}</p>
          <p className="ai-orb-panel-title">{t("orb.ask")}</p>
        </div>
        <button type="button" className="ai-orb-icon-btn" onClick={onClose} aria-label={t("orb.minimize")}>
          <span aria-hidden="true">–</span>
        </button>
      </header>

      <div ref={listRef} className="ai-orb-messages" aria-live="polite">
        {messages.length === 0 && !thinking ? <p className="ai-orb-empty">{t("orb.empty")}</p> : null}
        {messages.map((item) => (
          <div key={item.id} className={`ai-orb-msg is-${item.role}`}>
            {item.text}
          </div>
        ))}
        {thinking ? <div className="ai-orb-msg is-assistant is-thinking">{t("orb.thinking")}</div> : null}
      </div>

      {offline ? <p className="ai-orb-offline">{t("orb.offline")}</p> : null}

      <form className="ai-orb-composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="ai-orb-input">
          {t("orb.placeholder")}
        </label>
        <input
          ref={fieldRef}
          id="ai-orb-input"
          className="ai-orb-input"
          value={input}
          onChange={(event) => onInput(event.target.value)}
          placeholder={t("orb.placeholder")}
          maxLength={500}
          autoComplete="off"
        />
        <button type="submit" className="ai-orb-send" disabled={!input.trim() || thinking}>
          {t("orb.send")}
        </button>
      </form>
    </section>
  );
}
