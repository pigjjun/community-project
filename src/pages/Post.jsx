import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
      });
      setPost((prevPost) => {
        return {
          ...prevPost,
          [field]: prevPost[field] + 1,
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

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 mb-4">{post.content}</p>
      <div className="flex justify-between items-center">
        <p className="text-gray-500">
          {post.createdAt.toDate().toLocaleString()}
        </p>
        <p className="text-black-theme-004">{postUserId}</p>
      </div>
      {post.imageUrl && (
        <div className="mt-4">
          <img src={post.imageUrl} alt="Post" className="w-full" />
        </div>
      )}
      <div className="flex justify-center my-4">
        <button
          className="mx-2"
          onClick={() => handleVoteClick("voteLeftCount")}
        >
          {post.voteLeft}
          {post.voteLeftCount}
        </button>
        <button className="mx-2" onClick={() => handleVoteClick("voteNeutral")}>
          {post.voteNeutral} 중립
        </button>
        <button
          className="mx-2"
          onClick={() => handleVoteClick("voteRightCount")}
        >
          {post.voteRightCount}
          {post.voteRight}
        </button>
      </div>
      {userData && userData.userId === postUserId && (
        <button onClick={handleDeleteClick}>Delete</button>
      )}{" "}
      {/* 댓글을 보여주는 부분 */}
      <h2 className="text-lg font-bold mb-2">{comments.length} 댓글</h2>
      {comments.map((comment) => (
        <div key={comment.id} className="border-b-2 mb-4 pb-4">
          <p className="text-gray-700 mb-2">{comment.content}</p>
          <p className="text-gray-500">
            {comment.createdAt.toDate().toLocaleString()}
          </p>
          <p className="text-gray-700 mb-2">{comment.createdBy}</p>
          {userData && userData.userId === comment.createdBy && (
            <button
              onClick={async () => {
                try {
                  await deleteDoc(doc(db, "posts", id, "comments", comment.id));
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              Delete
            </button>
          )}
        </div>
      ))}
      {/* 댓글 작성 폼 */}
      {userData && (
        <form onSubmit={handleCommentSubmit}>
          <label htmlFor="content" className="block mb-2">
            댓글 작성
          </label>
          <textarea
            name="content"
            id="content"
            rows="3"
            className="w-full mb-4"
          ></textarea>
          <button type="submit" className="py-2 px-4 bg-blue-500 text-white">
            작성
          </button>
        </form>
      )}
    </div>
  );
}
