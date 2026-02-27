import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useEffect, useState } from "react";
import ChatBotButton from "../components/chat/ChatBotButton";

// Layout base: mantiene el sidebar, el footer y el scroll to top en todas las páginas
export const Layout = () => {
    const { actions } = useGlobalReducer();
    const { store } = useGlobalReducer();
    const location = useLocation();
-


    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        console.log("TOKEN EN LAYOUT:", savedToken);

    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        console.log("TOKEN EN LAYOUT:", savedToken);
        if (savedToken) {
            actions.validateToken(savedToken);
        }
    }, []);

    const isChatPage = location.pathname === "/chat" || location.pathname === "/chat/";
  
  useEffect(() => {
        const handler = (e) => setCollapsed(e.detail.collapsed);
        window.addEventListener("bk-sidebar-toggle", handler);
        return () => window.removeEventListener("bk-sidebar-toggle", handler);
    }, []);

    return (
        <ScrollToTop>
      <div className={`bk-layout${collapsed ? " collapsed" : ""}`}>
            <Navbar onToggle={(v) => setCollapsed(v)} />
            <div className="bk-layout-main">
            <Outlet />
            {store.user &&
                store.user.role === "client" &&
                !isChatPage && (   // ← aquí ocultamos el botón en /chat
                    <ChatBotButton />
                )}
            <Footer />
             </div>

            </div>
        </ScrollToTop>
    );
};
