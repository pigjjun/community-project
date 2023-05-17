// ReplyForm.jsx
import React from "react";

function ReplyForm({ commentId, handleReplySubmit, isEnglish }) {
  return (
    <form onSubmit={(e) => handleReplySubmit(e, commentId)}>
      <div className="flex mb-2">
        <textarea
          name="content"
          className="w-full px-2 py-1 rounded-l-lg text-black-theme-005 border-r-0 border border-black-theme-001"
          rows={1}
          style={{ resize: "none" }}
        ></textarea>
        <button
          type="submit"
          className="min-w-max rounded-r-lg max-h-max py-1 px-2 text-black-theme-005 bg-button-neutral-003 dark:text-white-theme-000 dark:bg-button-neutral-004 border-l-0 border border-black-theme-001 transition-all duration-500"
        >
          {isEnglish ? "Reply" : "대댓글 작성하기"}
        </button>
      </div>
    </form>
  );
}

export default ReplyForm;
