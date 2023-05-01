import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Main from "./components/Main";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import Post from "./pages/Post";
import Write from "./pages/Write";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/logout" element={<Logout />} />
        <Route path="/user/reg" element={<Register />} />
        <Route path="/main/post" element={<Post />} />
        <Route path="/main/write" element={<Write />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
