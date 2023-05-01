import React from "react";

import { useState, useEffect } from "react";

function Main() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    // 서버에서 글 목록을 가져오는 API 호출
    // 호출 결과를 setPosts로 상태 업데이트
    const fetchedPosts = [
      { id: 1, title: "첫 번째 글", content: "첫 번째 글의 내용입니다." },
      { id: 2, title: "두 번째 글", content: "두 번째 글의 내용입니다." },
      { id: 3, title: "세 번째 글", content: "세 번째 글의 내용입니다." },
      { id: 4, title: "네 번째 글", content: "네 번째 글의 내용입니다." },
    ];
    setPosts(fetchedPosts);
  }, []);

  function handleCategoryClick(newCategory) {
    setCategory(newCategory);
  }

  const filteredPosts =
    category === "all"
      ? posts
      : posts.filter((post) => post.category === category);

  return (
    <div>
      <div>
        <button type="button" onClick={() => handleCategoryClick("all")}>
          전체
        </button>
        <button type="button" onClick={() => handleCategoryClick("category1")}>
          카테고리1
        </button>
        <button type="button" onClick={() => handleCategoryClick("category2")}>
          카테고리2
        </button>
        <button type="button" onClick={() => handleCategoryClick("category3")}>
          카테고리3
        </button>
      </div>
      <div>
        {filteredPosts.map((post) => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Main;
