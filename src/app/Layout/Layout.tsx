
import { Header } from "../Header/Header";
import { Content } from "../Content/Content";
import { Footer } from "../Footer/Footer";
import "./Layout.css";

export function Layout() {
  return (
    <div id="page-layout">
      <section id="left" className="layout-column" />
      <section id="center" className="layout-column">
        <Header />
        <Content />
        <Footer />
      </section>
      <section id="right" className="layout-column" />
    </div>
  );
}