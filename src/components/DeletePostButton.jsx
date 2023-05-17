import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "@firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase.config";

const DeletePostButton = ({ postUserId, id, isEnglish, currentUser }) => {
  const navigate = useNavigate();

  const deleteCommentsAndReplies = async (postId) => {
    const commentsQuery = query(
      collection(db, "comments"),
      where("postId", "==", postId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    const commentDeletionPromises = commentsSnapshot.docs.map(
      async (commentDoc) => {
        // Delete all replies in the comment
        const repliesQuery = query(
          collection(db, `comments/${commentDoc.id}/replies`)
        );
        const repliesSnapshot = await getDocs(repliesQuery);
        const replyDeletionPromises = repliesSnapshot.docs.map((replyDoc) =>
          deleteDoc(doc(db, `comments/${commentDoc.id}/replies/${replyDoc.id}`))
        );

        await Promise.all(replyDeletionPromises);

        // Delete the comment itself
        return deleteDoc(doc(db, `comments/${commentDoc.id}`));
      }
    );

    await Promise.all(commentDeletionPromises);
  };

  const handleDeleteClick = async () => {
    const deleteMessage = isEnglish
      ? "Are you sure you want to delete this post?"
      : "정말 삭제하시겠습니까?";
    if (window.confirm(deleteMessage)) {
      try {
        await deleteCommentsAndReplies(id);
        await deleteDoc(doc(db, "posts", id));
        navigate("/");
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    currentUser &&
    currentUser.userId === postUserId && (
      <button
        className="my-4 border rounded-lg text-white-theme-007 dark:text-black-theme-002 px-1 py-1  transition-all duration-500"
        onClick={handleDeleteClick}
      >
        {isEnglish ? "Delete" : "글 삭제하기"}
      </button>
    )
  );
};

export default DeletePostButton;
