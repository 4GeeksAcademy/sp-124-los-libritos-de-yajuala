import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";

export default function ChatPage() {
  const { store } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  const loadConversations = () => {
    fetch(`${backendUrl}/api/users/${store.user.id}/conversations`, {
      headers: {
        Authorization: `Bearer ${store.token}`
      }
    })
      .then(res => res.json())
      .then(data => setConversations(data))
      .catch(err => console.error("ERROR FETCHING CONVERSATIONS:", err));
  };

  useEffect(() => {
    if (!store.user) return; // ← evita fetch antes de tiempo
    loadConversations();
  }, [store.user]);

  return (
    <div className="container-fluid" style={{ height: "90vh" }}>
      <div className="row h-100">
        <div className="col-3 border-end">
          <ConversationList
            conversations={conversations}
            onSelect={setActiveConversation}
            onRefresh={loadConversations}
          />
        </div>

        <div className="col-9">
          {activeConversation ? (
            <ChatWindow conversation={activeConversation} />
          ) : (
            <p className="text-muted mt-4">Selecciona una conversación</p>
          )}
        </div>
      </div>
    </div>
  );
}
