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

    const botMessage = {
      ...data.bot_message,
      parsed: data.bot_data
    };

    setMessages(prev => [...prev, data.user_message, botMessage]);

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

      await res.json();
      alert("Solicitud enviada a proveedores");
    } catch (err) {
      console.error("Error solicitando importación:", err);
      alert("Error al enviar la solicitud");
    }
  };

  return (
    <div className="d-flex flex-column h-100 p-3">

      <div className="flex-grow-1 overflow-auto mb-3 d-flex flex-column gap-3">

        {messages.map(msg => {
          if (!msg) return null;

          const parsed = msg.parsed || null;

          const isBot = msg.sender === "bot";

          return (
            <div
              key={msg.id}
              className={`d-flex ${isBot ? "justify-content-start" : "justify-content-end"}`}
            >
              <div
                className={`p-3 rounded shadow-sm ${isBot
                    ? "bg-light border text-dark"
                    : "bg-primary text-white"
                  }`}
                style={{ maxWidth: "75%" }}
              >
                <p className="mb-2">
                  {parsed ? parsed.respuesta : msg.content}
                </p>

                {parsed?.acciones?.map((accion, i) => (
                  <button
                    key={i}
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={() => solicitarImportacion(accion.payload)}
                  >
                    {accion.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
}
