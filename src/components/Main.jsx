import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase.config";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { CategoryContext } from "../ContextAPI/CategoryContext";
import { LanguageContext } from "../ContextAPI/LanguageContext";

export default function Main() {
  const { category, handleCategoryClick } = useContext(CategoryContext);
  const { isEnglish } = useContext(LanguageContext);
  const [sortBy, setSortBy] = useState("voteTotal");
  const [sortedPosts, setSortedPosts] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      let q = collection(db, "posts");
      if (category !== "all") {
        q = query(q, where("category", "==", category));
      }
      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const newPosts = querySnapshot.docs.map(async (document) => {
            const postUserId = document.data().createdBy;
            const userRef = doc(db, "users", postUserId);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();
            return {
              id: document.id,
              ...document.data(),
              postUserId,
              userData,
            };
          });
          Promise.all(newPosts).then((result) => {
            // 선택된 정렬 방식에 따라 게시글을 정렬합니다
            const sorted = result.sort((a, b) => {
              if (sortBy === "voteTotal") {
                return b.voteTotal - a.voteTotal;
              } else {
                return b.createdAt.seconds - a.createdAt.seconds;
              }
            });
            setSortedPosts(sorted);
          });
        } else {
          setSortedPosts([]);
        }
      } catch (error) {
        console.log("Error getting documents: ", error);
      }
    };
    getPosts();
  }, [category, sortBy]);
  return (
    <div className="flex flex-col pt-88px min-h-screen bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      {/* 인기글/최신글 */}
      <div className="flex min-w-max py-4 px-4 justify-between content-center">
        <div className="flex justify-center">
          <button
            type="button"
            className={`block mr-3 py-2 px-4 rounded-lg transition-all duration-500 ${
              sortBy === "voteTotal"
                ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold"
                : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
            }`}
            onClick={() => setSortBy("voteTotal")}
          >
            {isEnglish ? "Popular" : "인기순"}
          </button>
          <button
            type="button"
            className={`block py-2 px-4 rounded-lg transition-all duration-500 ${
              sortBy === "createdAt"
                ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold"
                : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
            }`}
            onClick={() => setSortBy("createdAt")}
          >
            {isEnglish ? "Latest" : "최신순"}
          </button>
        </div>
        <button className="block py-2 px-4 rounded-lg transition-all duration-500 bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500">
          <Link to="/main/write">{isEnglish ? "New Post" : "새 게시글"}</Link>
        </button>
      </div>
      <div className="flex">
        {/* 카테고리 */}
        <div className="flex px-4 justify-center">
          <div className="flex w-24 flex-col min-w-max content-center">
            <button
              type="button"
              className={`block mb-2 py-2 px-4 rounded-lg transition-all duration-500 ${
                category === "all"
                  ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold"
                  : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
              }`}
              onClick={() => handleCategoryClick("all")}
            >
              {isEnglish ? "All" : "전체"}
            </button>
            <button
              type="button"
              className={`block mb-2 py-2 px-4 rounded-lg transition-all duration-500 ${
                category === "news"
                  ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold"
                  : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
              }`}
              onClick={() => handleCategoryClick("news")}
            >
              {}
              {isEnglish ? "News" : "뉴스"}
            </button>
            <button
              type="button"
              className={`block mb-2 py-2 px-4 rounded-lg transition-all duration-500 ${
                category === "tech"
                  ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold"
                  : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
              }`}
              onClick={() => handleCategoryClick("tech")}
            >
              {isEnglish ? "Tech" : "테크"}
            </button>
            <button
              type="button"
              className={`block mb-2 py-2 px-4 rounded-lg transition-all duration-500 ${
                category === "sports"
                  ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold"
                  : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
              }`}
              onClick={() => handleCategoryClick("sports")}
            >
              {isEnglish ? "Sports" : "스포츠"}
            </button>
          </div>
        </div>
        {/* 게시글 목록  */}
        <div className="min-w-max w-full my-0 pr-4">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <div
                key={post.id}
                className="border border-black-theme-002 dark:border-white-theme-004 py-1 px-2 rounded-md mb-2"
              >
                <Link
                  to={`/main/post/${post.id}`}
                  className="flex justify-between"
                >
                  <span className="text-xl text-black-theme-004 dark:text-white-theme-002 place-self-center">
                    {post.title}
                  </span>
                  <span className="text-sm text-button-neutral-003 dark:text-button-neutral-002 place-self-center">
                    {post.userData.userId}
                  </span>
                </Link>
              </div>
            ))
          ) : (
            <span className="text-center text-gray-500 text-2xl font-bold">
              {isEnglish ? "No posts available" : "게시글이 없습니다"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
