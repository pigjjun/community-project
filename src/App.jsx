import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Post from "./pages/Post";
import Write from "./pages/Write";
import UserProfile from "./pages/UserProfile";
import UserProfileEdit from "./pages/UserProfileEdit";
import Main from "./pages/Main";
import Search from "./pages/Search";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/reg" element={<Register />} />
        <Route path="/user/profile/:userId" element={<UserProfile />} />
        <Route path="/user/profile/edit" element={<UserProfileEdit />} />
        <Route path="/main/post" element={<Post />} />
        <Route path="/main/write" element={<Write />} />
        <Route path="/main/post/:id" element={<Post />} />
        <Route path="/main/search" element={<Search />} />
      </Routes>
    </>
  );
}

export default App;
