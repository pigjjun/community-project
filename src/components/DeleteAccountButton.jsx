import React from "react";
import { deleteUser, getAuth } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
import { db } from "../firebase.config";

export default function DeleteAccountButton({
  userInfo,
  userPosts,
  isEnglish,
  navigate,
}) {
  const deleteAccount = async () => {
    const userPostsRef = collection(db, "posts");
    const userRef = doc(db, "users", userInfo.uid);

    if (
      window.confirm(
        isEnglish
          ? "Are you sure you want to delete your account?"
          : "정말로 회원을 탈퇴하시겠습니까?"
      )
    ) {
      try {
        // Delete user's comments
        const allPostsQuery = query(collection(db, "posts"));
        const allPostsSnapshot = await getDocs(allPostsQuery);

        allPostsSnapshot.forEach(async (postDoc) => {
          const commentsRef = collection(userPostsRef, postDoc.id, "comments");
          const commentsQuery = query(
            commentsRef,
            where("createdBy", "==", userInfo.uid)
          );
          const commentsSnapshot = await getDocs(commentsQuery);

          commentsSnapshot.forEach(async (commentDoc) => {
            await deleteDoc(doc(commentsRef, commentDoc.id));
          });
        });

        // Delete user's posts
        for (const post of userPosts) {
          // Delete the post
          await deleteDoc(doc(userPostsRef, post.id));
        }

        // Delete user's account
        await deleteDoc(userRef);
        const auth = getAuth();
        await deleteUser(auth.currentUser);
        navigate("/user/login");
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  return (
    <button
      className="mt-4 bg-button-red-004 text-white-theme-000 text-sm font-bold mr-4 px-2 py-1 rounded-lg hover:bg-button-red-005 transition-all duration-250"
      onClick={deleteAccount}
    >
      {isEnglish ? "Delete Account" : "회원탈퇴"}
    </button>
  );
}
