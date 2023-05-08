import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { app, db } from "../firebase.config";
import { doc, setDoc } from "firebase/firestore";
import { AuthContext } from "../ContextAPI/AuthContext";
import { LanguageContext } from "../ContextAPI/LanguageContext";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function Login() {
  const { userData, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isEnglish } = useContext(LanguageContext);

  async function handleGoogleLogin(event) {
    event.preventDefault();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await setDoc(userRef, {
        userId: user.displayName,
        email: user.email,
      });
      await login(user);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await login(user);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="min-h-screen min-w-max flex justify-center bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <form
        className="max-w-sm w-full p-8 bg-white rounded-lg"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-bold mb-2"
          ></label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg border-gray-400"
            placeholder={isEnglish ? "Email" : "이메일"}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 font-bold mb-2"
          ></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg border-gray-400"
            placeholder={isEnglish ? "Password" : "비밀번호"}
          />
        </div>

        <div className="flex justify-center items-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 mr-4"
          >
            {isEnglish ? "Sign in" : "로그인"}
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            {isEnglish ? "Google Login" : "구글 로그인"}
          </button>
        </div>
        <div className="">
          {isEnglish ? "Don't have an account?  " : "아직 회원이 아니신가요?  "}
          <Link to="/user/reg" className="text-blue-500 hover:text-blue-700">
            <button>{isEnglish ? "Sign up" : "회원가입"}</button>
          </Link>
        </div>
        <div>
          {isEnglish ? "Forgot your password?  " : "비밀번호를 잊으셨나요?  "}
          <Link
            to="/user/find-password"
            className="text-blue-500 hover:text-blue-700"
          >
            <button>{isEnglish ? "Reset" : "비밀번호 찾기"}</button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
