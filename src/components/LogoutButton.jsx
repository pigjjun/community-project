import React, { useContext } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../ContextAPI/LanguageContext";

export default function LogoutButton() {
  const { isEnglish } = useContext(LanguageContext);
  const navigate = useNavigate();

  const logout = async () => {
    const auth = getAuth();
    if (
      window.confirm(
        isEnglish
          ? "Are you sure you want to logout?"
          : "로그아웃 하시겠습니까?"
      )
    )
      try {
        await signOut(auth);
        navigate("/user/login");
      } catch (error) {
        console.error("로그아웃 중 에러 발생:", error);
      }
  };

  return (
    <button
      className="my-4 bg-button-red-002 text-white-theme-000 text-sm font-bold px-2 py-1 rounded-lg hover:bg-button-red-003 transition-all duration-250"
      onClick={logout}
    >
      {isEnglish ? "Logout" : "로그아웃"}
    </button>
  );
}
