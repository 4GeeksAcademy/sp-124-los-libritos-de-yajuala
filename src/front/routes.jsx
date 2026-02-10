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

import { Delivery } from "./pages/Delivery/DeliveryList.jsx";
import { DeliveryCreate } from "./pages/Delivery/DeliveryCreate.jsx";
import { DeliveryDetail } from "./pages/Delivery/DeliveryDetail.jsx";
import { DeliveryEdit } from "./pages/Delivery/DeliveryEdit.jsx";

import { Reviews } from "./pages/Reviews/Reviews.jsx";
import { ReviewCreate } from "./pages/Reviews/ReviewCreate.jsx";
import { ReviewDetail } from "./pages/Reviews/ReviewDetail.jsx";
import { ReviewEdit } from "./pages/Reviews/ReviewEdit.jsx";

import Categorias from "./pages/categorias/Categorias";
import AddCategorias from "./pages/categorias/AddCategorias";
import ViewCategorias from "./pages/categorias/ViewCategorias";

import CategoriaLibro from "./pages/categorialibro/CategoriaLibro";
import AddCategoriaLibro from "./pages/categorialibro/AddCategoriaLibro";
import ViewCategoriaLibro from "./pages/categorialibro/ViewCategoriaLibro";
import EditCategoriaLibro from "./pages/categorialibro/EditCategoriaLibro";

import LoginPage from "./pages/loginClientes/LoginPage.jsx";
import LoggedClientPage from "./pages/loginClientes/LoggedClientPage.jsx";
import LoggedCartClientPage from "./pages/loginClientes/LoggedCartClientPage.jsx";
import LoginDelivery from "./pages/loginDelivery/LoginDelivery.jsx";
import LoggedDelivery from "./pages/loginDelivery/LoggedDelivery.jsx";


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

      <Route path="delivery" element={<Delivery />} />
      <Route path="delivery/new" element={<DeliveryCreate />} />
      <Route path="delivery/:id" element={<DeliveryDetail />} />
      <Route path="delivery/:id/edit" element={<DeliveryEdit />} />

      <Route path="reviews" element={<Reviews />} />
      <Route path="reviews/new" element={<ReviewCreate />} />
      <Route path="reviews/:id" element={<ReviewDetail />} />
      <Route path="reviews/:id/edit" element={<ReviewEdit />} />

      <Route path="/categorias" element={<Categorias />} />
      <Route path="/categorias/new" element={<AddCategorias />} />
      <Route path="/categorias/view/:categoriaId" element={<ViewCategorias />} />

      <Route path="/categorialibro" element={<CategoriaLibro />} />
      <Route path="/categorialibro/new" element={<AddCategoriaLibro />} />
      <Route path="/categorialibro/view/:categoriaId/:libroId" element={<ViewCategoriaLibro />} />
      <Route path="/categorialibro/edit/:categoriaId/:libroId" element={<EditCategoriaLibro />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/user" element={<LoggedClientPage />} />
      <Route path="/user/cart" element={<LoggedCartClientPage />} />

      <Route path="/logindelivery" element={<LoginDelivery />} />
      <Route path="/loggeddelivery" element={<LoggedDelivery />} />


    </Route>
  )
);