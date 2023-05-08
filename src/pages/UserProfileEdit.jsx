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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [age, setAge] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        setBirthday(userInfo.birthday);
        setAge(userInfo.age);
        setIntroduction(userInfo.introduction);
      }
    };
    getUserInfo();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const auth = getAuth();
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await updateDoc(doc(db, "users", user.uid), {
        name,
        email,
        birthday,
        age,
        introduction,
      });
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

  return (
    <div className="min-h-screen min-w-max flex justify-center bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
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
