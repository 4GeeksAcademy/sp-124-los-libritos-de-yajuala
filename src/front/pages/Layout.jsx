import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useEffect, useState } from "react";

// Layout base: mantiene el sidebar, el footer y el scroll to top en todas las páginas
export const Layout = () => {
    const { store, actions } = useGlobalReducer();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (!store.user) setCollapsed(false);
    }, [store.user]);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        console.log("TOKEN EN LAYOUT:", savedToken);
        if (savedToken) {
            actions.validateToken(savedToken);
        }
    }, []);
    useEffect(() => {
        const handler = (e) => setCollapsed(e.detail.collapsed);
        window.addEventListener("bk-sidebar-toggle", handler);
        return () => window.removeEventListener("bk-sidebar-toggle", handler);
    }, []);

    return (
        <ScrollToTop>

            <Navbar onToggle={(v) => setCollapsed(v)} />
            <div className={`bk-layout${collapsed ? " collapsed" : ""}${!store.user ? " no-sidebar" : ""}`}>
                <div className="bk-layout-main">
                    <Outlet />
                    <Footer />
                </div>
            </div>
        </ScrollToTop>
    );
};
