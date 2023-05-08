import React, { createContext, useState } from "react";

export const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [category, setCategory] = useState("all");

  const handleCategoryClick = (newCategory) => {
    setCategory(newCategory);
  };

  return (
    <CategoryContext.Provider value={{ category, handleCategoryClick }}>
      {children}
    </CategoryContext.Provider>
  );
}
