import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./ContextAPI/AuthContext";
import { CategoryProvider } from "./ContextAPI/CategoryContext";
import { BrowserRouter } from "react-router-dom";
import { LanguageContextProvider } from "./ContextAPI/LanguageContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageContextProvider>
        <AuthProvider>
          <CategoryProvider>
            <App />
          </CategoryProvider>
        </AuthProvider>
      </LanguageContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
