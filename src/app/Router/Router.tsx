import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "../Layout/Layout";
import { HomePage } from "../../pages/HomePage";
import { ShopPage } from "../../pages/ShopPage";
// import { AdminPage } from "../../pages/AdminPage";
import "./Router.css";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
