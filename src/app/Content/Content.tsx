import { Outlet } from "react-router-dom";
import "./Content.css";

export function Content() {
  return (
    <main id="content">
      <section id="top" />
      <Outlet />
      <section id="bottom" />
    </main>
  );
}