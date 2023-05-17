import React, { useContext, useState } from "react";
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
import { LanguageContext } from "../ContextAPI/LanguageContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true); // 비밀번호 일치 여부 상태 추가
  const navigate = useNavigate();
  const [emailChecked, setEmailChecked] = useState(false);
  const [userIdChecked, setUserIdChecked] = useState(false);
  const { isEnglish } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(false);

  // 비밀번호 확인 //
  function handleConfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
    setPasswordMatch(event.target.value === password); // 입력할 때마다 일치 여부 체크
  }

  // 이메일 중복 확인 //
  function handleEmailDuplicateCheck() {
    if (!validateEmail(email)) {
      alert(
        isEnglish
          ? "This email is already in use."
          : "이미 사용 중인 이메일입니다."
      );
      return;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    getDocs(q)
      .then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          alert(
            isEnglish
              ? "This email is already in use."
              : "이미 사용 중인 이메일입니다."
          );
        } else {
          alert(
            isEnglish ? "This email is available." : "사용 가능한 이메일입니다."
          );
          setEmailChecked(true); // 이메일 중복 확인 완료
        }
      })
      .catch((error) => {
        console.error("Error checking email duplication: ", error);
      });
  }

  // 아이디 중복확인 //
  function handleUserIdDuplicateCheck() {
    if (!validateUserId(userId)) {
      return;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("userId", "==", userId));
    getDocs(q)
      .then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          alert(
            isEnglish
              ? "This user ID is already in use."
              : "이미 사용 중인 아이디입니다."
          );
        } else {
          alert(
            isEnglish
              ? "This user ID is available."
              : "사용 가능한 아이디입니다."
          );
          setUserIdChecked(true); // 아이디 중복 확인 완료
        }
      })
      .catch((error) => {
        console.error("Error checking userId duplication: ", error);
      });
  }

  // handleSubmit //
  function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    if (!emailChecked) {
      alert(
        isEnglish
          ? "Email duplication check is required."
          : "이메일 중복 확인이 필요합니다."
      );
      return;
    }
    if (!userIdChecked) {
      alert(
        isEnglish
          ? "User ID duplication check is required."
          : "아이디 중복 확인이 필요합니다."
      );
      return;
    }
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
          age: "",
          introduction: "",
          photoURL: "",
        })
          .then(() => {
            alert(
              isEnglish
                ? `Welcome, ${userId}!`
                : `${userId}님 회원가입을 축하합니다`
            );
            navigate(`/user/profile/${userId}`);
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
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // 이메일 유효성 검사 //
  function validateEmail(email) {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  }

  // 아이디 유효성 검사 //
  function validateUserId(userId) {
    const isKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
    const isEnglish = /[a-zA-Z]/;

    if (isKorean.test(userId)) {
      // Validate Korean user ID
      if (userId.length < 2 || /^[ㄱ-ㅎㅏ-ㅣ]+$/.test(userId)) {
        alert(
          "아이디는 자음 또는 모음만으로는 사용할 수 없으며, 2자 이상이어야 합니다."
        );
        return false;
      }
    } else if (isEnglish.test(userId)) {
      // Validate English user ID
      if (userId.length < 4) {
        alert("아이디는 영문자로 4자 이상이어야 합니다.");
        return false;
      }
    } else {
      // User ID is neither Korean nor English
      alert("아이디는 영문자 또는 한글로 입력해야 합니다.");
      return false;
    }

    const userIdRegex = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣_-]{2,16}$/;
    if (!userIdRegex.test(userId)) {
      alert(
        "아이디는 영문자, 숫자, 특수문자(_,-)로 2자 이상 16자 이하여야 합니다."
      );
      return false;
    }
    return true;
  }

  return (
    <div className="flex items-center pt-88px min-h-screen bg-white-theme-001 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto mt-10">
        {/* 이메일 */}
        <div className="mb-8 flex items-center">
          <label
            htmlFor="email"
            className="flex min-w-fit justify-center text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 font-bold mb-2"
          ></label>
          <input
            type="email"
            id="register-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder={isEnglish ? "Email" : "이메일"}
            className="w-full text-center mr-2 py-6 px-6 placeholder:text-black-theme-002 placeholder:dark:text-white-theme-001 text-black-theme-004 dark:text-white-theme-001 bg-white-theme-000 dark:bg-black-theme-001 border-2 rounded-lg border-black-theme-003 dark:border-black-theme-002 transition-all duration-500"
          />
          {/* 이메일 중복확인 버튼 */}
          <button
            type="button"
            onClick={handleEmailDuplicateCheck}
            className="flex justify-center h-fit min-w-fit text-sm px-2 py-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
          >
            {isEnglish ? "Duplicate Check" : "중복확인"}
          </button>
        </div>
        {/* 아이디 */}
        <div className="mb-8 flex items-center">
          <label
            htmlFor="userId"
            className="flex min-w-fit justify-center text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 font-bold mb-2"
          ></label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            required
            placeholder={isEnglish ? "User ID" : "아이디"}
            className="w-full text-center mr-2 px-6 py-6 placeholder:text-black-theme-002 placeholder:dark:text-white-theme-001 text-black-theme-004 dark:text-white-theme-001 bg-white-theme-000 dark:bg-black-theme-001 border-2 rounded-lg border-black-theme-003 dark:border-black-theme-002 transition-all duration-500"
          />
          {/* 아이디 중복확인 버튼 */}
          <button
            type="button"
            onClick={handleUserIdDuplicateCheck}
            className="flex justify-center h-fit min-w-fit text-sm px-2 py-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
          >
            {isEnglish ? "Duplicate Check" : "중복확인"}
          </button>
        </div>
        {/* 비밀번호 */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="flex justify-center text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 font-bold mb-2"
          ></label>
          <input
            type="password"
            id="register-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder={isEnglish ? "Password" : "비밀번호"}
            className="w-full text-center px-6 py-4 placeholder:text-black-theme-002 placeholder:dark:text-white-theme-001 text-black-theme-004 dark:text-white-theme-001 bg-white-theme-000 dark:bg-black-theme-001 border-2 rounded-lg border-black-theme-003 dark:border-black-theme-002 transition-all duration-500"
          />
        </div>
        {/* 비밀번호 확인 */}
        <div className="">
          <label
            htmlFor="confirm-password"
            className="flex justify-center text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 font-bold mb-2"
          ></label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange} // 이벤트 핸들러 등록
            required
            placeholder={isEnglish ? "Password Check" : "비밀번호 확인"}
            className="w-full text-center px-6 py-4 placeholder:text-black-theme-002 placeholder:dark:text-white-theme-001 text-black-theme-004 dark:text-white-theme-001 bg-white-theme-000 dark:bg-black-theme-001 border-2 rounded-lg border-black-theme-003 dark:border-black-theme-002 transition-all duration-500"
          />
        </div>
        {password && confirmPassword ? (
          passwordMatch ? (
            <p className="text-button-neutral-003">
              {isEnglish ? "Password matches" : "비밀번호가 일치합니다"}
            </p>
          ) : (
            <p className="text-button-red-003">
              {isEnglish
                ? "Password doesn't match"
                : "비밀번호가 일치하지 않습니다"}
            </p>
          )
        ) : null}
        {/* 회원가입 버튼 */}
        <button
          className="w-full text-sm mt-10 px-2 py-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
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
            `${isEnglish ? "Sign Up" : "회원가입"}`
          )}
        </button>
      </form>
    </div>
  );
}
