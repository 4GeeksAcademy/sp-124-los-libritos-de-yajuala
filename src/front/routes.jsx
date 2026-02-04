// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Provider from "./pages/proveedores/Provider";
import AddProvider from "./pages/proveedores/AddProvider";
import ViewProvider from "./pages/proveedores/ViewProvider";
import ClientsPage from "./pages/clients/ClientsPage";
import ClientDetailPage from "./pages/clients/ClientDetailPage";
import AddNewClient from "./pages/clients/AddNewClient";
import EditClientPage from "./pages/clients/EditClientPage";

import { Books } from "./pages/Books/Books";
import { BookCreate } from "./pages/Books/BookCreate";
import { BookDetail } from "./pages/Books/BookDetail";
import { BookEdit } from "./pages/Books/BookEdit";

import CartsPage from "./pages/Carts/CartsPage";
import AddCartPage from "./pages/Carts/AddCartPage";
import CartDetailPage from "./pages/Carts/CartDetailPage";
import EditCartPage from "./pages/Carts/EditCartPage";
import AddBookToCartPage from "./pages/Carts/AddBookToCartPage";
import EditCartBookPage from "./pages/Carts/EditCartBookPage";


export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="/demo" element={<Demo />} />
      <Route path="/provider" element={<Provider />} />
      <Route path="/provider/:providerId" element={<AddProvider />} />
      <Route path="/providers/new" element={<AddProvider />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/clients/:id" element={<ClientDetailPage />} />
      <Route path="/clients/create" element={<AddNewClient />} />
      <Route path="/clients/:id/edit" element={<EditClientPage />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/provider/view/:providerId" element={<ViewProvider />} />

      <Route path="books" element={<Books />} />
      <Route path="books/new" element={<BookCreate />} />
      <Route path="books/:id" element={<BookDetail />} />
      <Route path="books/:id/edit" element={<BookEdit />} />

      <Route path="carts" element={<CartsPage />} />
      <Route path="carts/create" element={<AddCartPage />} />
      <Route path="carts/:id" element={<CartDetailPage />} />
      <Route path="carts/:id/edit" element={<EditCartPage />} />
      <Route path="carts/:id/add-book" element={<AddBookToCartPage />} />
      <Route path="cart-books/:id/edit" element={<EditCartBookPage />} />

    </Route>
  )
);