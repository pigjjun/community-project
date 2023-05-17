import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { app, db } from "../firebase.config";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
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
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isEmailLoading, setEmailLoading] = useState(false);

  async function handleGoogleLogin(event) {
    event.preventDefault();
    try {
      setGoogleLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);

      // Check if user document exists
      const userDoc = await getDoc(userRef);

      // If user document doesn't exist, create a new one
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
        });
      } else {
        // Update existing user document with new data
        await updateDoc(userRef, {
          name: user.displayName,
          email: user.email,
        });
      }

      await login(user);
      setGoogleLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setEmailLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await login(user);
      setEmailLoading(false);
      navigate("/");
    } catch (error) {
      console.error(error);
      setEmailLoading(false);

      // Firebase Error Handling
      let errorMessage;
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = isEnglish
            ? "No account found with this email."
            : "해당 이메일로 등록된 계정이 없습니다.";
          break;
        case "auth/wrong-password":
          errorMessage = isEnglish
            ? "Incorrect password."
            : "비밀번호가 틀렸습니다.";
          break;
        default:
          errorMessage = isEnglish
            ? "An error occurred. Please try again."
            : "오류가 발생했습니다. 다시 시도해 주세요.";
      }

      // Display error message to user
      alert(errorMessage);
    }
  }
  return (
    <div className="min-h-screen min-w-max pt-88px flex items-center justify-center bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <div className="border-2 rounded-lg border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
        <form
          className="max-w-sm w-full p-8 bg-white rounded-lg"
          onSubmit={handleSubmit}
        >
          {/* 이메일 입력란 */}
          <div className="mb-10">
            <label htmlFor="email" className="block mb-2"></label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full text-right px-6 py-6 placeholder:text-black-theme-002 placeholder:dark:text-white-theme-001 text-black-theme-004 dark:text-white-theme-001 bg-white-theme-000 dark:bg-black-theme-001 border-2 rounded-lg border-black-theme-003 dark:border-black-theme-002 transition-all duration-500"
              placeholder={isEnglish ? "Email" : "이메일"}
            />
          </div>
          {/* 비밀번호 입력란 */}
          <div className="">
            <label htmlFor="password" className="block mb-2"></label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full text-right px-6 py-6 placeholder:text-black-theme-002 placeholder:dark:text-white-theme-001 text-black-theme-004 dark:text-white-theme-001 bg-white-theme-000 dark:bg-black-theme-001 border-2 rounded-lg border-black-theme-003 dark:border-black-theme-002 transition-all duration-500"
              placeholder={isEnglish ? "Password" : "비밀번호"}
            />
          </div>

          <div className="flex justify-center items-center my-10">
            {/* 로그인 버튼 */}
            <button
              className="flex mr-4 px-4 py-2 border border-black-theme-004 dark:border-white-theme-001 text-black-theme-003 dark:text-white-theme-001 gap-2 rounded-lg transition-all duration-250"
              type="submit"
              disabled={isEmailLoading}
            >
              {isEmailLoading ? (
                <span className="relative inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                `${isEnglish ? "Login" : "로그인"}`
              )}
            </button>
            {/* 구글 로그인 */}
            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="flex px-4 py-2 border border-black-theme-004 dark:border-white-theme-001 text-black-theme-003 dark:text-white-theme-001 gap-2 rounded-lg transition-all duration-250"
            >
              {isGoogleLoading ? (
                <span className="relative inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                <>
                  <img
                    className="w-6 h-6"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    loading="lazy"
                    alt="google logo"
                  />
                  <span>{isEnglish ? "Login with Google" : "구글 로그인"}</span>
                </>
              )}
            </button>
          </div>

          {/* 회원가입  */}
          <div className="flex justify-between px-6">
            <p className="mr-4 text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
              {isEnglish
                ? "Don't have an account?  "
                : "아직 회원이 아니신가요?  "}
            </p>
            <Link
              to="/user/reg"
              className="text-button-blue-002 hover:text-button-blue-004 transition-all duration-250"
            >
              <button>{isEnglish ? "Sign up" : "회원가입"}</button>
            </Link>
          </div>

          {/* 비밀전호 찾기
          <div className="flex justify-between px-6">
            <p className="mr-4 text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
              {isEnglish
                ? "Forgot your password?  "
                : "비밀번호를 잊으셨나요?  "}
            </p>
            <Link
              to="/user/find-password"
              className="text-button-blue-002 hover:text-button-blue-004 transition-all duration-250"
            >
              <button>{isEnglish ? "Reset" : "비밀번호 찾기"}</button>
            </Link>
          </div> */}
        </form>
      </div>
    </div>
  );
}

export default Login;
