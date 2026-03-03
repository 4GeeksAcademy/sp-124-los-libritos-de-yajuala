export default function ChatMessageBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`d-flex mb-2 ${isUser ? "justify-content-end" : "justify-content-start"}`}>
      <div
        className={`p-2 rounded ${isUser ? "bg-primary text-white" : "bg-light border"}`}
        style={{ maxWidth: "70%" }}
      >
        {message.content}
      </div>
    </div>
  );
}
