
import { Link } from "react-router-dom";
import { LoginButtons } from "../../controls/Auth/LoginButtons";
import './Header.css';

export function Header() {
  return (
    <nav id="header" >
      <Link to="/">Home</Link>
      <Link to="/shop">Shop</Link>
      <LoginButtons />
    </nav>
  );
}