import React, { useState, useContext } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { LanguageContext } from "../ContextAPI/LanguageContext";

export default function PostEdit(post, currentUser, postUserId, id) {
  // 게시글 수정 폼의 상태를 관리
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState(null);
  const { isEnglish } = useContext(LanguageContext);

  // 게시글 수정 함수
  const handlePostUpdate = async (e) => {
    e.preventDefault();
    const updateConfirmMessage = isEnglish
      ? "Are you sure you want to update this post?"
      : "게시글을 수정하시겠습니까?";
    if (window.confirm(updateConfirmMessage)) {
      let newImageUrl = post.imageUrl;
      if (newImage) {
        newImageUrl = await uploadImage(newImage);
      }
      try {
        const postRef = doc(db, "posts", id);
        await updateDoc(postRef, {
          title: newTitle || post.title,
          content: newContent || post.content,
          imageUrl: newImageUrl,
        });
        setIsEditing(false);
        setNewTitle("");
        setNewContent("");
        setNewImage(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const uploadImage = async (imageFile) => {
    const storage = getStorage();
    const storageRef = ref(storage, "images/" + imageFile.name);

    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // progress function
        },
        (error) => {
          // error function
          reject(error);
        },
        () => {
          // complete function
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handlePostUpdate}>
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-2 py-1 rounded-lg text-black-theme-005 border border-black-theme-001 mb-2"
            />
            <textarea
              placeholder="Content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-2 py-1 rounded-lg text-black-theme-005 border border-black-theme-001 mb-2"
              rows={5}
              style={{ resize: "none" }}
            />
            <input
              type="file"
              onChange={(e) => setNewImage(e.target.files[0])}
              className="w-full px-2 py-1 rounded-lg text-black-theme-005 border border-black-theme-001 mb-2"
            />
            <div className="flex">
              <button
                type="submit"
                className="my-4 mr-2 border rounded-lg text-white-theme-007 dark:text-black-theme-002 px-1 py-1  transition-all duration-500"
              >
                {isEnglish ? "Update" : "수정하기"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="my-4 border rounded-lg text-white-theme-007 dark:text-black-theme-002 px-1 py-1  transition-all duration-500"
              >
                {isEnglish ? "Cancel" : "취소하기"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <h1>{post.title}</h1>
          <p>{post.content}</p>
          {post.imageUrl && <img src={post.imageUrl} alt="Post" />}
          {currentUser && currentUser.userId === postUserId && (
            <button
              className="my-4 border rounded-lg text-white-theme-007 dark:text-black-theme-002 px-1 py-1  transition-all duration-500"
              onClick={() => {
                setIsEditing(true);
                setNewTitle(post.title);
                setNewContent(post.content);
              }}
            >
              {isEnglish ? "Edit" : "수정하기"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
