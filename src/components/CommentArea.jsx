import React from "react";
import { Link } from "react-router-dom";
import ReplyComment from "./ReplyComment";
import ReplyForm from "./ReplyForm";

export default function CommentArea({
  comment,
  handleDeleteComment,
  handleEditClick,
  handleCommentUpdate,
  handleLikeClick,
  userData,
  editedComment,
  setEditedComment,
  isEnglish,
  // 필요한 props 추가
  handleReplySubmit,
  handleReplyEditClick,
  handleReplyUpdate,
  handleDeleteReply,
  handleReplyLikeClick,
  editedReply,
  setEditedReply,
  replyComments,
  setReplyOpen,
  replyOpen,
}) {
  return (
    <div
      key={comment.id}
      className="border-b-2 border-white-theme-006 dark:border-black-theme-002 border-dotted mb-4 transition-all duration-500"
    >
      <div className="flex justify-between">
        <Link to={`/user/profile/${comment.createdBy}`}>
          <div className="flex items-center mb-2">
            <img
              src={
                comment && comment.photoURL
                  ? comment.photoURL
                  : "https://firebasestorage.googleapis.com/v0/b/pigjjun-sub.appspot.com/o/profilePictures%2FUser-Profile-Icon.svg?alt=media"
              }
              alt={comment.createdBy}
              className="w-4 h-4 rounded-full mr-1"
            />
            <span className="text-md border-b-2 text-button-neutral-004 dark:text-button-neutral-002 place-self-center transition-all duration-500">
              {comment.createdBy}
            </span>
          </div>
        </Link>
        <div>
          <span className="text-right text-black-theme-005 dark:text-black-theme-000 transition-all duration-500">
            {isEnglish
              ? `${comment.createdAt.toDate().toLocaleString("en-GB")}`
              : `${comment.createdAt.toDate().toLocaleString("ko-KR")}`}
          </span>
          {/* 좋아요 버튼 */}
          <button
            id={`likeButton_${comment.id}`}
            className={`text-sm px-1 py-1 mb-2 mr-1 ml-2 border rounded-lg transition-all duration-500 ${
              userData && comment.likes.includes(userData.userId)
                ? "bg-button-red-005 text-white-theme-001"
                : "text-white-theme-007 dark:text-black-theme-002"
            }`}
            onClick={userData ? () => handleLikeClick(comment.id) : null}
            disabled={!userData}
          >
            {isEnglish ? "Like" : "좋아요"} {comment.likes.length}
          </button>
        </div>
      </div>
      <p className="text-left mb-4 text-black-theme-005 dark:text-black-theme-000 transition-all duration-500">
        {comment.content}
      </p>
      {userData && userData.userId === comment.createdBy && (
        <div className="text-right">
          <button
            className="text-sm px-1 py-1 mb-2 mr-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
            onClick={() => handleDeleteComment(comment.id)}
          >
            {isEnglish ? "Delete" : "삭제하기"}
          </button>
          <button
            className="text-sm px-1 py-1 mb-2 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
            onClick={() => handleEditClick(comment)}
          >
            {isEnglish ? "Edit" : "수정하기"}
          </button>
        </div>
      )}
      {editedComment.id === comment.id && (
        <form onSubmit={handleCommentUpdate}>
          <div className="flex">
            <label htmlFor="editContent" className="block mb-2"></label>
            <textarea
              name="editContent"
              id="editContent"
              rows="2"
              className="w-full px-2 py-1 rounded-l-lg text-black-theme-005 border-r-0 border border-black-theme-001"
              style={{ resize: "none" }} // resize 속성 추가
              value={editedComment.content}
              onChange={(e) =>
                setEditedComment({
                  ...editedComment,
                  content: e.target.value,
                })
              }
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
      {/* 대댓글 목록 */}
      {replyComments[comment.id] &&
        replyComments[comment.id].map((replyComment) => (
          <ReplyComment
            key={replyComment.id}
            comment={comment}
            commentId={comment.id}
            replyComment={replyComment}
            userData={userData}
            handleDeleteReply={handleDeleteReply}
            editedReply={editedReply}
            handleReplyUpdate={handleReplyUpdate}
            setEditedReply={setEditedReply}
            isEnglish={isEnglish}
            handleReplyLikeClick={handleReplyLikeClick}
            handleReplySubmit={handleReplySubmit}
            handleReplyEditClick={handleReplyEditClick}
            replyComments={replyComments}
            setReplyOpen={setReplyOpen}
            replyOpen={replyOpen}
          />
        ))}
      {/* 대댓글 작성 토글 버튼 */}
      <div className="flex justify-end">
        {userData && (
          <button
            className="text-sm px-1 py-1 mb-2 mr-1 border rounded-lg text-white-theme-007 dark:text-black-theme-002 transition-all duration-500"
            onClick={() =>
              setReplyOpen((prev) => ({
                ...prev,
                [comment.id]: !prev[comment.id],
              }))
            }
          >
            {isEnglish ? "Reply" : "답글달기"}
          </button>
        )}
      </div>

      {/* 대댓글 작성 폼 */}
      {replyOpen[comment.id] && (
        <ReplyForm
          commentId={comment.id}
          handleReplySubmit={handleReplySubmit}
          isEnglish={isEnglish}
        />
      )}
    </div>
  );
}
