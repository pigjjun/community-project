import React from "react";

const CommentForm = ({ onSubmit, isEnglish }) => (
  <form onSubmit={onSubmit}>
    <div className="flex">
      <label htmlFor="content" className="block mb-2"></label>
      <textarea
        name="content"
        id="content"
        rows="2"
        className="w-full px-2 py-1 rounded-l-lg text-black-theme-005 border-r-0 border border-black-theme-001"
        style={{ resize: "none" }}
      ></textarea>
      <button
        type="submit"
        className="min-w-max rounded-r-lg max-h-max py-1 px-2 text-black-theme-005 bg-button-neutral-003 dark:text-white-theme-000 dark:bg-button-neutral-004 border-l-0 border border-black-theme-001 transition-all duration-500"
      >
        {isEnglish ? "Add" : "작성"}
      </button>
    </div>
  </form>
);

export default CommentForm;
