import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useEffect } from "react";
import ChatBotButton from "../components/chat/ChatBotButton";


// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    const { actions } = useGlobalReducer();
    const { store } = useGlobalReducer();
    const location = useLocation();
-


    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        console.log("TOKEN EN LAYOUT:", savedToken);

        if (savedToken) {
            actions.validateToken(savedToken);
        }
    }, []);

    const isChatPage = location.pathname === "/chat" || location.pathname === "/chat/";

    return (
        <ScrollToTop>
            <Navbar />
            <Outlet />
            {store.user &&
                store.user.role === "client" &&
                !isChatPage && (   // ← aquí ocultamos el botón en /chat
                    <ChatBotButton />
                )}
            <Footer />
        </ScrollToTop>
    )
}