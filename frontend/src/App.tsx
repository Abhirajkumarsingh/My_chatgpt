import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Chat } from './pages/Chat';
import { Admin } from './pages/Admin';
import { Settings } from './pages/Settings';
import { Layout } from './components/Layout';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, user } = useAuthStore();
  // Simple client-side check. Backend verifies actual token permissions.
  // Note: user.is_admin might be stale if we don't refresh profile, 
  // but adequate for routing UI.
  if (!token) return <Navigate to="/login" replace />;
  // Weak check for demo purposes. Ideally verify with backend /me endpoint
  if (!user?.is_admin) return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;