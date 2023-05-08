import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase.config";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  increment,
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { AuthContext } from "../ContextAPI/AuthContext";
import { LanguageContext } from "../ContextAPI/LanguageContext";

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [postUserId, setPostUserId] = useState("");
  const [comments, setComments] = useState([]);
  const { isEnglish } = useContext(LanguageContext);
  const [editedComment, setEditedComment] = useState({ id: "", content: "" });

  useEffect(() => {
    const getPost = async () => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost(docSnap.data());
        const postUserRef = doc(db, "users", docSnap.data().createdBy);
        const postUserDoc = await getDoc(postUserRef);
        if (postUserDoc.exists()) {
          setPostUserId(postUserDoc.data().userId);
        }
      }
    };
    getPost();

    // 댓글을 가져오기 위한 실시간 쿼리를 추가합니다.
    const commentsRef = collection(db, "posts", id, "comments");
    const q = query(commentsRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });
      setComments(commentsData);
    });

    // useEffect 내에서 unsubscribe 함수를 반환합니다.
    return () => unsubscribe();
  }, [id]);

  const handleDeleteClick = async () => {
    const deleteMessage = isEnglish
      ? "Are you sure you want to delete this post?"
      : "정말 삭제하시겠습니까?";
    if (window.confirm(deleteMessage)) {
      try {
        await deleteDoc(doc(db, "posts", id));
        navigate("/");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleVoteClick = async (field) => {
    try {
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        [field]: increment(1),
        voteTotal: increment(1),
      });
      setPost((prevPost) => {
        return {
          ...prevPost,
          [field]: prevPost[field] + 1,
          voteTotal: prevPost.voteTotal + 1,
        };
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const content = e.target.content.value;
    if (!content) {
      return;
    }
    try {
      const newComment = {
        content,
        createdBy: userData.userId,
        createdAt: new Date(),
      };
      await addDoc(collection(db, "posts", id, "comments"), newComment);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (comment) => {
    setEditedComment({ id: comment.id, content: comment.content });
  };

  const handleCommentUpdate = async (e) => {
    e.preventDefault();
    try {
      const commentRef = doc(db, "posts", id, "comments", editedComment.id);
      await updateDoc(commentRef, { content: editedComment.content });
      setEditedComment({ id: "", content: "" });
    } catch (error) {
      console.error(error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 pb-4 pt-92px min-h-screen bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      {/* 삭제버튼(작성자일때) */}
      <div className="text-sm text-right">
        {userData && userData.userId === postUserId && (
          <button
            className="border rounded-lg text-white-theme-007 dark:text-black-theme-002 px-1 py-1  transition-all duration-500"
            onClick={handleDeleteClick}
          >
            {isEnglish ? "Delete" : "글 삭제하기"}
          </button>
        )}{" "}
      </div>
      {/* 제목, 작성자 */}
      <div className="flex justify-between mb-2 items-center">
        <span className="text-2xl font-bold text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
          {post.title}
        </span>
        <span className="text-sm border-b-2 text-button-neutral-004 dark:text-button-neutral-002 place-self-center transition-all duration-500">
          <Link to={`/user/profile/${postUserId}`}>{postUserId}</Link>
        </span>
      </div>
      {/* 작성일, 투표수 */}
      <div className="flex justify-between pb-4 items-center border-b-8 border-white-theme-003 dark:border-black-theme-003 border-dashed transition-all duration-500">
        <span className="text-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
          {isEnglish
            ? `${post.createdAt.toDate().toLocaleString("en-GB")}`
            : `${post.createdAt.toDate().toLocaleString("ko-KR")}`}
        </span>
        <span className="text-sm text-button-neutral-004 dark:text-button-neutral-002 place-self-center transition-all duration-500">
          {isEnglish ? "Votes" : "투표수"} : {post.voteTotal}
        </span>
      </div>
      {/* 본문 */}
      <p className="text-left my-8">{post.content}</p>
      {/* 이미지 */}
      {post.imageUrl && (
        <div className="my-6 flex justify-center">
          <img src={post.imageUrl} alt="Post" className="w-2/5" />
        </div>
      )}
      {/* 찬반버튼 */}
      <div className="flex min-h-max justify-between pt-6 mb-40">
        <button
          className="min-w-max py-2 px-2 rounded-l-xl text-black-theme-005 dark:text-white-theme-000 bg-button-red-003 dark:bg-button-red-004 hover:bg-button-red-004 dark:hover:bg-button-red-005 hover:scale-105 transition-all duration-250"
          style={{
            width: `${
              ((post.voteLeftCount + 1) / (post.voteTotal + 1)) * 100
            }%`,
          }}
          onClick={() => handleVoteClick("voteLeftCount")}
        >
          {post.voteLeft} {post.voteLeftCount}
        </button>
        <button
          className="min-w-max py-2 px-2 text-black-theme-005 dark:text-white-theme-000 bg-button-neutral-003 dark:bg-button-neutral-004 hover:bg-button-neutral-004 dark:hover:bg-button-neutral-005 hover:scale-105 transition-all duration-250"
          style={{
            width: `${
              ((post.voteNeutralCount + 1) / (post.voteTotal + 1)) * 100
            }%`,
          }}
          onClick={() => handleVoteClick("voteNeutralCount")}
        >
          {post.voteNeutralCount} 중립
        </button>
        <button
          className="min-w-max py-2 px-2 rounded-r-xl text-black-theme-005 dark:text-white-theme-000 bg-button-blue-003 dark:bg-button-blue-004 hover:bg-button-blue-004 dark:hover:bg-button-blue-005 hover:scale-105 transition-all duration-250"
          style={{
            width: `${
              ((post.voteRightCount + 1) / (post.voteTotal + 1)) * 100
            }%`,
          }}
          onClick={() => handleVoteClick("voteRightCount")}
        >
          {post.voteRightCount} {post.voteRight}
        </button>
      </div>

      {/* 댓글 부분 */}
      <div className="border-t-2 border-white-theme-003 dark:border-black-theme-003 border-solid transition-all duration-500">
        <p className="text-lg text-left text-black-theme-005 dark:text-black-theme-000 font-bold py-4 mb-4 border-b-2 border-white-theme-003 dark:border-black-theme-003 border-solid transition-all duration-500">
          {isEnglish
            ? `${comments.length} comments`
            : `댓글 ${comments.length} 개`}
        </p>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border-b-2 border-white-theme-006 dark:border-black-theme-002 border-dotted mb-4 transition-all duration-500"
          >
            <div className="flex justify-between">
              <span className="text-md border-b-2 mb-2 text-button-neutral-004 dark:text-button-neutral-002 place-self-center transition-all duration-500">
                <Link to={`/user/profile/${comment.createdBy}`}>
                  {comment.createdBy}
                </Link>
              </span>
              <span className="text-right text-black-theme-005 dark:text-black-theme-000 transition-all duration-500">
                {isEnglish
                  ? `${comment.createdAt.toDate().toLocaleString("en-GB")}`
                  : `${comment.createdAt.toDate().toLocaleString("ko-KR")}`}
              </span>
            </div>
            <p className="text-left mb-4 text-black-theme-005 dark:text-black-theme-000 transition-all duration-500">
              {comment.content}
            </p>
            {userData && userData.userId === comment.createdBy && (
              <div className="text-right">
                <button
                  className="text-sm px-1 py-1 mb-2 mr-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
                  onClick={async () => {
                    try {
                      await deleteDoc(
                        doc(db, "posts", id, "comments", comment.id)
                      );
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                >
                  {isEnglish ? "Delete" : "삭제하기"}
                </button>
                <button
                  className="text-sm px-1 py-1 mb-2 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
                  onClick={() => handleEditClick(comment)}
                >
                  {isEnglish ? "Edit" : "수정하기"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* 댓글 작성 폼 */}
      {!editedComment.id && userData && (
        <form onSubmit={handleCommentSubmit}>
          <div className="flex">
            <label htmlFor="content" className="block mb-2"></label>
            <textarea
              name="content"
              id="content"
              rows="2"
              className="w-full px-2 py-1 rounded-l-lg text-black-theme-005 border-r-0 border border-black-theme-001"
            ></textarea>
            <button
              type="submit"
              className="min-w-max rounded-r-lg max-h-max py-1 px-2 text-black-theme-005 bg-button-neutral-003 dark:text-white-theme-000 dark:bg-button-neutral-004 border-l-0 border border-black-theme-001 transition-all duration-500"
            >
              {isEnglish ? "Add" : "작성"}
            </button>
          </div>
        </form>
      )}
      {/* 댓글 수정 폼 */}
      {editedComment.id && (
        <form onSubmit={handleCommentUpdate}>
          <div className="flex">
            <label htmlFor="editContent" className="block mb-2"></label>
            <textarea
              name="editContent"
              id="editContent"
              rows="2"
              className="w-full px-2 py-1 rounded-l-lg text-black-theme-005 border-r-0 border border-black-theme-001"
              value={editedComment.content}
              onChange={(e) =>
                setEditedComment({ ...editedComment, content: e.target.value })
              }
            ></textarea>
            <button
              type="submit"
              className="min-w-max rounded-r-lg max-h-max py-1 px-2 text-black-theme-005 bg-button-neutral-003 dark:text-white-theme-000 dark:bg-button-neutral-004 border-l-0 border border-black-theme-001 transition-all duration-500"
            >
              {isEnglish ? "Update" : "수정"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
