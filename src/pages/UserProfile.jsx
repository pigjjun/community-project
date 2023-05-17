import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../ContextAPI/AuthContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";
import { LanguageContext } from "../ContextAPI/LanguageContext";
import LogoutButton from "../components/LogoutButton";
import DeleteAccountButton from "../components/DeleteAccountButton";

export default function UserProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const { isEnglish } = useContext(LanguageContext);

  useEffect(() => {
    const getUserInfo = async () => {
      const q = query(collection(db, "users"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userInfo = querySnapshot.docs[0].data();
        userInfo.uid = querySnapshot.docs[0].id;

        setUserInfo(userInfo);
      }
    };
    getUserInfo();
  }, [userId]);

  useEffect(() => {
    const getUserPosts = async () => {
      if (userInfo) {
        const q = query(
          collection(db, "posts"),
          where("createdByUserId", "==", userInfo.userId)
        );
        const querySnapshot = await getDocs(q);
        const posts = [];
        querySnapshot.forEach((doc) => {
          const post = doc.data();
          post.id = doc.id;
          posts.push(post);
        });
        setUserPosts(posts);
      }
    };
    getUserPosts();
  }, [userInfo]);

  return (
    <div className="min-h-screen min-w-max pb-6 pt-88px bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <div className="">
        <div className="text-3xl mt-4 font-bold text-black-theme-005 dark:text-white-theme-002 transition-all duration-500">
          {isEnglish ? "Profile" : "프로필"}
        </div>
        <div className="flex justify-end mr-3 mb-3">
          {user && user.email === userInfo?.email && (
            <Link to="/user/profile/edit">
              <button className="text-sm px-2 py-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500">
                {isEnglish ? "Edit" : "수정하기"}
              </button>
            </Link>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-md w-full px-8">
        {/* 프로필사진, 아이디, 소개 */}
        <div className="flex flex-col mb-6 border-2 rounded-lg border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
          {/* 프로필 사진 */}
          <div className="flex justify-center mt-6 mb-4 mx-6 py-4 transition-all duration-500">
            <img
              className="rounded-full border-2 border-black-theme-003 dark:border-white-theme-001 transition-all duration-500"
              src={
                userInfo && userInfo.photoURL
                  ? userInfo.photoURL
                  : "https://firebasestorage.googleapis.com/v0/b/pigjjun-sub.appspot.com/o/profilePictures%2FUser-Profile-Icon.svg?alt=media"
              }
              alt="프로필 사진"
              width="150"
              height="150"
            />
          </div>
          {/* 아이디, 소개 */}
          <div className="flex flex-col mx-6 mb-6 border-2 rounded-lg border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
            {/* 아이디 */}
            <div className="flex my-2 justify-center">
              <label
                htmlFor="name"
                className="font-bold mr-4 text-black-theme-005 dark:text-white-theme-002 transition-all duration-500"
              >
                {isEnglish ? "ID" : "닉네임"}
              </label>
              <p className="text-button-neutral-005 dark:text-button-neutral-004 transition-all duration-500">
                {userInfo && userInfo.userId}
              </p>
            </div>
            {/* 소개 */}
            <div className="mb-2 border-t-2 border-dashed pt-2 border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
              <label
                htmlFor="age"
                className="block font-bold mb-2 text-black-theme-005 dark:text-white-theme-002 transition-all duration-500"
              >
                {isEnglish ? "Introduction" : "내 소개"}
              </label>
              <p className="text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
                {userInfo && userInfo.introduction}
              </p>
            </div>
          </div>
        </div>
        {/* 이름, 이메일, 생일, 나이 */}
        <div className="flex justify-between border-2 rounded-lg py-4 px-8 mb-6 border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
          {/* 이름, 이메일 */}
          <div>
            {/* 이름 */}
            <div className="text-left mb-4">
              <label
                htmlFor="name"
                className="block font-bold mb-2 text-black-theme-005 dark:text-white-theme-002 transition-all duration-500"
              >
                {isEnglish ? "Name" : "이름"}
              </label>
              <p className="text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
                {userInfo && userInfo.name}
              </p>
            </div>
            {/* 이메일 */}
            <div className="text-left">
              <label
                htmlFor="email"
                className="block font-bold mb-2 text-black-theme-005 dark:text-white-theme-002 transition-all duration-500"
              >
                {isEnglish ? "Email" : "이메일"}
              </label>
              <p className="text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
                {userInfo && userInfo.email}
              </p>
            </div>
          </div>
          {/* 세로 구분선 */}
          <div className="border-l-2 border-dashed border-black-theme-003 dark:border-black-theme-002 transition-all duration-500"></div>
          {/* 생일, 나이 */}
          <div>
            {/* 나이 */}
            <div className="text-left mb-4">
              <label
                htmlFor="age"
                className="block font-bold mb-2 text-black-theme-005 dark:text-white-theme-002 transition-all duration-500"
              >
                {isEnglish ? "Age" : "나이"}
              </label>
              <p className="text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
                {userInfo && userInfo.age}
              </p>
            </div>
            {/* 생일 */}
            <div className="text-left">
              <label
                htmlFor="birthday"
                className="text-left block font-bold mb-2 text-black-theme-005 dark:text-white-theme-002 transition-all duration-500"
              >
                {isEnglish ? "Birthday" : "생일"}
              </label>
              <p className="text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
                {userInfo && userInfo.birthday}
              </p>
            </div>
          </div>
        </div>
        {/* 유저가 쓴 게시물 */}
        <div className="border-2 rounded-lg px-8 py-4 border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
          {userPosts.length > 0 ? (
            <>
              <div className="text-lg font-bold mb-4 pb-2 border-b-2 border-dashed text-black-theme-005 dark:text-white-theme-002 border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
                {isEnglish
                  ? `${userInfo.userId}'s Posts`
                  : `${userInfo.userId}의 게시물`}
              </div>
              <ul className="">
                {userPosts.map((post) => (
                  <Link to={`/main/post/${post.id}`} key={post.id}>
                    <li className="mb-2 pb-2 border-b-2 border-dotted border-black-theme-003 dark:border-black-theme-002 text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
                      {post.title}
                    </li>
                  </Link>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
              {isEnglish
                ? "No posts have been created"
                : "작성한 게시물이 없습니다"}
            </p>
          )}
        </div>
        {/* 로그아웃 버튼 */}
        <div>{user && user.email === userInfo?.email && <LogoutButton />}</div>
      </div>
      <div className="flex justify-end">
        {/* 회원탈퇴 버튼 */}
        {user && user.email === userInfo?.email && (
          <DeleteAccountButton
            userInfo={userInfo}
            userPosts={userPosts}
            isEnglish={isEnglish}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}
