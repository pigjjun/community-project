import React, { useContext, useState, useEffect } from "react";
import { doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useParams } from "react-router-dom";
import { AuthContext } from "../ContextAPI/AuthContext";

export default function VoteButtons({ post, isEnglish, handleVoteUpdate }) {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [userVote, setUserVote] = useState("");

  useEffect(() => {
    const fetchUserVote = async () => {
      let userVote;
      if (user) {
        // 로그인한 유저
        const userVoteRef = doc(db, "posts", id, "votes", user.uid);
        const userVoteSnap = await getDoc(userVoteRef);
        if (userVoteSnap.exists()) {
          userVote = userVoteSnap.data().vote;
        }
      } else {
        // 로그인하지 않은 유저
        userVote = localStorage.getItem(`vote-${id}`);
      }
      setUserVote(userVote || "");
    };

    fetchUserVote();
  }, [id, user]);

  const handleVoteClick = async (field) => {
    try {
      const postRef = doc(db, "posts", id);
      let userVoteRef;
      let userVoteSnap;

      if (user) {
        userVoteRef = doc(postRef, "votes", user.uid);
        userVoteSnap = await getDoc(userVoteRef);
      } else {
        userVoteSnap = {
          exists: userVote !== "",
          data: () => ({ vote: userVote }),
        };
      }

      // 유저의 투표 기록을 확인합니다.
      if (
        userVoteSnap.exists &&
        userVoteSnap.data() &&
        userVoteSnap.data().vote === field
      ) {
        // 유저가 같은 버튼에 이미 투표했다면 아무 작업도 하지 않습니다.
        const sameVoteMessage = `${
          isEnglish
            ? "You has already voted for this button"
            : "이미 해당 버튼에 투표하셨습니다"
        }`;
        alert(sameVoteMessage);
        return;
      }
      // 유저가 다른 버튼에 투표했다면 그 버튼의 투표 수를 감소시킵니다.
      if (userVoteSnap.exists && userVoteSnap.data()) {
        await updateDoc(postRef, {
          [userVoteSnap.data().vote]: increment(-1),
        });
      } else {
        // 이전에 투표한 적이 없다면 voteTotal을 증가시킵니다.
        await updateDoc(postRef, {
          "voteTotal": increment(1),
        });
      }

      // 새로운 버튼에 투표합니다.
      await updateDoc(postRef, {
        [field]: increment(1),
      });

      // 유저의 투표 기록을 업데이트합니다.
      if (user) {
        await setDoc(userVoteRef, { vote: field });
      } else {
        localStorage.setItem(`vote-${id}`, field);
      }

      // 사용자 투표 상태를 업데이트합니다.
      setUserVote(field);

      // Get the updated document
      const updatedPost = await getDoc(postRef);

      handleVoteUpdate(updatedPost.data());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-max justify-between pt-6 mb-40">
      <button
        className="z-10 min-w-max font-bold py-2 px-2 rounded-l-xl text-black-theme-005 dark:text-white-theme-000 bg-button-red-003 dark:bg-button-red-004 hover:bg-button-red-004 dark:hover:bg-button-red-005 hover:scale-105 transition-all duration-250"
        style={{
          width: `${((post.voteLeftCount + 1) / (post.voteTotal + 1)) * 100}%`,
        }}
        onClick={() => handleVoteClick("voteLeftCount")}
      >
        <div>{post.voteLeft}</div>
        <span className="px-2 py-1 rounded-full bg-button-red-001 dark:bg-button-red-002">
          {post.voteLeftCount}
        </span>
        {userVote === "voteLeftCount" && (
          <span className="p-1 ml-1 rounded-full bg-button-red-001 dark:bg-button-red-002">
            ✔
          </span>
        )}
      </button>
      <button
        className="min-w-max font-bold py-2 px-2 text-black-theme-005 dark:text-white-theme-000 bg-button-neutral-003 dark:bg-button-neutral-004 hover:bg-button-neutral-004 dark:hover:bg-button-neutral-005 hover:scale-105 transition-all duration-250"
        style={{
          width: `${
            ((post.voteNeutralCount + 1) / (post.voteTotal + 1)) * 100
          }%`,
        }}
        onClick={() => handleVoteClick("voteNeutralCount")}
      >
        <div>{isEnglish ? "Neutral" : "중립"}</div>
        <span className="px-2 py-1 rounded-full bg-button-neutral-001 dark:bg-button-neutral-002">
          {post.voteNeutralCount}{" "}
        </span>
        {userVote === "voteNeutralCount" && (
          <span className="p-1 ml-1 rounded-full bg-button-neutral-001 dark:bg-button-neutral-002">
            ✔
          </span>
        )}
      </button>
      <button
        className="z-10 min-w-max font-bold py-2 px-2 rounded-r-xl text-black-theme-005 dark:text-white-theme-000 bg-button-blue-003 dark:bg-button-blue-004 hover:bg-button-blue-004 dark:hover:bg-button-blue-005 hover:scale-105 transition-all duration-250"
        style={{
          width: `${((post.voteRightCount + 1) / (post.voteTotal + 1)) * 100}%`,
        }}
        onClick={() => handleVoteClick("voteRightCount")}
      >
        <div>{post.voteRight}</div>
        <span className="px-2 py-1 rounded-full bg-button-blue-001 dark:bg-button-blue-002">
          {post.voteRightCount}{" "}
        </span>
        {userVote === "voteRightCount" && (
          <span className="p-1 ml-1 rounded-full bg-button-blue-001 dark:bg-button-blue-002">
            ✔
          </span>
        )}
      </button>
    </div>
  );
}
