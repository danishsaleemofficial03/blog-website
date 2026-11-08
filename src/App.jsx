import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import PostPage from "./pages/PostPage";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Editor from "./pages/Editor";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="/admin/new" element={<ProtectedRoute adminOnly><Editor /></ProtectedRoute>} />
          <Route path="/admin/edit/:id" element={<ProtectedRoute adminOnly><Editor /></ProtectedRoute>} />
          <Route path="*" element={<p className="empty">Page not found.</p>} />
        </Routes>
      </main>
      <footer className="footer">Built with React and Firebase</footer>
    </>
  );
}
