import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../ContextAPI/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { storage, db } from "../firebase.config";
import {
  deleteObject,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { LanguageContext } from "../ContextAPI/LanguageContext";

export default function UserProfileEdit() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const { isEnglish } = useContext(LanguageContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [age, setAge] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [userIdDisabled, setUserIdDisabled] = useState(false);
  const [originalUserId, setOriginalUserId] = useState("");
  const [userIdUpdatedAt, setUserIdUpdatedAt] = useState(null);
  const [deletePhoto, setDeletePhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [photoURL, setPhotoURL] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const getUserInfo = async () => {
      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userInfo = querySnapshot.docs[0].data();
        setName(userInfo.name);
        setEmail(userInfo.email);
        setUserId(userInfo.userId);
        setOriginalUserId(userInfo.userId);
        setBirthday(userInfo.birthday);
        setAge(userInfo.age);
        setIntroduction(userInfo.introduction);
        setUserIdUpdatedAt(userInfo.userIdUpdatedAt);
        setPhotoURL(userInfo.photoURL);
      }
    };
    getUserInfo();
    const checkUserIdDisabled = () => {
      const now = new Date();
      const updatedAt = new Date(userIdUpdatedAt);
      const diffInDays = (now - updatedAt) / (1000 * 3600 * 24);
      if (diffInDays < 10) {
        setUserIdDisabled(true);
      }
    };
    if (userIdUpdatedAt) {
      checkUserIdDisabled();
    }
  }, [user, userIdUpdatedAt]);

  // handleSubmit //

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const auth = getAuth();
    const file = fileInputRef.current.files[0];
    const dataToUpdate = {
      name,
      email,
      birthday,
      age,
      introduction,
    };
    if (file) {
      try {
        const uploadedPhotoURL = await uploadProfilePicture(file);
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: uploadedPhotoURL,
        });
        setPhotoURL(uploadedPhotoURL);
        await updateCommentPhotoURL(userId, uploadedPhotoURL);
      } catch (error) {
        alert(
          `${
            isEnglish
              ? "An error occurred while updating the profile"
              : "프로필 사진 업로드 중 에러가 발생했습니다"
          }`
        );
      }
    }
    if (deletePhoto) {
      try {
        await deleteProfilePicture(user.uid);
        await updateProfile(auth.currentUser, {
          photoURL: "",
        });
        setPhotoURL("");
        await updateCommentPhotoURL(userId, "");
      } catch (error) {
        alert(
          `${
            isEnglish
              ? "An error occurred while updating the profile"
              : "프로필 사진 업로드 중 에러가 발생했습니다"
          }`
        );
      }
    }
    if (userId !== originalUserId) {
      // userId가 변경된 경우에만 userIdUpdatedAt 저장
      dataToUpdate.userId = userId;
      dataToUpdate.userIdUpdatedAt = new Date().toISOString(); // 현재 시간을 ISO 형식으로 저장
      // 본인이 작성한 댓글들의 createdBy를 변경
      await updateCreatedBy(originalUserId, userId);
    }
    try {
      await updateProfile(auth.currentUser, { displayName: name });

      if (userId !== originalUserId) {
        // userId가 변경된 경우에만 userIdUpdatedAt 저장
        dataToUpdate.userId = userId;
        dataToUpdate.userIdUpdatedAt = new Date().toISOString(); // 현재 시간을 ISO 형식으로 저장
      }
      if (deletePhoto) {
        // photoURL이 삭제된 경우 빈 문자열로 설정
        dataToUpdate.photoURL = "";
      } else if (photoURL) {
        // photoURL이 있는 경우에만 저장
        dataToUpdate.photoURL = photoURL;
      }
      await updateDoc(doc(db, "users", user.uid), dataToUpdate);
      alert(
        `${
          isEnglish
            ? "Profile has been successfully updated!"
            : "프로필이 성공적으로 업데이트되었습니다!"
        }`
      );
      // 여기서 새로고침 대신 navigate를 사용하여 프로필 페이지로 이동합니다.
      navigate(`/user/profile/${userId}`);
      location.replace(location.href);
    } catch (error) {
      alert(
        `${
          isEnglish
            ? "An error occurred while updating the profile"
            : "프로필 사진 업로드 중 에러가 발생했습니다"
        }`
      );
    }
    setIsLoading(false);
  };

  // 게시글, 댓글, 대댓글마다 아이디 변경
  const updateCreatedBy = async (oldUserId, newUserId) => {
    // Fetch all documents from the posts collection
    const postsQuery = query(collection(db, "posts"));
    const postsQuerySnapshot = await getDocs(postsQuery);

    // Process each post
    await Promise.all(
      postsQuerySnapshot.docs.map(async (postDoc) => {
        // Update createdByUserId for each post
        if (postDoc.data().createdByUserId === oldUserId) {
          await updateDoc(postDoc.ref, { createdByUserId: newUserId });
        }

        // Get all comments of the post
        const commentsRef = collection(postDoc.ref, "comments");
        const commentsQuery = query(
          commentsRef,
          where("createdBy", "==", oldUserId)
        );
        const commentsQuerySnapshot = await getDocs(commentsQuery);

        // Find and update comments where createdBy matches the old user ID
        await Promise.all(
          commentsQuerySnapshot.docs.map(async (commentDoc) => {
            await updateDoc(commentDoc.ref, { createdBy: newUserId });

            // Get all replies of the comment
            const repliesRef = collection(commentDoc.ref, "replies");
            const repliesQuery = query(
              repliesRef,
              where("createdBy", "==", oldUserId)
            );
            const repliesQuerySnapshot = await getDocs(repliesQuery);

            // Find and update replies where createdBy matches the old user ID
            await Promise.all(
              repliesQuerySnapshot.docs.map(async (replyDoc) => {
                await updateDoc(replyDoc.ref, { createdBy: newUserId });
              })
            );
          })
        );
      })
    );
  };

  //프로필 사진 업로드
  const uploadProfilePicture = async (file) => {
    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Upload progress handling
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  // 프로필사진 제거
  const deleteProfilePicture = async (uid) => {
    const storageRef = ref(storage, `profilePictures/${uid}`);
    try {
      await deleteObject(storageRef);
      // 프로필 사진이 삭제되면 댓글 및 대댓글의 photoURL도 빈 문자열로 설정
      await updateCommentPhotoURL(uid, "");
    } catch (error) {
      console.error("프로필 사진 삭제 중 에러 발생:", error);
      throw error;
    }
  };

  // 댓글 대댓글 프로필사진 수정
  const updateCommentPhotoURL = async (userId, newPhotoURL) => {
    // Fetch all documents from the posts collection
    const postsQuery = query(collection(db, "posts"));
    const postsQuerySnapshot = await getDocs(postsQuery);

    // Process each post
    await Promise.all(
      postsQuerySnapshot.docs.map(async (postDoc) => {
        // Get all comments of the post
        const commentsRef = collection(postDoc.ref, "comments");
        const commentsQuery = query(
          commentsRef,
          where("createdBy", "==", userId)
        );
        const commentsQuerySnapshot = await getDocs(commentsQuery);

        // Find and update comments where createdBy matches the user ID
        await Promise.all(
          commentsQuerySnapshot.docs.map(async (commentDoc) => {
            await updateDoc(commentDoc.ref, { photoURL: newPhotoURL });

            // Get all replies of the comment
            const repliesRef = collection(commentDoc.ref, "replies");
            const repliesQuery = query(
              repliesRef,
              where("createdBy", "==", userId)
            );
            const repliesQuerySnapshot = await getDocs(repliesQuery);

            // Find and update replies where createdBy matches the user ID
            await Promise.all(
              repliesQuerySnapshot.docs.map(async (replyDoc) => {
                await updateDoc(replyDoc.ref, { photoURL: newPhotoURL });
              })
            );
          })
        );
      })
    );
  };

  // handleSubmit 끝//

  // handleChange 함수 //

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleBirthdayChange = (e) => {
    setBirthday(e.target.value);
  };

  const handleAgeChange = (e) => {
    setAge(e.target.value);
  };

  const handleIntroductionChange = (e) => {
    setIntroduction(e.target.value);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoURL(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  async function handleUserIdDuplicateCheck() {
    if (!validateUserId(userId)) {
      return;
    }
    const q = query(collection(db, "users"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      alert(
        `${
          isEnglish
            ? "This ID is already in use"
            : "이미 사용 중인 아이디입니다"
        }`
      );
    } else {
      alert(
        `${isEnglish ? "This ID is available" : "사용 가능한 아이디입니다"}`
      );
    }
  }

  function validateUserId(userId) {
    const isKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
    const isEnglish = /[a-zA-Z]/;

    if (isKorean.test(userId)) {
      // Validate Korean user ID
      if (userId.length < 2 || /^[ㄱ-ㅎㅏ-ㅣ]+$/.test(userId)) {
        alert(
          `${
            isEnglish
              ? "The ID cannot be used with only consonants or vowels and must be at least 2 characters"
              : "아이디는 자음 또는 모음만으로는 사용할 수 없으며, 2자 이상이어야 합니다"
          }`
        );
        return false;
      }
    } else if (isEnglish.test(userId)) {
      // Validate English user ID
      if (userId.length < 4) {
        alert(
          `${
            isEnglish
              ? "The ID must be at least 4 characters in English"
              : "아이디는 영문자로 4자 이상이어야 합니다"
          }`
        );
        return false;
      }
    } else {
      // User ID is neither Korean nor English
      alert(
        `${
          isEnglish
            ? "The ID must be entered in English or Korean"
            : "아이디는 영문자 또는 한글로 입력해야 합니다"
        }`
      );
      return false;
    }

    const userIdRegex = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣_-]{2,16}$/;
    if (!userIdRegex.test(userId)) {
      alert(
        `${
          isEnglish
            ? "The ID must be 2 or more characters and 16 or less characters in English, numbers, special characters (_,-)"
            : "아이디는 영문자, 숫자, 특수문자(_,-)로 2자 이상 16자 이하여야 합니다"
        }`
      );
      return false;
    }
    return true;
  }
  // handleChange 함수 끝 //

  return (
    <div className="min-h-screen min-w-max pb-6 pt-88px bg-white-theme-001 text-black-theme-004 dark:bg-black-theme-004 dark:text-white-theme-002 transition-all duration-500">
      <div className="">
        <div className="text-3xl mt-4 font-bold text-black-theme-005 dark:text-white-theme-002 transition-all duration-500">
          {isEnglish ? "Edit Profile" : "프로필 수정"}
        </div>
        <div className="flex justify-end mr-3 mb-3">
          <Link to={`/user/profile/${userId}`}>
            <button className="text-sm px-2 py-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500">
              {isEnglish ? "Cancel" : "돌아가기"}
            </button>
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-md w-full px-8">
        <form className="" onSubmit={handleSubmit}>
          {/* 프로필 사진, 파일 입력 */}
          <div className="flex flex-col border-2 rounded-lg p-6 mb-6 border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
            <div className="flex justify-center mb-2">
              <img
                src={
                  photoURL
                    ? photoURL
                    : "https://firebasestorage.googleapis.com/v0/b/pigjjun-sub.appspot.com/o/profilePictures%2FUser-Profile-Icon.svg?alt=media"
                }
                alt="프로필 사진"
                width="150"
                height="150"
                className="rounded-full border-2 border-black-theme-003 dark:border-white-theme-001 transition-all duration-500"
              />
            </div>
            <div className="flex mb-2">
              <input
                type="file"
                id="photo"
                name="photo"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="w-2/3 mx-auto"
              />
            </div>
            {/* 사진삭제 */}
            <div className="flex justify-center">
              <label htmlFor="deletePhoto" className="flex font-bold mr-2">
                {isEnglish ? "Delete Profile Photo" : "프로필 사진 삭제"}
              </label>
              <input
                type="checkbox"
                id="deletePhoto"
                name="deletePhoto"
                checked={deletePhoto}
                onChange={(e) => setDeletePhoto(e.target.checked)}
                className="flex"
              />
            </div>
          </div>
          {/* 아이디, 이름, 이메일 */}
          <div className="flex flex-col border-2 rounded-lg p-6 mb-6 border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
            {/* 아이디 */}
            <div className="flex justify-evenly mb-2">
              <label
                htmlFor="userId"
                className="flex font-bold text-black-theme-004 dark:text-white-theme-004 transition-all duration-500"
              >
                {isEnglish ? "User ID" : "아이디"}
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="flex text-center bg-white-theme-000 border-2 border-black-theme-003 dark:border-black-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 disabled:bg-button-neutral-002 disabled:dark:text-black-theme-003"
                disabled={userIdDisabled}
              />
            </div>
            {/* 아이디 중복확인 버튼 */}
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={handleUserIdDuplicateCheck}
                className="flex justify-center w-fit text-sm px-2 py-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
              >
                {isEnglish ? "Duplicate Check" : "중복확인"}
              </button>
            </div>
            {/* 이름 */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="flex justify-center text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 font-bold mb-2"
              >
                {isEnglish ? "Name" : "이름"}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleNameChange}
                // required
                className="w-full text-center bg-white-theme-000 dark:bg-black-theme-001 border-2 border-black-theme-003 dark:border-white-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-000 transition-all duration-500"
              />
            </div>
            {/* 이메일 */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="flex justify-center text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 font-bold mb-2"
              >
                {isEnglish ? "Email" : "이메일"}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                disabled
                className="w-full text-center bg-white-theme-000 border-2 border-black-theme-003 dark:border-black-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 disabled:bg-button-neutral-002 disabled:dark:text-black-theme-003"
              />
            </div>
          </div>

          {/* 생일, 나이, 소개 */}
          <div className="flex flex-col border-2 rounded-lg p-6 mb-6 border-black-theme-003 dark:border-black-theme-002 transition-all duration-500">
            {/* 생일 */}
            <div className="mb-4">
              <label
                htmlFor="birthday"
                className="flex justify-center text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 font-bold mb-2"
              >
                {isEnglish ? "Birthday" : "생일"}
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={birthday}
                onChange={handleBirthdayChange}
                // required
                className="w-full text-center bg-white-theme-000 dark:bg-black-theme-001 border-2 border-black-theme-003 dark:border-white-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-000 transition-all duration-500"
              />
            </div>
            {/* 나이 */}
            <div className="mb-4">
              <label
                htmlFor="age"
                className="flex justify-center text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 font-bold mb-2"
              >
                {isEnglish ? "Age" : "나이"}
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={age}
                onChange={handleAgeChange}
                // required
                className="w-full text-center bg-white-theme-000 dark:bg-black-theme-001 border-2 border-black-theme-003 dark:border-white-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-000 transition-all duration-500"
              />
            </div>
            {/* 소개 */}
            <div className="mb-4">
              <label
                htmlFor="introduction"
                className="flex justify-center text-black-theme-004 dark:text-white-theme-004 transition-all duration-500 font-bold mb-2"
              >
                {isEnglish ? "Introduction" : "내 소개"}
              </label>
              <textarea
                rows="10"
                id="introduction"
                name="introduction"
                value={introduction}
                onChange={handleIntroductionChange}
                style={{ resize: "none" }}
                className="w-full text-center bg-white-theme-000 dark:bg-black-theme-001 border-2 border-black-theme-003 dark:border-white-theme-001 rounded-md text-black-theme-004 dark:text-white-theme-000 transition-all duration-500"
              />
            </div>
          </div>
          {/* 저장하기 버튼 +로딩애니메이션 */}
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
              `${isEnglish ? "Save" : "저장하기"}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
