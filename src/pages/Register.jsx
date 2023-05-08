import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app, db } from "../firebase.config";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const auth = getAuth(app);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // 회원가입 성공
        const user = userCredential.user;
        console.log(user.uid); // 사용자 UID 출력
        // Firestore에 회원 정보 저장
        const userDocRef = doc(db, "users", user.uid);
        setDoc(userDocRef, {
          email: email,
          userId: userId,
          name: "",
          birthday: "",
          age: 0,
          introduction: "",
        })
          .then(() => {
            alert(`${userId}님 회원가입을 축하합니다`);
            navigate("/user/profile");
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // 회원가입 실패
        console.log(errorCode, errorMessage);
      });
  }

  return (
    <div className="flex min-h-screen bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto mt-10">
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            이메일:
          </label>
          <input
            type="email"
            id="register-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="userId"
            className="block text-gray-700 font-bold mb-2"
          >
            아이디:
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            required
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-bold mb-2"
          >
            비밀번호:
          </label>
          <input
            type="password"
            id="register-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="confirm-password"
            className="block text-gray-700 font-bold mb-2"
          >
            비밀번호 확인:
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          id="signup-button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          회원가입
        </button>
      </form>
    </div>
  );
}
