import { useContext, useReducer, createContext, useEffect } from "react";
import storeReducer, { initialStore } from "../store.js";

const StoreContext = createContext();

export function StoreProvider({ children }) {
    const [store, dispatch] = useReducer(storeReducer, initialStore());

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            dispatch({ type: "set_token", payload: token });
        }
    }, []);

    useEffect(() => {
        if (store.cart) {
            localStorage.setItem("cart", JSON.stringify(store.cart));
        }
    }, [store.cart]);

    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
}

export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext);

    const actions = {
        setUser: (user) => {
            dispatch({
                type: "set_user",
                payload: user
            });
        },

        setToken: (token) => {
            dispatch({
                type: "set_token",
                payload: token
            });
        },

        logout: () => {
            localStorage.removeItem("token");
            dispatch({ type: "set_user", payload: null });
            dispatch({ type: "set_token", payload: null });
        },

        validateToken: async (token) => {
            try {
                const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/validate`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    }
                });

                if (!resp.ok) {
                    console.error("Token inválido");
                    return;
                }

                const data = await resp.json();

                actions.setUser(data.user);
                actions.setToken(token);

            } catch (error) {
                console.error("Error validando token:", error);
                return;
            }
        },

        addToCart: (book) => {
            dispatch({
                type: "add_to_cart",
                payload: book
            });
        },

        removeFromCart: (id) => {
            dispatch({
                type: "remove_from_cart",
                payload: id
            });
        },

        updateCartQty: (id, cantidad) => {
            dispatch({
                type: "update_cart_qty",
                payload: { id, cantidad }
            });
        },

        clearCart: () => {
            dispatch({ type: "clear_cart" });
        }
    };

    return { dispatch, store, actions };
}
