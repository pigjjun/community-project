import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { AuthContext } from "../ContextAPI/AuthContext";
import { LanguageContext } from "../ContextAPI/LanguageContext";

export default function NavBar() {
  const { isLoggedIn } = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useLocalStorage("isDarkMode", false);
  const { isEnglish, toggleLanguage } = useContext(LanguageContext);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    toggleTheme();
    console.log(isDarkMode);
  };

  const handleToggleLanguage = () => {
    toggleLanguage();
    console.log(isEnglish);
  };

  return (
    <nav className="flex min-w-max w-full items-center justify-between flex-wrap bg-white-theme-003 p-6 shadow-md dark:bg-black-theme-005 transition-all duration-500">
      {/* Logo */}
      <Link to="/" className="navbar__logo-link">
        <div className="navbar__logo mx-4">
          <p className="text-xl font-bold text-black-theme-004 dark:text-white-theme-002">
            Logo
          </p>
        </div>
      </Link>
      <div className="navbar__buttons flex">
        {/* Dark-White Mode */}
        <button
          className="navbar__theme-button font-bold mr-2 bg-white-theme-005 text-black-theme-005 px-4 py-2 rounded-lg hover:bg-white-theme-007 dark:bg-black-theme-004 dark:text-white-theme-003 dark:hover:bg-black-theme-003 transition-all duration-500"
          onClick={handleToggleTheme}
        >
          {isDarkMode
            ? isEnglish
              ? "White Mode"
              : "화이트 모드"
            : isEnglish
            ? "Dark Mode"
            : "다크 모드"}
        </button>

        {/* 한/영 변경 */}
        <button
          className="navbar__language-button font-bold mr-2 bg-white-theme-005 text-black-theme-005 px-4 py-2 rounded-lg hover:bg-white-theme-007 dark:bg-black-theme-004 dark:text-white-theme-003 dark:hover:bg-black-theme-003 transition-all duration-500"
          onClick={handleToggleLanguage}
        >
          {isEnglish ? "한글" : "ENG"}
        </button>

        {/* 로그인/프로필 버튼 */}
        {isLoggedIn ? (
          <Link to="/user/profile">
            <div className="navbar__profile-button font-bold mr-2 bg-white-theme-005 text-black-theme-005 px-4 py-2 rounded-lg hover:bg-white-theme-007 dark:bg-black-theme-004 dark:text-white-theme-003 dark:hover:bg-black-theme-003 transition-all duration-500">
              {isEnglish ? "Profile" : "프로필"}
            </div>
          </Link>
        ) : (
          <Link to="/user/login">
            <div className="navbar__login-button font-bold mr-2 bg-white-theme-005 text-black-theme-005 px-4 py-2 rounded-lg hover:bg-white-theme-007 dark:bg-black-theme-004 dark:text-white-theme-003 dark:hover:bg-black-theme-003 transition-all duration-500">
              {isEnglish ? "Login" : "로그인"}
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
