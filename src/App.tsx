import {
  Navigate,
  Route,
  Routes,
} from "react-router";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import {
  ListingDetailPage,
} from "./pages/ListingDetailPage";

import { MyListingsPage } from "./pages/MyListingsPage";
import {
  CreateListingPage,
} from "./pages/CreateListingPage";

import { SignupPage } from "./pages/SignupPage";
import {
  VerifyEmailPage,
} from "./pages/VerifyEmailPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/marketplace"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/signup"
        element={<SignupPage />}
      />


      <Route
        path="/verify-email"
        element={<VerifyEmailPage />}
      />

<Route
  path="/verify-email"
  element={<VerifyEmailPage />}
/>

      <Route element={<ProtectedRoute />}>

        <Route
          path="/marketplace/new"
          element={<CreateListingPage />}
        />
        <Route
          path="/marketplace/mine"
          element={<MyListingsPage />}
        />
        <Route
          path="/marketplace"
          element={<MarketplacePage />}
        />

        <Route
          path="/marketplace/listings/:listingId"
          element={<ListingDetailPage />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/marketplace"
            replace
          />
        }
      />
    </Routes>
  );
}