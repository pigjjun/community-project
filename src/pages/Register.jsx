import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app, db } from "../firebase.config";
import {
  setDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true); // 비밀번호 일치 여부 상태 추가
  const navigate = useNavigate();

  function handleConfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
    setPasswordMatch(event.target.value === password); // 입력할 때마다 일치 여부 체크
  }

  function handleEmailDuplicateCheck() {
    if (!validateEmail(email)) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    getDocs(q)
      .then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          alert("이미 사용 중인 이메일입니다.");
        } else {
          alert("사용 가능한 이메일입니다.");
        }
      })
      .catch((error) => {
        console.error("Error checking email duplication: ", error);
      });
  }

  function handleUserIdDuplicateCheck() {
    if (!validateUserId(userId)) {
      alert(
        "아이디는 3~16자의 영문 대소문자, 숫자, 특수문자(-, _)만 사용할 수 있습니다."
      );
      return;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("userId", "==", userId));
    getDocs(q)
      .then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          alert("이미 사용 중인 아이디입니다.");
        } else {
          alert("사용 가능한 아이디입니다.");
        }
      })
      .catch((error) => {
        console.error("Error checking userId duplication: ", error);
      });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMatch(false); // 비밀번호 일치하지 않으면 상태 업데이트
      return;
    } else {
      setPasswordMatch(true); // 일치하면 상태 업데이트
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

  function validateEmail(email) {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  }

  function validateUserId(userId) {
    const userIdRegex = /^[a-zA-Z0-9_-]{3,16}$/;
    return userIdRegex.test(userId);
  }

  return (
    <div className="flex pt-88px min-h-screen bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
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
          <button
            type="button"
            onClick={handleEmailDuplicateCheck}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
          >
            중복확인
          </button>
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
          <button
            type="button"
            onClick={handleUserIdDuplicateCheck}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
          >
            중복확인
          </button>
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
            onChange={handleConfirmPasswordChange} // 이벤트 핸들러 등록
            required
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        {passwordMatch ? (
          <p className="text-red-500">비밀번호가 일치합니다.</p>
        ) : (
          <p className="text-red-500">비밀번호가 일치하지 않습니다.</p>
        )}
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
