export const initialStore = () => {
  return {
    message: null,
    todos: [],
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    // CCambiado añadimos activeCart 
    activeCart: null
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

    // Cambiado para soportar ambos action types 
    case "SET_ACTIVE_CART":
    case "set_active_cart":
      return {
        ...store,
        activeCart: action.payload
      };

    // Cambiado para no romper la app si llega una action desconocida
    default:
      console.warn("Unknown action:", action);
      return store;
  }
}
