import { lazy } from "react";
import LazyLoading from "./components/LazyLoading";
const HomePage = LazyLoading(lazy(() => import("./views/HomePage")));
import LoginPage from "./views/LoginPage";
import { createBrowserRouter, RouterProvider } from "react-router";
import AuthGuard from "./helper/AuthGuard";
import GuestGuard from "./helper/GuestGuard";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <HomePage />
      </AuthGuard>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
