import React, { createContext, useState, useEffect, useContext } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app, db } from "../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { LanguageContext } from "./LanguageContext";

export const AuthContext = createContext();

const auth = getAuth(app);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(null);
  const { isEnglish } = useContext(LanguageContext);

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setIsLoggedIn(!!currentUser);
      if (currentUser) {
        const token = await currentUser.getIdToken();
        setToken(token);
        const userRef = doc(db, "users", currentUser.uid); // uid를 문서 이름으로 사용
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No such document!");
        }
      } else {
        setToken("");
        setUserData(null);
      }
    });
  }, []);
  async function login(user) {
    try {
      setUser(user);
      const token = await user.getIdToken();
      setToken(token);
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const message = isEnglish
          ? `Welcome back! ${user.displayName || userData.userId}`
          : `${user.displayName || userData.userId} 님 환영합니다`;
        alert(message);
        setUserData(userDoc.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isLoggedIn, token, userData, login }}
    >
      {children}
    </AuthContext.Provider>
  );
};
