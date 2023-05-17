// Pagination.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase.config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
} from "firebase/firestore";

const POSTS_PER_PAGE = 10;

export default function Pagination({ category, sortBy, setSortedPosts }) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [lastVisiblePost, setLastVisiblePost] = useState(null);

  const calculateTotalPages = async () => {
    let q = collection(db, "posts");
    if (category !== "all") {
      q = query(q, where("category", "==", category));
    }
    const querySnapshot = await getDocs(q);
    const totalCount = querySnapshot.size;

    setTotalPages(Math.ceil(totalCount / POSTS_PER_PAGE));
  };

  useEffect(() => {
    calculateTotalPages();
  }, [category]);

  useEffect(() => {
    const getPosts = async () => {
      let q = collection(db, "posts");
      if (category !== "all") {
        q = query(q, where("category", "==", category));
      }
      q = query(q, orderBy(sortBy, "desc"), limit(POSTS_PER_PAGE));

      if (page > 1 && lastVisiblePost) {
        q = query(q, startAfter(lastVisiblePost));
      }

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const newPosts = querySnapshot.docs.map(async (document) => {
            const postUserId = document.data().createdBy;
            const userRef = doc(db, "users", postUserId);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();
            return {
              id: document.id,
              ...document.data(),
              postUserId,
              userData,
            };
          });
          Promise.all(newPosts).then((result) => {
            setSortedPosts(result);
            // Update the last visible post for pagination
            setLastVisiblePost(
              querySnapshot.docs[querySnapshot.docs.length - 1]
            );
          });
        } else {
          setSortedPosts([]);
        }
      } catch (error) {
        console.log("Error getting documents: ", error);
      }
    };
    getPosts();
  }, [category, sortBy, page]);

  useEffect(() => {
    const numbers = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    setPageNumbers(numbers);
  }, [totalPages]);

  return (
    <div className="flex justify-center my-4">
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => {
            setPage(number);
          }}
          className={`mx-1 px-3 py-1 text-sm font-bold bg-white-theme-002 hover:bg-white-theme-003 text-black-theme-005 dark:bg-black-theme-001 dark:hover:bg-black-theme-002 dark:text-white-theme-001 rounded-full transition-all duration-250 ${
            page === number
              ? "bg-white-theme-004 dark:bg-black-theme-003 hover:bg-white-theme-004 dark:hover:bg-black-theme-003"
              : ""
          }`}
        >
          {number}
        </button>
      ))}
    </div>
  );
}
