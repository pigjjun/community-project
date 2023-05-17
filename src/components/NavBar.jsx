import React, { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { AuthContext } from "../ContextAPI/AuthContext";
import { LanguageContext } from "../ContextAPI/LanguageContext";
import LogoutButton from "./LogoutButton";

export default function NavBar() {
  const { isLoggedIn, userData } = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useLocalStorage("isDarkMode", false);
  const { isEnglish, toggleLanguage } = useContext(LanguageContext);
  const [navClass, setNavClass] = useState(
    "flex fixed p-6 left-0 top-0 min-w-max w-full items-center justify-between flex-wrap bg-white-theme-003 shadow-md dark:bg-black-theme-005 transition-all duration-250"
  );
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutId = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutId.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutId.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutId.current);
    };
  }, []);

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY) {
        setNavClass(
          "flex fixed p-2 left-0 top-0 min-w-max w-full items-center justify-between flex-wrap bg-white-theme-003 shadow-md dark:bg-black-theme-005 transition-all duration-250"
        );
      } else {
        setNavClass(
          "flex fixed p-6 left-0 top-0 min-w-max w-full items-center justify-between flex-wrap bg-white-theme-003 shadow-md dark:bg-black-theme-005 transition-all duration-250"
        );
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={`z-50 ${navClass}`}>
      {/* Logo */}
      <Link to="/">
        <div className="mx-4 hover:scale-105 transition-all duration-250">
          <img
            src="/Logo.png"
            alt="Logo"
            className="text-xl font-bold text-black-theme-004 dark:text-white-theme-002"
            width="150"
            height="150"
          ></img>
        </div>
      </Link>
      <div className="flex">
        {/* Dark-White Mode */}
        <button
          className="font-bold mr-2 bg-white-theme-005 text-black-theme-005 px-4 py-2 rounded-lg hover:bg-white-theme-007 dark:bg-black-theme-004 dark:text-white-theme-003 dark:hover:bg-black-theme-003 transition-all duration-500"
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
          className="font-bold mr-2 bg-white-theme-005 text-black-theme-005 px-4 py-2 rounded-lg hover:bg-white-theme-007 dark:bg-black-theme-004 dark:text-white-theme-003 dark:hover:bg-black-theme-003 transition-all duration-500"
          onClick={handleToggleLanguage}
        >
          {isEnglish ? "한글" : "ENG"}
        </button>

        {/* 로그인/프로필 버튼 */}
        {isLoggedIn ? (
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Link to={`/user/profile/${userData?.userId}`}>
              <button className="font-bold min-h-full bg-white-theme-005 text-black-theme-005 px-4 py-2 rounded-lg hover:bg-white-theme-007 dark:bg-black-theme-004 dark:text-white-theme-003 dark:hover:bg-black-theme-003 transition-all duration-500">
                <img
                  className="stroke-current rounded-lg"
                  src={
                    userData && userData.photoURL
                      ? userData.photoURL
                      : "https://firebasestorage.googleapis.com/v0/b/pigjjun-sub.appspot.com/o/profilePictures%2FUser-Profile-Icon.svg?alt=media"
                  }
                  alt="프로필 사진"
                  width="20"
                  height="20"
                />
              </button>
            </Link>
            {
              <div
                className={`flex flex-col top-10 items-center absolute px-4 mt-8 mr-4 bg-white-theme-001 dark:bg-black-theme-001 rounded-lg shadow-md transition-all duration-250 transform ${
                  isHovered ? "opacity-100 right-2" : "opacity-0 -right-40"
                }`}
              >
                <Link to={`/user/profile/${userData?.userId}`}>
                  <button className="block w-full text-left p-4 border-b">
                    {isEnglish ? "Profile" : "프로필"}
                  </button>
                </Link>
                <Link to={`/user/profile/edit`}>
                  <button className="block w-full text-left p-4 border-b">
                    {isEnglish ? "Edit Profile" : "프로필 수정"}
                  </button>
                </Link>
                <Link to="/main/write">
                  <button className="block w-full text-left p-4 border-b">
                    {isEnglish ? "New Post" : "새 게시글"}
                  </button>
                </Link>
                <div className="block w-full">
                  <LogoutButton />
                </div>
              </div>
            }
          </div>
        ) : (
          <Link to="/user/login">
            <button className="font-bold bg-white-theme-005 text-black-theme-005 px-4 py-2 rounded-lg hover:bg-white-theme-007 dark:bg-black-theme-004 dark:text-white-theme-003 dark:hover:bg-black-theme-003 transition-all duration-500">
              {isEnglish ? "Login" : "로그인"}
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
