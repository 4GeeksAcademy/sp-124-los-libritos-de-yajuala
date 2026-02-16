export const initialStore = () => {
  return {
    message: null,
    todos: [],
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,

    cart: JSON.parse(localStorage.getItem("cart")) || []
    // CCambiado por layla añadimos activeCart 
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

    case "add_to_cart": {
      const book = action.payload;
      const exists = store.cart.find(item => item.id === book.id);

      if (exists) {
        return {
          ...store,
          cart: store.cart.map(item =>
            item.id === book.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        };
      }

      return {
        ...store,
        cart: [...store.cart, { ...book, cantidad: 1 }]
      };
    }

    case "remove_from_cart":
      return {
        ...store,
        cart: store.cart.filter(item => item.id !== action.payload)
      };

    case "update_cart_qty":
      return {
        ...store,
        cart: store.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        )
      };

    case "clear_cart":
      return {
        ...store,
        cart: []
      };

    case "set_active_cart":
      return {
        ...store,
        activeCart: action.payload
      };

    // Cambiado por layla para no romper la app si llega una action desconocida
    default:
      console.warn("Unknown action:", action);
      return store;
  }
}
