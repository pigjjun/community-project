import React, { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getStorage, getDownloadURL } from "firebase/storage";
import { db, app } from "../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { AuthContext } from "../ContextAPI/AuthContext";
import { LanguageContext } from "../ContextAPI/LanguageContext";

const categories = [
  "notice",
  "freetalk",
  "news",
  "tech",
  "sports",
  "game",
  "media",
  "cook",
  "daily",
  "fashion",
];

export default function Write() {
  const { register, handleSubmit, formState, reset } = useForm({
    mode: "onChange",
  });
  const [fileUrl, setFileUrl] = useState(null);
  const navigate = useNavigate();
  const { isValid } = formState;
  const { user, userData } = useContext(AuthContext);
  const { isEnglish } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(false);

  // 비로그인 유저 방지
  useEffect(() => {
    if (!userData) {
      navigate("/");
    }
  }, [userData, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const {
      category,
      title,
      content,
      file,
      video,
      voteLeft,
      voteLeftCount,
      voteRight,
      voteRightCount,
      voteNeutralCount,
      voteTotal,
    } = data;

    // Firebase Storage에 파일 업로드
    let imageUrls = [];
    if (data.file && data.file.length > 0) {
      for (let i = 0; i < data.file.length; i++) {
        const storageRef = ref(getStorage(app), `images/${data.file[i].name}`);
        await uploadBytes(storageRef, data.file[i]);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }
    }

    // Firebase Storage에 동영상 업로드
    let videoUrls = [];
    if (data.video && data.video.length > 0) {
      for (let i = 0; i < data.video.length; i++) {
        const storageRef = ref(getStorage(app), `videos/${data.video[i].name}`);
        await uploadBytes(storageRef, data.video[i]);
        const url = await getDownloadURL(storageRef);
        videoUrls.push(url);
      }
    }

    // Firebase Firestore에 데이터 저장
    const postData = {
      category,
      title,
      content,
      imageUrls,
      videoUrls,
      createdAt: new Date(),
      createdBy: user.uid,
      createdByUserId: userData.userId,
      voteLeft,
      voteLeftCount: 0,
      voteRight,
      voteRightCount: 0,
      voteNeutralCount: 0,
      voteTotal: 0,
    };
    await addDoc(collection(db, "posts"), postData);

    reset();
    navigate("/");
    setIsLoading(false);
  };

  return (
    <div className="px-4 pb-4 pt-100px min-h-screen bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <h1 className="text-3xl mt-4 font-bold text-black-theme-005 dark:text-white-theme-002 transition-all duration-500">
        {isEnglish ? "New Post" : "새 게시글 쓰기"}
      </h1>
      <form className="max-w-lg mx-auto p-8" onSubmit={handleSubmit(onSubmit)}>
        {/* 카테고리 */}
        <div className="mb-4">
          <label
            htmlFor="category"
            className="block font-bold mb-2 text-black-theme-004 dark:text-white-theme-004 transition-all duration-500"
          >
            {isEnglish ? "Category" : "카테고리"}
          </label>
          <select
            id="category"
            className="w-full px-3 py-2 bg-white-theme-000 dark:bg-black-theme-001 border-2 border-black-theme-003 dark:border-white-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-000 transition-all duration-500"
            {...register("category", { required: true })}
          >
            <option value="">
              {isEnglish ? "-- Choose --" : "-- 선택 --"}
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {formState.errors.category && (
            <p className="text-button-red-005 text-sm mt-2">
              {isEnglish
                ? "Please select a category"
                : "카테고리를 선택해주세요"}
            </p>
          )}
        </div>
        {/* 제목 */}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block font-bold mb-2 text-black-theme-004 dark:text-white-theme-004 transition-all duration-500"
          >
            {isEnglish ? "Title" : "제목"}
          </label>
          <input
            type="text"
            id="title"
            className="w-full px-3 py-2 bg-white-theme-000 dark:bg-black-theme-001 border-2 border-black-theme-003 dark:border-white-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-000 transition-all duration-500"
            {...register("title", { required: true })}
          />
          {formState.errors.title && (
            <p className="text-button-red-005 text-sm mt-2">
              {isEnglish ? "Please enter the title" : "제목을 입력해주세요"}
            </p>
          )}
        </div>
        {/* 내용 */}
        <div className="mb-4">
          <label
            htmlFor="content"
            className="block font-bold mb-2 text-black-theme-004 dark:text-white-theme-004 transition-all duration-500"
          >
            {isEnglish ? "Content" : "내용"}
          </label>
          <textarea
            id="contents"
            className="w-full px-3 py-2 bg-white-theme-000 dark:bg-black-theme-001 border-2 border-black-theme-003 dark:border-white-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-000 transition-all duration-500"
            rows="10"
            style={{ resize: "none" }}
            {...register("content", { required: true })}
          ></textarea>
          {formState.errors.content && (
            <p className="text-button-red-005 text-sm mt-2">
              {isEnglish ? "Please enter the contents" : "내용을 입력해주세요"}
            </p>
          )}
        </div>
        {/* 왼쪽버튼 */}
        <div className="mb-4">
          <label
            htmlFor="voteLeft"
            className="block font-bold mb-2 text-black-theme-004 dark:text-white-theme-004 transition-all duration-500"
          >
            {isEnglish ? "Left Button" : "왼쪽 버튼"}
          </label>
          <input
            type="text"
            id="voteLeft"
            className="w-full px-3 py-2 bg-white-theme-000 dark:bg-black-theme-001 border-2 border-black-theme-003 dark:border-white-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-000 transition-all duration-500"
            {...register("voteLeft", { required: true })}
          />
          {formState.errors.voteLeft && (
            <p className="text-button-red-005 text-sm mt-2">
              {isEnglish
                ? "Please enter the contents of the left button"
                : "왼쪽버튼 내용을 입력해주세요"}
            </p>
          )}
        </div>{" "}
        {/* 오른쪽 버튼 */}
        <div className="mb-4">
          <label
            htmlFor="voteRight"
            className="block font-bold mb-2 text-black-theme-004 dark:text-white-theme-004 transition-all duration-500"
          >
            {isEnglish ? "Right Button" : "오른쪽 버튼"}
          </label>
          <input
            type="text"
            id="voteRight"
            className="w-full px-3 py-2 bg-white-theme-000 dark:bg-black-theme-001 border-2 border-black-theme-003 dark:border-white-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-000 transition-all duration-500"
            {...register("voteRight", { required: true })}
          />
          {formState.errors.voteRight && (
            <p className="text-button-red-005 text-sm mt-2">
              {isEnglish
                ? "Please enter the contents of the right button"
                : "오른쪽버튼 내용을 입력해주세요"}
            </p>
          )}
        </div>{" "}
        {/* 첨부파일 */}
        <div className="mb-4">
          <label
            htmlFor="file"
            className="block font-bold mb-2 text-black-theme-004 dark:text-white-theme-004 transition-all duration-500"
          >
            {isEnglish ? "Attached file" : "사진 첨부"}
          </label>
          <input
            type="file"
            id="file"
            {...register("file")}
            multiple
            accept="image/*"
          />
        </div>
        {/* 첨부 동영상 */}
        <div className="mb-4">
          <label
            htmlFor="video"
            className="block font-bold mb-2 text-black-theme-004 dark:text-white-theme-004 transition-all duration-500"
          >
            {isEnglish ? "Attached video" : "동영상 첨부"}
          </label>
          <input
            type="file"
            id="video"
            {...register("video")}
            multiple
            accept="video/*"
          />
        </div>
        {/* 작성버튼 */}
        <div className="flex justify-end">
          <button
            className="w-full text-sm px-2 py-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="relative inset-0 flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            ) : (
              `${isEnglish ? "Post" : "작성하기"}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
