import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css";

export default function NavBar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__logo">
        <Link to="/" className="navbar__logo-link">
          <p>Logo</p>
        </Link>
      </div>
      <div className="navbar__buttons">
        {/* Dark-White Mode */}
        <button className="navbar__theme-button">테마</button>

        {/* 한/영 변경 */}
        <button className="navbar__language-button">한글/ENG</button>

        <div>
          <Link to="/user/login" className="navbar__login-button">
            로그인
          </Link>
        </div>
      </div>
    </nav>
  );
}
