import React from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ searchTerm, setSearchTerm, isEnglish }) {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/main/search?query=${searchTerm}`);
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="flex justify-center mt-24">
        <input
          type="text"
          className="border-2 rounded-l-lg pl-2 text-black-theme-003 border-black-theme-002 dark:border-black-theme-001"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="block py-1 px-2 rounded-r-lg transition-all duration-500 bg-white-theme-003 text-black-theme-003 dark:bg-black-theme-001 dark:text-white-theme-001 font-bold hover:bg-white-theme-006 dark:hover:bg-black-theme-002 transition-all duration-500"
          type="submit"
        >
          {isEnglish ? "Search" : "검색"}
        </button>
      </div>
    </form>
  );
}
