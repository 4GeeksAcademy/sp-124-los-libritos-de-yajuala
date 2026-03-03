import { useEffect, useState } from "react";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInput from "./ChatInput";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function ChatWindow({ conversation }) {
  const { store } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [messages, setMessages] = useState([]);

  const loadMessages = () => {
    fetch(`${backendUrl}/api/conversations/${conversation.id}`, {
      headers: {
        Authorization: `Bearer ${store.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const safeMessages = Array.isArray(data.messages) ? data.messages : [];
        setMessages(safeMessages);
      })
      .catch(err => console.error("ERROR FETCHING MESSAGES:", err));
  };

  useEffect(() => {
    loadMessages();
  }, [conversation]);

  const sendMessage = async (text) => {
    const res = await fetch(`${backendUrl}/api/conversations/${conversation.id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`
      },
      body: JSON.stringify({ content: text })
    });

    if (!res.ok) {
      console.error("ERROR ENVIANDO MENSAJE:", res.status);
      return;
    }

    const data = await res.json();
    setMessages(prev => [...prev, data.user_message, data.bot_message]);
  };

  const solicitarImportacion = async (payload) => {
    try {
      const res = await fetch(`${backendUrl}/api/proveedores/notificaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      alert("Solicitud enviada a proveedores");
    } catch (err) {
      console.error("Error solicitando importación:", err);
      alert("Error al enviar la solicitud");
    }
  };

  return (
    <div className="d-flex flex-column h-100 p-3">
      <div className="flex-grow-1 overflow-auto mb-3">

        {Array.isArray(messages) && messages.map(msg => {
          if (!msg) return null;

          let content = msg.content;
          let parsed = null;

          if (msg.sender === "bot") {
            try {
              parsed = JSON.parse(msg.content);
            } catch (e) {
              parsed = null;
            }
          }

          return (
            <div key={msg.id} className="mb-3">

              {!parsed && (
                <div
                  className={`p-3 rounded mb-2 ${msg.sender === "bot"
                      ? "bg-light border text-dark"
                      : "bg-primary text-white"
                    }`}
                  style={{ maxWidth: "75%" }}
                >
                  {msg.content}
                </div>
              )}



              {parsed && (
                <div className="p-3 rounded bg-light border">
                  <p className="mb-2">{parsed.respuesta}</p>

                  {parsed.acciones?.map((accion, i) => (
                    <button
                      key={i}
                      className="btn btn-primary btn-sm mt-2"
                      onClick={() => solicitarImportacion(accion.payload)}
                    >
                      {accion.label}
                    </button>
                  ))}
                </div>
              )}

            </div>
          );
        })}

      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
}
