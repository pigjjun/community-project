import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase.config";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { AuthContext } from "../ContextAPI/AuthContext";
import { LanguageContext } from "../ContextAPI/LanguageContext";
import DeletePostButton from "../components/DeletePostButton";
import VoteButtons from "../components/VoteButton";
import CommentForm from "../components/CommentForm";
import CommentArea from "../components/CommentArea";

export default function Post() {
  const { id } = useParams();
  const { userData } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [postUserId, setPostUserId] = useState("");
  const [comments, setComments] = useState([]);
  const { isEnglish } = useContext(LanguageContext);
  const [editedComment, setEditedComment] = useState({ id: "", content: "" });
  const [postUserPhotoURL, setPostUserPhotoURL] = useState("");
  const [replyComments, setReplyComments] = useState({});
  const [editedReply, setEditedReply] = useState({
    commentId: "",
    replyId: "",
    content: "",
  });
  const [replyOpen, setReplyOpen] = useState(false);

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
          setPostUserPhotoURL(postUserDoc.data().photoURL);
        }
      }
    };
    getPost();

    // 댓글 쿼리 //
    const commentsRef = collection(db, "posts", id, "comments");
    const q = query(commentsRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [id]);

  // 투표 업데이트 //
  const handleVoteUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

  // 댓글 작성 //
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
        photoURL: userData.photoURL,
        likes: [],
      };
      await addDoc(collection(db, "posts", id, "comments"), newComment);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  // 댓글 수정창 열기 //
  const handleEditClick = (comment) => {
    setEditedComment({ id: comment.id, content: comment.content });
  };

  // 댓글 수정 //
  const handleCommentUpdate = async (e) => {
    e.preventDefault();
    const updateConfirmMessage = isEnglish
      ? "Are you sure you want to update this comment?"
      : "댓글을 수정하시겠습니까?";
    if (window.confirm(updateConfirmMessage)) {
      try {
        const commentRef = doc(db, "posts", id, "comments", editedComment.id);
        await updateDoc(commentRef, { content: editedComment.content });
        setEditedComment({ id: "", content: "" });
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 댓글 삭제 //
  const handleDeleteComment = async (commentId) => {
    const deleteCommentMessage = isEnglish
      ? "Are you sure you want to delete this comment?"
      : "댓글을 삭제하시겠습니까?";

    if (window.confirm(deleteCommentMessage)) {
      try {
        const repliesSnapshot = await getDocs(
          collection(db, "posts", id, "comments", commentId, "replies")
        );

        const deletePromises = repliesSnapshot.docs.map((replyDoc) =>
          deleteDoc(replyDoc.ref)
        );

        await Promise.all(deletePromises);

        await deleteDoc(doc(db, "posts", id, "comments", commentId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 댓글 좋아요 //
  const handleLikeClick = async (commentId) => {
    const commentRef = doc(db, "posts", id, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();
    const userId = userData.userId;

    let newLikes;
    if (commentData.likes.includes(userId)) {
      // 이미 좋아요를 눌렀다면
      newLikes = commentData.likes.filter((id) => id !== userId); // 좋아요 취소
    } else {
      // 좋아요를 누르지 않았다면
      newLikes = [...commentData.likes, userId]; // 좋아요 추가
    }

    await updateDoc(commentRef, { likes: newLikes });

    const likeButton = document.getElementById(`likeButton_${commentId}`);
    if (likeButton) {
      if (newLikes.includes(userId)) {
        likeButton.classList.add("bg-button-red-005");
      } else {
        likeButton.classList.remove("bg-button-red-005");
      }
    }
  };

  // 대댓글 //
  useEffect(() => {
    comments.forEach((comment) => {
      const replyCommentsRef = collection(
        db,
        "posts",
        id,
        "comments",
        comment.id,
        "replies"
      );
      const q = query(replyCommentsRef, orderBy("createdAt"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const replyCommentsData = [];
        querySnapshot.forEach((doc) => {
          replyCommentsData.push({ id: doc.id, ...doc.data() });
        });
        setReplyComments((prev) => ({
          ...prev,
          [comment.id]: replyCommentsData,
        }));
      });

      return () => unsubscribe();
    });
  }, [comments]);

  // 대댓글 작성 //
  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    const form = e.target;
    const content = form.content.value;
    if (!content) {
      return;
    }
    try {
      const newComment = {
        content,
        createdBy: userData.userId,
        createdAt: new Date(),
        photoURL: userData.photoURL,
        likes: [],
      };
      await addDoc(
        collection(db, "posts", id, "comments", commentId, "replies"),
        newComment
      );
      form.reset();
    } catch (error) {
      console.error(error);
    }
    setReplyOpen(false);
  };

  const handleReplEditClick = (commentId, reply) => {
    setEditedReply({ commentId, replyId: reply.id, content: reply.content });
  };

  // 대댓글 수정 //
  const handleReplyUpdate = async (e) => {
    e.preventDefault();
    const updateConfirmMessage = isEnglish
      ? "Are you sure you want to update this reply?"
      : "대댓글을 수정하시겠습니까?";
    if (window.confirm(updateConfirmMessage)) {
      try {
        const replyRef = doc(
          db,
          "posts",
          id,
          "comments",
          editedReply.commentId,
          "replies",
          editedReply.replyId
        );
        await updateDoc(replyRef, { content: editedReply.content });
        setEditedReply({ commentId: "", replyId: "", content: "" });
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 대댓글 삭제 //
  const handleDeleteReply = async (commentId, replyId) => {
    const deleteReplyMessage = isEnglish
      ? "Are you sure you want to delete this reply?"
      : "대댓글을 삭제하시겠습니까?";
    if (window.confirm(deleteReplyMessage)) {
      try {
        await deleteDoc(
          doc(db, "posts", id, "comments", commentId, "replies", replyId)
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 대댓글 좋아요 //
  const handleReplyLikeClick = async (commentId, replyCommentId) => {
    const replyCommentRef = doc(
      db,
      "posts",
      id,
      "comments",
      commentId,
      "replies",
      replyCommentId
    );
    const replyCommentSnap = await getDoc(replyCommentRef);
    const replyCommentData = replyCommentSnap.data();
    const userId = userData.userId;

    let newLikes;
    if (replyCommentData.likes.includes(userId)) {
      // 이미 좋아요를 눌렀다면
      newLikes = replyCommentData.likes.filter((id) => id !== userId); // 좋아요 취소
    } else {
      // 좋아요를 누르지 않았다면
      newLikes = [...replyCommentData.likes, userId]; // 좋아요 추가
    }

    await updateDoc(replyCommentRef, { likes: newLikes });

    const likeButton = document.getElementById(`likeButton_${replyCommentId}`);
    if (likeButton) {
      if (newLikes.includes(userId)) {
        likeButton.classList.add("bg-button-red-005");
      } else {
        likeButton.classList.remove("bg-button-red-005");
      }
    }
  };

  if (!post) {
    return <div>{isEnglish ? "Loading..." : "로딩 중..."}</div>;
  }

  return (
    <div className="px-4 pb-4 pt-100px min-h-screen bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      {/* 삭제버튼(작성자일때) */}
      <div className="text-sm text-right">
        <DeletePostButton
          postUserId={postUserId}
          id={id}
          isEnglish={isEnglish}
          currentUser={userData}
        />
      </div>
      {/* 제목, 작성자 */}
      <div className="flex justify-between mb-2 items-center">
        <span className="text-2xl font-bold text-black-theme-004 dark:text-white-theme-001 transition-all duration-500">
          {post.title}
        </span>
        <Link to={`/user/profile/${postUserId}`}>
          <div className="flex items-center">
            <img
              src={
                postUserPhotoURL
                  ? postUserPhotoURL
                  : "https://firebasestorage.googleapis.com/v0/b/pigjjun-sub.appspot.com/o/profilePictures%2FUser-Profile-Icon.svg?alt=media"
              }
              alt={postUserId}
              className="w-4 h-4 rounded-full mr-1"
            />
            <span className="text-sm border-b-2 text-button-neutral-004 dark:text-button-neutral-002 place-self-center transition-all duration-500">
              {postUserId}
            </span>
          </div>
        </Link>
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
      <p className="text-left my-8 whitespace-pre-wrap">{post.content}</p>
      {/* 이미지 */}
      {post.imageUrls &&
        post.imageUrls.map((url, index) => (
          <div key={index} className="my-6 flex justify-center">
            <img src={url} alt={`Post ${index}`} className="max-w-2/5" />
          </div>
        ))}
      {/* 동영상 */}
      {post.videoUrls &&
        post.videoUrls.map((url, index) => (
          <div key={index} className="my-6 flex justify-center">
            <video controls src={url} className="max-w-2/5" />
          </div>
        ))}
      {/* 찬반버튼 */}
      {
        <VoteButtons
          post={post}
          isEnglish={isEnglish}
          handleVoteUpdate={handleVoteUpdate}
        />
      }

      {/* 댓글 부분 */}
      <div className="border-t-2 border-white-theme-003 dark:border-black-theme-003 border-solid transition-all duration-500">
        <p className="text-lg text-left text-black-theme-005 dark:text-black-theme-000 font-bold py-4 mb-4 border-b-2 border-white-theme-003 dark:border-black-theme-003 border-solid transition-all duration-500">
          {isEnglish
            ? `${comments.length} comments`
            : `댓글 ${comments.length} 개`}
        </p>
        {comments.map((comment) => (
          <CommentArea
            key={comment.id}
            comment={comment}
            handleDeleteComment={handleDeleteComment}
            handleEditClick={handleEditClick}
            handleCommentUpdate={handleCommentUpdate}
            handleLikeClick={handleLikeClick}
            userData={userData}
            editedComment={editedComment}
            setEditedComment={setEditedComment}
            isEnglish={isEnglish}
            handleReplySubmit={handleReplySubmit}
            handleReplyEditClick={handleReplEditClick}
            handleReplyUpdate={handleReplyUpdate}
            handleDeleteReply={handleDeleteReply}
            handleReplyLikeClick={handleReplyLikeClick}
            editedReply={editedReply}
            setEditedReply={setEditedReply}
            replyComments={replyComments}
            setReplyOpen={setReplyOpen}
            replyOpen={replyOpen}
          />
        ))}
      </div>
      {/* 댓글 작성 폼 */}
      {!editedComment.id && userData && (
        <CommentForm onSubmit={handleCommentSubmit} isEnglish={isEnglish} />
      )}
    </div>
  );
}
