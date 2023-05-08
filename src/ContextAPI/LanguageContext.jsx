import React, { createContext, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export const LanguageContext = createContext();

export function LanguageContextProvider({ children }) {
  const [isEnglish, setIsEnglish] = useLocalStorage("isEnglish", true);

  const toggleLanguage = () => {
    setIsEnglish((prevLang) => !prevLang);
  };

  useEffect(() => {
    if (isEnglish) {
      document.body.classList.add("english");
    } else {
      document.body.classList.remove("english");
    }
  }, [isEnglish]);

  return (
    <LanguageContext.Provider value={{ isEnglish, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
