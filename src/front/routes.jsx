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
import LoggedActiveCartClientPage from "./pages/loginClientes/LoggedActiveCartClientPage.jsx";

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

import LoginProviderPage from "./pages/loginProveedor/LoginProviderPage.jsx";
import LoggedProveedorPage from "./pages/loginProveedor/LoggedProveedorPage.jsx";

import LoginAdminPage from "./pages/loginAdmin/LoginAdminPage.jsx";
import LoggedAdminPage from "./pages/loginAdmin/LoggedAdminPage.jsx";

import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AdminRoute } from "./components/AdminRoute.jsx";

import { ProviderBooks } from "./pages/Books/ProviderBooks.jsx";
import { ProviderBookCreate } from "./pages/Books/ProviderBookCreate.jsx";
import { ProviderBookDetail } from "./pages/Books/ProviderBookDetail.jsx";
import { ProviderBookEdit } from "./pages/Books/ProviderBookEdit.jsx";
import { ProviderOrders } from "./pages/proveedores/ProviderOrders.jsx";

import HomeClients from "./pages/homeClients/HomeClients.jsx";
import Swipe from "./pages/Swipe.jsx";
import PaymentSuccessPage from "./pages/Carts/PaymentSuccessPage.jsx";
import CheckoutAddressPage from "./pages/Carts/CheckoutAddressPage.jsx";
import CheckoutPaymentPage from "./pages/Carts/CheckoutPaymentPage.jsx";
import AddressesPage from "./pages/clients/address/AddressesPage.jsx";
import CreateAddressPage from "./pages/clients/address/CreateAddressPage.jsx";
import EditAddressPage from "./pages/clients/address/EditAddressPage.jsx";
import CheckoutPaymentMethodPage from "./pages/Carts/CheckoutPaymentMethodPage.jsx";
import CheckoutGooglePayPage from "./pages/Carts/CheckoutGooglePayPage.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminUsersList from "./pages/admin/users/AdminUsersList.jsx";
import AdminUserCreate from "./pages/admin/users/AdminUserCreate.jsx";
import AdminUserDetail from "./pages/admin/users/AdminUserDetail.jsx";
import AdminUserEdit from "./pages/admin/users/AdminUserEdit.jsx";
import AdminProvidersList from "./pages/admin/providers/AdminProvidersList.jsx";
import AdminProviderCreate from "./pages/admin/providers/AdminProviderCreate.jsx";
import AdminProviderDetail from "./pages/admin/providers/AdminProviderDetail.jsx";
import AdminProviderEdit from "./pages/admin/providers/AdminProviderEdit.jsx";
import AdminBooksList from "./pages/admin/books/AdminBooksList.jsx";
import AdminBookCreate from "./pages/admin/books/AdminBookCreate.jsx";
import AdminBookDetail from "./pages/admin/books/AdminBookDetail.jsx";
import AdminBookEdit from "./pages/admin/books/AdminBookEdit.jsx";
import AdminCategoriesList from "./pages/admin/categories/AdminCategoriesList.jsx";
import AdminCategoryCreate from "./pages/admin/categories/AdminCategoryCreate.jsx";
import AdminCategoryDetail from "./pages/admin/categories/AdminCategoryDetail.jsx";
import AdminCategoryEdit from "./pages/admin/categories/AdminCategoryEdit.jsx";
import AdminCartsList from "./pages/admin/carts/AdminCartsList.jsx";
import AdminCartCreate from "./pages/admin/carts/AdminCartCreate.jsx";
import AdminCartsAbandoned from "./pages/admin/carts/AdminCartsAbandoned.jsx";
import AdminCartDetail from "./pages/admin/carts/AdminCartDetail.jsx";
import AdminDeliveryList from "./pages/admin/delivery/AdminDeliveryList.jsx";
import AdminDeliveryCreate from "./pages/admin/delivery/AdminDeliveryCreate.jsx";
import AdminDeliveryDetail from "./pages/admin/delivery/AdminDeliveryDetail.jsx";
import AdminDeliveryEdit from "./pages/admin/delivery/AdminDeliveryEdit.jsx";
import AdminReviewList from "./pages/admin/reviews/AdminReviewList.jsx";
import AdminReviewDetail from "./pages/admin/reviews/AdminReviewDetail.jsx";
import AdminCartEdit from "./pages/admin/carts/AdminCartEdit.jsx";
import ProviderBookSearch from "./components/ProviderBookSearch.jsx";
import AdminRepartidoresPendientes from "./components/AdminRepartidoresPendientes.jsx";

