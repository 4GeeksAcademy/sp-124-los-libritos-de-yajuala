import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();

  const isClientsPage = location.pathname.startsWith("/clients");

  return (
   <></>
  );
};
