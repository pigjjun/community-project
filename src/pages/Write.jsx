import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes } from "firebase/storage";
import { db, app } from "../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { AuthContext } from "../ContextAPI/AuthContext";

const categories = ["news", "tech", "sports"];

export default function Write() {
  const { register, handleSubmit, formState, reset } = useForm({
    mode: "onChange",
  });
  const [fileUrl, setFileUrl] = useState(null);
  const navigate = useNavigate();
  const { isValid } = formState;
  const { user } = useContext(AuthContext);

  const onSubmit = async (data) => {
    const {
      category,
      title,
      content,
      file,
      voteLeft,
      voteLeftCount,
      voteRight,
      voteRightCount,
      voteNeutral,
    } = data;

    // Firebase Storage에 파일 업로드
    let imageUrl = "";
    if (file) {
      const storageRef = ref(app, `images/${file[0].name}`);
      await uploadBytes(storageRef, file[0]).then(async (snapshot) => {
        imageUrl = await snapshot.ref.getDownloadURL();
      });
    }

    // Firebase Firestore에 데이터 저장
    const postData = {
      category,
      title,
      content,
      imageUrl,
      createdAt: new Date(),
      createdBy: user.uid,
      voteLeft,
      voteLeftCount: 0,
      voteRight,
      voteRightCount: 0,
      voteNeutral: 0,
    };
    await addDoc(collection(db, "posts"), postData);

    reset();
    navigate("/");
  };
  return (
    <div className="min-h-screen min-w-max flex justify-center bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <h1 className="text-3xl font-bold mb-6">새 게시글 쓰기</h1>
      <form
        className="max-w-lg w-full p-8 bg-white shadow-md rounded-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-4">
          <label
            htmlFor="category"
            className="block text-gray-700 font-bold mb-2"
          >
            카테고리:
          </label>
          <select
            id="category"
            className="w-full px-3 py-2 border rounded-lg border-gray-400"
            {...register("category", { required: true })}
          >
            <option value="">-- 선택 --</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {formState.errors.category && (
            <p className="text-red-500 text-sm mt-2">
              카테고리를 선택해주세요.
            </p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
            제목:
          </label>
          <input
            type="text"
            id="title"
            className="w-full px-3 py-2 border rounded-lg border-gray-400"
            {...register("title", { required: true })}
          />
          {formState.errors.title && (
            <p className="text-red-500 text-sm mt-2">제목을 입력해주세요.</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-gray-700 font-bold mb-2"
          >
            내용:
          </label>
          <textarea
            id="content"
            className="w-full px-3 py-2 border rounded-lg border-gray-400"
            rows="10"
            {...register("content", { required: true })}
          ></textarea>
          {formState.errors.content && (
            <p className="text-red-500 text-sm mt-2">내용을 입력해주세요.</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="voteLeft"
            className="block text-gray-700 font-bold mb-2"
          >
            왼쪽 버튼:
          </label>
          <input
            type="text"
            id="voteLeft"
            className="w-full px-3 py-2 border rounded-lg border-gray-400"
            {...register("voteLeft", { required: true })}
          />
          {formState.errors.voteLeft && (
            <p className="text-red-500 text-sm mt-2">
              왼쪽버튼 내용을 입력해주세요.
            </p>
          )}
        </div>{" "}
        <div className="mb-4">
          <label
            htmlFor="voteRight"
            className="block text-gray-700 font-bold mb-2"
          >
            오른쪽 버튼:
          </label>
          <input
            type="text"
            id="voteRight"
            className="w-full px-3 py-2 border rounded-lg border-gray-400"
            {...register("voteRight", { required: true })}
          />
          {formState.errors.voteRight && (
            <p className="text-red-500 text-sm mt-2">
              오른쪽버튼 내용을 입력해주세요.
            </p>
          )}
        </div>{" "}
        <div className="mb-4">
          <label htmlFor="file" className="block text-gray-700 font-bold mb-2">
            첨부파일:
          </label>
          <input
            type="file"
            id="file"
            onChange={(event) => {
              setFileUrl(URL.createObjectURL(event.target.files[0]));
              register("file");
            }}
          />
        </div>
        {fileUrl && (
          <div className="mb-4">
            <img
              src={fileUrl}
              alt="첨부파일"
              className="w-40 h-40 object-cover"
            />
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            disabled={!isValid}
          >
            작성
          </button>
        </div>
      </form>
    </div>
  );
}
