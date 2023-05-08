import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../ContextAPI/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";

export default function UserProfileEdit() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [age, setAge] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userIdDisabled, setUserIdDisabled] = useState(false); // userId 수정칸의 disabled 상태를 관리하는 state 추가
  const [originalUserId, setOriginalUserId] = useState(""); // 기존 userId 값을 저장할 state 추가
  const [userIdUpdatedAt, setUserIdUpdatedAt] = useState(null); // userIdUpdatedAt 변수 선언 및 초기값 설정
  useEffect(() => {
    const getUserInfo = async () => {
      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userInfo = querySnapshot.docs[0].data();
        setName(userInfo.name);
        setEmail(userInfo.email);
        setUserId(userInfo.userId);
        setOriginalUserId(userInfo.userId);
        setBirthday(userInfo.birthday);
        setAge(userInfo.age);
        setIntroduction(userInfo.introduction);
        setUserIdUpdatedAt(userInfo.userIdUpdatedAt); // userIdUpdatedAt 값 설정
      }
    };
    getUserInfo();
    const checkUserIdDisabled = () => {
      const now = new Date();
      const updatedAt = new Date(userIdUpdatedAt);
      const diffInDays = (now - updatedAt) / (1000 * 3600 * 24);
      if (diffInDays < 10) {
        setUserIdDisabled(true);
      }
    };
    if (userIdUpdatedAt) {
      checkUserIdDisabled();
    }
  }, [user, userIdUpdatedAt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const auth = getAuth();
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      const dataToUpdate = {
        name,
        email,
        birthday,
        age,
        introduction,
      };
      if (userId !== originalUserId) {
        // userId가 변경된 경우에만 userIdUpdatedAt 저장
        dataToUpdate.userId = userId;
        dataToUpdate.userIdUpdatedAt = new Date().toISOString(); // 현재 시간을 ISO 형식으로 저장
      }
      await updateDoc(doc(db, "users", user.uid), dataToUpdate);
      alert("프로필이 성공적으로 업데이트되었습니다!");
      navigate("/user/profile");
    } catch (error) {
      console.error("프로필 업데이트 중 에러 발생:", error);
      alert("프로필 업데이트 중 에러가 발생했습니다.");
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleBirthdayChange = (e) => {
    setBirthday(e.target.value);
  };

  const handleAgeChange = (e) => {
    setAge(e.target.value);
  };

  const handleIntroductionChange = (e) => {
    setIntroduction(e.target.value);
  };
  async function handleUserIdDuplicateCheck() {
    if (!validateUserId(userId)) {
      return;
    }
    const q = query(collection(db, "users"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      alert("이미 사용 중인 아이디입니다.");
    } else {
      alert("사용 가능한 아이디입니다.");
    }
  }

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
    <div className="min-h-screen min-w-max pt-88px flex justify-center bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <h1 className="text-3xl font-bold mb-6">프로필 수정하기</h1>
      <Link to="/user/profile">
        <button>돌아가기</button>
      </Link>
      <form
        className="max-w-md w-full p-8 bg-white shadow-md rounded-lg"
        onSubmit={handleSubmit}
      >
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
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
            name="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            disabled={userIdDisabled}
          />
        </div>
        <button
          type="button"
          onClick={handleUserIdDuplicateCheck}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
        >
          중복확인
        </button>

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
            이름:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleNameChange}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            이메일:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            disabled
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="birthday"
            className="block text-gray-700 font-bold mb-2"
          >
            생일:
          </label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={birthday}
            onChange={handleBirthdayChange}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="age" className="block text-gray-700 font-bold mb-2">
            나이:
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={age}
            onChange={handleAgeChange}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="introduction"
            className="block text-gray-700 font-bold mb-2"
          >
            내 소개:
          </label>
          <textarea
            rows="10"
            id="introduction"
            name="introduction"
            value={introduction}
            onChange={handleIntroductionChange}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          type="submit"
        >
          저장하기
        </button>
      </form>
    </div>
  );
}
