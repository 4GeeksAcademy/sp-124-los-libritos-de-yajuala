import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="d-flex">
      <input
        className="form-control"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe un mensaje..."
      />
      <button className="btn btn-primary ms-2" onClick={send}>
        Enviar
      </button>
    </div>
  );
}