import FavoriteCategoriesPage from "./pages/categorias/FavoriteCategoriesPage.jsx";
import SelectCategoriesPage from "./pages/categorias/SelectCategoriesPage.jsx";
import ChatPage from "./components/chat/ChatPage.jsx";
import ProviderNotifications from "./pages/proveedores/ProviderNotifications.jsx";
import ProviderLayout from "./pages/proveedores/ProviderLayout.jsx";

export const router = createBrowserRouter(
        createRoutesFromElements(
                <>
                        
                        <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
                                <Route index element={<Home />} />
                                <Route path="single/:theId" element={<Single />} />
                                <Route path="demo" element={<Demo />} />
                                <Route path="/swipe" element={<ProtectedRoute><Swipe /></ProtectedRoute>} />

                                {/* Proveedores */}
                                <Route path="provider" element={<AdminRoute><Provider /></AdminRoute>} />
                                <Route path="provider/create" element={<AddProvider />} />
                                <Route path="provider/edit/:providerId" element={<AdminRoute><AddProvider /></AdminRoute>} />
                                <Route path="provider/view/:providerId" element={<AdminRoute><ViewProvider /></AdminRoute>} />
                                <Route path="provider/books/search" element={<ProviderBookSearch />} />
                                <Route path="provider/books" element={<ProtectedRoute><ProviderBooks /></ProtectedRoute>} />
                                <Route path="provider/books/new" element={<ProtectedRoute><ProviderBookCreate /></ProtectedRoute>} />
                                <Route path="provider/books/:id" element={<ProviderBookDetail />} />
                                <Route path="provider/books/:id/edit" element={<ProtectedRoute><ProviderBookEdit /></ProtectedRoute>} />
                                <Route path="provider/orders" element={<ProtectedRoute><ProviderOrders /></ProtectedRoute>} />
                                <Route path="provider/me" element={<LoggedProveedorPage />} />
                                <Route path="/provider/notifications" element={<ProviderNotifications />} />


                                {/* Clientes */}
                                <Route path="clients" element={<AdminRoute><ClientsPage /></AdminRoute>} />
                                <Route path="clients/:id" element={<AdminRoute><ClientDetailPage /></AdminRoute>} />
                                <Route path="clients/create" element={<AddNewClient />} />
                                <Route path="clients/:id/edit" element={<EditClientPage />} />

                                
                                <Route path="books" element={<Books />} />
                                <Route path="books/new" element={<BookCreate />} />
                                <Route path="books/:id" element={<BookDetail />} />
                                <Route path="books/:id/edit" element={<BookEdit />} />

                                
                                <Route path="carts" element={<CartsPage />} />
                                <Route path="carts/create" element={<AddCartPage />} />
                                <Route path="carts/:id" element={<CartDetailPage />} />
                                <Route path="carts/:id/edit" element={<AdminRoute><EditCartPage /></AdminRoute>} />
                                <Route path="carts/:id/add-book" element={<AddBookToCartPage />} />
                                <Route path="cart-books/:id/edit" element={<EditCartBookPage />} />

                                
                                <Route path="delivery" element={<AdminRoute><Delivery /></AdminRoute>} />
                                <Route path="delivery/register" element={<DeliveryCreate />} />
                                <Route path="delivery/new" element={<DeliveryCreate />} />
                                <Route path="delivery/:id" element={<DeliveryDetail />} />
                                <Route path="delivery/:id/edit" element={<AdminRoute><DeliveryEdit /></AdminRoute>} />

                                
                                <Route path="reviews" element={<Reviews />} />
                                <Route path="reviews/new" element={<ProtectedRoute><ReviewCreate /></ProtectedRoute>} />
                                <Route path="reviews/:id" element={<ReviewDetail />} />
                                <Route path="reviews/:id/edit" element={<ProtectedRoute><ReviewEdit /></ProtectedRoute>} />

                                
                                <Route path="categorias" element={<Categorias />} />
                                <Route path="categorias/new" element={<AddCategorias />} />
                                <Route path="categorias/view/:categoriaId" element={<ViewCategorias />} />

                               
                                <Route path="categorialibro" element={<CategoriaLibro />} />
                                <Route path="categorialibro/new" element={<AddCategoriaLibro />} />
                                <Route path="categorialibro/view/:categoriaId/:libroId" element={<ViewCategoriaLibro />} />
                                <Route path="categorialibro/edit/:categoriaId/:libroId" element={<EditCategoriaLibro />} />

                                
                                <Route path="login" element={<LoginPage />} />
                                <Route path="user" element={<ProtectedRoute><LoggedClientPage /></ProtectedRoute>} />
                                <Route path="user/cart" element={<ProtectedRoute><LoggedActiveCartClientPage /></ProtectedRoute>} />
                                <Route path="user/history" element={<ProtectedRoute><LoggedCartClientPage /></ProtectedRoute>} />
                                <Route path="user/favorite-categories" element={<ProtectedRoute><FavoriteCategoriesPage /></ProtectedRoute>} />
                                <Route path="/user/select-categories" element={<SelectCategoriesPage />} />
                                <Route path="user/edit" element={<ProtectedRoute><EditClientPage /></ProtectedRoute>} />

                                
                                <Route path="login/provider" element={<LoginProviderPage />} />

                                
                                <Route path="login/admin" element={<LoginAdminPage />} />
                                <Route path="admin/me" element={<AdminRoute><LoggedAdminPage /></AdminRoute>} />

                                
                                <Route path="logindelivery" element={<LoginDelivery />} />
                                <Route path="loggeddelivery" element={<LoggedDelivery />} />

                             
                                <Route path="payment-success" element={<PaymentSuccessPage />} />
                                <Route path="checkout/address" element={<CheckoutAddressPage />} />
                                <Route path="checkout/payment" element={<CheckoutPaymentPage />} />
                                <Route path="checkout/payment-method" element={<CheckoutPaymentMethodPage />} />
                                <Route path="checkout/google" element={<CheckoutGooglePayPage />} />

                               
                                <Route path="addresses" element={<AddressesPage />} />
                                <Route path="addresses/create" element={<CreateAddressPage />} />
                                <Route path="addresses/:id/edit" element={<EditAddressPage />} />

                                <Route path="home-client" element={<ProtectedRoute><HomeClients /></ProtectedRoute>} />
                                <Route path="chat" element={<ChatPage />} />


                        </Route>

                        
                        <Route path="/admin" element={<AdminLayout />}>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="repartidores" element={<AdminRepartidoresPendientes />} />
                                <Route path="users" element={<AdminUsersList />} />
                                <Route path="users/create" element={<AdminUserCreate />} />
                                <Route path="users/:id" element={<AdminUserDetail />} />
                                <Route path="users/:id/edit" element={<AdminUserEdit />} />

                                <Route path="providers" element={<AdminProvidersList />} />
                                <Route path="providers/create" element={<AdminProviderCreate />} />
                                <Route path="providers/:id" element={<AdminProviderDetail />} />
                                <Route path="providers/:id/edit" element={<AdminProviderEdit />} />

                                <Route path="books" element={<AdminBooksList />} />
                                <Route path="books/create" element={<AdminBookCreate />} />
                                <Route path="books/:id" element={<AdminBookDetail />} />
                                <Route path="books/:id/edit" element={<AdminBookEdit />} />

                                <Route path="categories" element={<AdminCategoriesList />} />
                                <Route path="categories/create" element={<AdminCategoryCreate />} />
                                <Route path="categories/:id" element={<AdminCategoryDetail />} />
                                <Route path="categories/:id/edit" element={<AdminCategoryEdit />} />

                                <Route path="carts" element={<AdminCartsList />} />
                                <Route path="carts/create" element={<AdminCartCreate />} />
                                <Route path="carts/abandoned" element={<AdminCartsAbandoned />} />
                                <Route path="carts/:id" element={<AdminCartDetail />} />
                                <Route path="carts/:id/edit" element={<AdminCartEdit />} />

                                <Route path="delivery" element={<AdminDeliveryList />} />
                                <Route path="delivery/create" element={<AdminDeliveryCreate />} />
                                <Route path="delivery/:id" element={<AdminDeliveryDetail />} />
                                <Route path="delivery/:id/edit" element={<AdminDeliveryEdit />} />

                                <Route path="reviews" element={<AdminReviewList />} />
                                <Route path="reviews/:id" element={<AdminReviewDetail />} />
                        </Route>

                        
                        <Route path="/provider" element={<ProtectedRoute><ProviderLayout /></ProtectedRoute>}>
                                <Route index element={<LoggedProveedorPage />} />
                                <Route path="me" element={<LoggedProveedorPage />} />
                                <Route path="books" element={<ProviderBooks />} />
                                <Route path="books/search" element={<ProviderBookSearch />} />
                                <Route path="books/new" element={<ProviderBookCreate />} />
                                <Route path="books/:id" element={<ProviderBookDetail />} />
                                <Route path="books/:id/edit" element={<ProviderBookEdit />} />
                                <Route path="orders" element={<ProviderOrders />} />
                        </Route>
                </>
        )
);