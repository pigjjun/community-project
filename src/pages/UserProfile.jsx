import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../ContextAPI/AuthContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";

export default function UserProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const getUserInfo = async () => {
      const q = query(collection(db, "users"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userInfo = querySnapshot.docs[0].data();
        userInfo.uid = querySnapshot.docs[0].id; // Add uid to userInfo object
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
          where("createdBy", "==", userInfo.uid) // Use userInfo.uid here
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

  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/user/login");
    } catch (error) {
      console.error("로그아웃 중 에러 발생:", error);
    }
  };

  return (
    <div className="min-h-screen min-w-max pt-88px flex justify-center bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <h1 className="text-3xl font-bold mb-6">프로필</h1>
      {user && user.email === userInfo?.email && (
        <Link to="/user/profile/edit">
          <button>수정하기</button>
        </Link>
      )}
      <div className="max-w-md w-full p-8 bg-white shadow-md rounded-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
            아이디:
          </label>
          <p>{userInfo && userInfo.userId}</p>
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
            이름:
          </label>
          <p>{userInfo && userInfo.name}</p>
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            이메일:
          </label>
          <p>{userInfo && userInfo.email}</p>
        </div>
        <div className="mb-4">
          <label
            htmlFor="birthday"
            className="block text-gray-700 font-bold mb-2"
          >
            생일:
          </label>
          <p>{userInfo && userInfo.birthday}</p>
        </div>
        <div className="mb-4">
          <label htmlFor="age" className="block text-gray-700 font-bold mb-2">
            나이:
          </label>
          <p>{userInfo && userInfo.age}</p>
        </div>
        <div className="mb-4">
          <label htmlFor="age" className="block text-gray-700 font-bold mb-2">
            내 소개:
          </label>
          <p>{userInfo && userInfo.introduction}</p>
        </div>
        {userPosts.length > 0 ? (
          <>
            <h2 className="text-lg font-bold mb-2">내가 작성한 게시물</h2>
            <ul className="list-disc ml-4">
              {userPosts.map((post) => (
                <Link to={`/main/post/${post.id}`} key={post.id}>
                  <li>{post.title}</li>
                </Link>
              ))}
            </ul>
          </>
        ) : (
          <p>작성한 게시물이 없습니다.</p>
        )}
        {user && user.email === userInfo?.email && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            onClick={logout}
          >
            로그아웃
          </button>
        )}
      </div>
    </div>
  );
}
