import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function ConversationList({ conversations, onSelect, onRefresh }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const createConversation = async () => {
    const res = await fetch(`${backendUrl}/api/users/${store.user.id}/conversations`, {
      method: "POST"
    });
    const data = await res.json();
    onRefresh();
    onSelect(data);
  };

  return (
    <div className="p-3">
      <h5>Conversaciones</h5>

      <button className="btn btn-primary w-100 mb-3" onClick={createConversation}>
        Nueva conversación
      </button>

      <ul className="list-group">
        {conversations.map(conv => (
          <li
            key={conv.id}
            className="list-group-item list-group-item-action"
            onClick={() => onSelect(conv)}
            style={{ cursor: "pointer" }}
          >
            {conv.title || "Sin título"}
            <br />
            <small className="text-muted">{conv.created_at}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
