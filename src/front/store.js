export const initialStore = () => {
  return {
    message: null,
    todos: [],
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null
  };
};


export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return { ...store, message: action.payload };

    case "add_task":
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        )
      };

    case "set_user":
      localStorage.setItem("user", JSON.stringify(action.payload));
      return {
        ...store,
        user: action.payload
      };

    case "set_token":
      localStorage.setItem("token", action.payload);
      return {
        ...store,
        token: action.payload
      };

    case "set_active_cart":
      return {
        ...store,
        activeCart: action.payload
      };

    default:
      throw Error("Unknown action.");
  }
}
