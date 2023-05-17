// ReplyComment.js
import React from "react";
import { Link } from "react-router-dom";

const ReplyComment = ({
  comment,
  commentId,
  replyComment,
  userData,
  handleDeleteReply,
  handleReplyEditClick,
  editedReply,
  handleReplyUpdate,
  setEditedReply,
  isEnglish,
  handleReplyLikeClick,
}) => {
  return (
    <div
      key={replyComment.id}
      className="border-t-2 border-dashed border-black-theme-000 dark:border-black-theme-003 pt-2 pl-4"
    >
      <div className="flex justify-between">
        <div className="flex">
          <div className="w-5 mr-4 pt-2 fill-black-theme-001">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="geometricPrecision"
              textRendering="geometricPrecision"
              imageRendering="optimizeQuality"
              fillRule="evenodd"
              clipRule="evenodd"
              viewBox="0 0 512 496.62"
            >
              <path
                fillRule="nonzero"
                d="M310.39 385.78h-91.37c-101.71 0-156.18-22.31-188.57-73.12C1.01 266.49 0 209.09 0 127.09V0h115.33v127.09c0 62.54.42 105.72 11.98 123.87 8.62 13.52 34.89 19.49 91.71 19.49h90.4c-2.65-25.48-6.71-53.73-11.96-88l-.02-.3c-.57-4.13.22-8.07 1.93-11.46 1.9-3.71 4.9-6.78 8.34-8.64l.62-.3c3.34-1.66 7.23-2.45 11.04-2l.47.07c3.59.45 7.13 2.01 10.3 4.73l176.02 153.46c1.71 1.83 3.14 3.74 4.16 5.99 1.19 2.6 1.81 5.55 1.66 8.91-.18 2.9-.9 5.6-2.08 7.95l-.23.42a19.478 19.478 0 0 1-4.85 5.97L329.05 492.64c-3.31 2.47-6.95 3.71-10.57 3.94l-.3.02c-4.01.17-7.99-.87-11.36-2.87a19.629 19.629 0 0 1-7.82-8.77l-.23-.52c-1.31-3.24-1.83-7.08-1.11-11.06 6.14-34.1 10.3-62.23 12.73-87.6z"
              />
            </svg>
          </div>
          <Link to={`/user/profile/${replyComment.createdBy}`}>
            <div className="flex items-center mb-2">
              <img
                src={
                  comment && comment.photoURL
                    ? comment.photoURL
                    : "https://firebasestorage.googleapis.com/v0/b/pigjjun-sub.appspot.com/o/profilePictures%2FUser-Profile-Icon.svg?alt=media"
                }
                alt={replyComment.createdBy}
                className="w-4 h-4 rounded-full mr-1"
              />
              <span className="text-md border-b-2 text-button-neutral-004 dark:text-button-neutral-002 place-self-center transition-all duration-500">
                {replyComment.createdBy}
              </span>
            </div>
          </Link>
        </div>
        <div>
          <span className="text-right text-black-theme-005 dark:text-black-theme-000 transition-all duration-500">
            {isEnglish
              ? `${replyComment.createdAt.toDate().toLocaleString("en-GB")}`
              : `${replyComment.createdAt.toDate().toLocaleString("ko-KR")}`}
          </span>
          {/* 좋아요 버튼 */}
          <button
            id={`likeButton_${replyComment.id}`}
            className={`text-sm px-1 py-1 mb-2 mr-1 ml-2 border rounded-lg transition-all duration-500 ${
              userData && replyComment.likes.includes(userData.userId)
                ? "bg-button-red-005 text-white-theme-001"
                : "text-white-theme-007 dark:text-black-theme-002"
            }`}
            onClick={
              userData
                ? () => handleReplyLikeClick(commentId, replyComment.id)
                : null
            }
            disabled={!userData}
          >
            {isEnglish ? "Like" : "좋아요"} {replyComment.likes.length}
          </button>
        </div>
      </div>
      <p className="text-left ml-8 mb-4 text-black-theme-005 dark:text-black-theme-000 transition-all duration-500">
        {replyComment.content}
      </p>
      {userData && userData.userId === replyComment.createdBy && (
        <div className="text-right">
          <button
            className="text-sm px-1 py-1 mb-2 mr-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
            onClick={() => handleDeleteReply(commentId, replyComment.id)}
          >
            {isEnglish ? "Delete" : "삭제하기"}
          </button>
          <button
            className="text-sm px-1 py-1 mb-2 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
            onClick={() => handleReplyEditClick(commentId, replyComment)}
          >
            {isEnglish ? "Edit" : "수정하기"}
          </button>
        </div>
      )}

      {/* 대댓글 수정 폼 */}
      {editedReply.replyId === replyComment.id && (
        <form onSubmit={handleReplyUpdate}>
          <div className="flex">
            <label htmlFor="editReplyContent" className="block mb-2"></label>
            <textarea
              name="editReplyContent"
              id="editReplyContent"
              value={editedReply.content}
              onChange={(e) =>
                setEditedReply({
                  ...editedReply,
                  content: e.target.value,
                })
              }
              rows="2"
              className="w-full px-2 py-1 rounded-l-lg text-black-theme-005 border-r-0 border border-black-theme-001"
              style={{ resize: "none" }} // resize 속성 추가
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
};

export default ReplyComment;
