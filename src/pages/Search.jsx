import React, { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase.config";
import { AuthContext } from "../ContextAPI/AuthContext";
import { LanguageContext } from "../ContextAPI/LanguageContext";

function Search() {
  const [searchParams] = useSearchParams();
  const [postResults, setPostResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const { userData } = useContext(AuthContext);
  const { isEnglish } = useContext(LanguageContext);

  useEffect(() => {
    const fetchSearchResults = async () => {
      const queryTerm = searchParams.get("query");
      const nextTerm =
        queryTerm.slice(0, -1) +
        String.fromCharCode(queryTerm.charCodeAt(queryTerm.length - 1) + 1);

      const postsQuery = query(
        collection(db, "posts"),
        orderBy("title"),
        where("title", ">=", queryTerm),
        where("title", "<", nextTerm)
      );
      const usersQuery = query(
        collection(db, "users"),
        orderBy("userId"),
        where("userId", ">=", queryTerm),
        where("userId", "<", nextTerm)
      );
      const createdByUserIdPostsQuery = query(
        collection(db, "posts"),
        orderBy("createdByUserId"),
        where("createdByUserId", ">=", queryTerm),
        where("createdByUserId", "<", nextTerm)
      );

      const postDocs = await getDocs(postsQuery);
      const userDocs = await getDocs(usersQuery);
      const createdByUserIdPostDocs = await getDocs(createdByUserIdPostsQuery);

      setPostResults(
        [...postDocs.docs, ...createdByUserIdPostDocs.docs].map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setUserResults(
        userDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    fetchSearchResults();
  }, [searchParams, userData]);

  return (
    <div className="pt-88px min-h-screen bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <div className="flex min-w-max py-4 px-4 justify-center content-center">
        <h1 className="font-bold text-2xl text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
          {isEnglish ? "Search Results" : "검색결과"}
        </h1>
      </div>

      <div className="w-2/3 mx-auto min-w-max py-4 px-4 justify-between content-center border-2 rounded-lg mb-6 border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
        {/* Posts */}
        <h2 className="font-bold text-xl mb-4 text-black-theme-003 dark:text-white-theme-001 transition-all duration-500">
          {isEnglish ? "Posts" : "게시물"}
        </h2>
        {postResults.length > 0 ? (
          <ul>
            {postResults.map((post) => (
              <li key={post.id}>
                <div className="border border-black-theme-002 dark:border-white-theme-004 py-1 px-2 rounded-lg mb-4 transition-all duration-500">
                  <Link to={`/main/post/${post.id}`} className="text-center">
                    <div className="text-xl text-black-theme-004 dark:text-white-theme-002 place-self-center transition-all duration-500">
                      {post.title}
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
            {isEnglish ? "No posts found" : "게시물을 찾을 수 없습니다"}
          </p>
        )}
      </div>

      <div className="w-2/3 mx-auto min-w-max py-4 px-4 justify-between content-center border-2 rounded-lg mb-6 border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
        {/* Users */}
        <h2 className="font-bold text-xl mb-4 text-black-theme-003 dark:text-white-theme-001 transition-all duration-500">
          {isEnglish ? "Users" : "유저"}
        </h2>
        {userResults.length > 0 ? (
          <ul>
            {userResults.map((user) => (
              <li key={user.id}>
                <div className="border border-black-theme-002 dark:border-white-theme-004 py-1 px-2 rounded-lg mb-2 transition-all duration-500">
                  <Link
                    to={`/user/profile/${user.userId}`}
                    className="text-center"
                  >
                    <div className="text-xl text-black-theme-004 dark:text-white-theme-002 place-self-center transition-all duration-500">
                      {user.userId}
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
            {isEnglish ? "No users found" : "유저를 찾을 수 없습니다"}
          </p>
        )}
      </div>
    </div>
  );
}
export default Search;
