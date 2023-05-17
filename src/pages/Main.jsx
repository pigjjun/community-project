import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase.config";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { CategoryContext } from "../ContextAPI/CategoryContext";
import { LanguageContext } from "../ContextAPI/LanguageContext";
import { AuthContext } from "../ContextAPI/AuthContext";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

export default function Main() {
  const { category, handleCategoryClick } = useContext(CategoryContext);
  const { isEnglish } = useContext(LanguageContext);
  const [sortBy, setSortBy] = useState("voteTotal");
  const [sortedPosts, setSortedPosts] = useState([]);
  const [topThreePosts, setTopThreePosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { isLoggedIn } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSortByClick = (sortBy) => {
    setSortBy(sortBy);
    setCurrentPage(1);
  };

  // 새 포스트 //
  const isNewPost = (createdAt) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const postDate = new Date(createdAt.toDate());
    return postDate > oneHourAgo;
  };
  // 새 포스트 끝 //

  // Top3 포스트 //
  const getTopThreePosts = async () => {
    const q = query(
      collection(db, "posts"),
      orderBy("voteTotal", "desc"),
      limit(3)
    );

    const querySnapshot = await getDocs(q);

    const topThreePosts = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    setTopThreePosts(topThreePosts);
  };

  useEffect(() => {
    getTopThreePosts();
  }, [category]);
  // Top3 포스트 끝 //

  return (
    <div className="flex flex-col pt-100px min-h-screen bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      {/* 인기글/최신글 */}
      <div className="flex min-w-max py-4 px-4 ml-32 justify-between content-center">
        <div className="flex justify-center">
          <button
            type="button"
            className={`block mr-3 py-2 px-4 rounded-lg ${
              sortBy === "voteTotal"
                ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold  transition-all duration-500"
                : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
            }`}
            onClick={() => handleSortByClick("voteTotal")}
          >
            {isEnglish ? "Popular" : "인기순"}
          </button>
          <button
            type="button"
            className={`block py-2 px-4 rounded-lg transition-all duration-500 ${
              sortBy === "createdAt"
                ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold  transition-all duration-500"
                : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
            }`}
            onClick={() => handleSortByClick("createdAt")}
          >
            {isEnglish ? "Latest" : "최신순"}
          </button>
        </div>
        {isLoggedIn && (
          <Link to="/main/write">
            <button className="block py-2 px-4 rounded-lg transition-all duration-500 bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500">
              {isEnglish ? "New Post" : "새 게시글"}
            </button>
          </Link>
        )}
      </div>
      <div className="flex">
        {/* 카테고리 */}
        <div className="flex px-4 justify-center">
          <div className="flex w-24 flex-col min-w-max content-center">
            <button
              type="button"
              className={`block mb-2 py-2 px-4 rounded-lg ${
                category === "all"
                  ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold  transition-all duration-500"
                  : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
              }`}
              onClick={() => handleCategoryClick("all")}
            >
              {isEnglish ? "All" : "전체"}
            </button>
            <button
              type="button"
              className={`block mb-2 py-2 px-4 rounded-lg ${
                category === "news"
                  ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold  transition-all duration-500"
                  : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
              }`}
              onClick={() => handleCategoryClick("news")}
            >
              {}
              {isEnglish ? "News" : "뉴스"}
            </button>
            <button
              type="button"
              className={`block mb-2 py-2 px-4 rounded-lg ${
                category === "tech"
                  ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold transition-all duration-500"
                  : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
              }`}
              onClick={() => handleCategoryClick("tech")}
            >
              {isEnglish ? "Tech" : "테크"}
            </button>
            <button
              type="button"
              className={`block mb-2 py-2 px-4 rounded-lg ${
                category === "sports"
                  ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold  transition-all duration-500"
                  : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
              }`}
              onClick={() => handleCategoryClick("sports")}
            >
              {isEnglish ? "Sports" : "스포츠"}
            </button>
            <button
              type="button"
              className={`block mb-2 py-2 px-4 rounded-lg ${
                category === "freetalk"
                  ? "bg-white-theme-007 text-white-theme-001 dark:bg-black-theme-003 dark:text-white-theme-002 font-bold  transition-all duration-500"
                  : "bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
              }`}
              onClick={() => handleCategoryClick("freetalk")}
            >
              {isEnglish ? "Free Talk" : "자유주제"}
            </button>
          </div>
        </div>
        {/* 게시글 목록  */}
        <div className="min-w-max w-full my-0 pr-4">
          {/* 맨 위 구분자 */}
          <div className="flex justify-between border-b-2 rounded-t-md text-black-theme-005 dark:text-white-theme-001 bg-white-theme-002 dark:bg-black-theme-002 border-black-theme-002 dark:border-white-theme-004 py-1 px-2 mb-2 transition-all duration-500">
            <div>{isEnglish ? "Title" : "제목"}</div>
            <div className="flex w-1/4 justify-between">
              <div>{isEnglish ? "User ID" : "아이디"}</div>
              <div>{isEnglish ? "Votes" : "투표수"}</div>
            </div>
          </div>
          {/* 리스트 */}
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <div
                key={post.id}
                className="border border-black-theme-002 dark:border-white-theme-004 py-1 px-2 rounded-md mb-2 transition-all duration-500"
              >
                <Link
                  to={`/main/post/${post.id}`}
                  className="flex justify-between"
                >
                  <div className="flex">
                    <div className="flex">
                      {/* Hot 로고 추가 */}
                      {topThreePosts.some((p) => p.id === post.id) && (
                        <div className="flex items-center mr-2">
                          <span className="text-button-red-005 text-xs font-bold animate-sparkle duration-250">
                            HOT
                          </span>
                        </div>
                      )}
                      {/* New 로고 추가 */}
                      {isNewPost(post.createdAt) && (
                        <div className="flex items-center mr-2">
                          <span className="text-button-blue-004 text-xs font-bold animate-sparkle duration-250">
                            NEW
                          </span>
                        </div>
                      )}
                    </div>
                    {/* 제목 */}
                    <div className="text-xl text-black-theme-004 dark:text-white-theme-002 place-self-center transition-all duration-500">
                      {post.title}
                    </div>
                  </div>
                  {/* 아이디, 투표수 */}
                  <div className="flex w-1/4 justify-between">
                    {/* 아이디 */}
                    <div className="text-sm text-button-neutral-003 dark:text-button-neutral-002 place-self-center transition-all duration-500">
                      {post.userData.userId}
                    </div>
                    {/* 투표수 */}
                    <div className="text-sm text-black-theme-003 dark:text-white-theme-002 place-self-center transition-all duration-500">
                      {post.voteTotal}
                    </div>
                  </div>
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
      <Pagination
        category={category}
        sortBy={sortBy}
        setSortedPosts={setSortedPosts}
        setCurrentPage={setCurrentPage}
      />
      {/* 검색창 */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isEnglish={isEnglish}
      />
    </div>
  );
}
