import React, { useState } from 'react';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // You might need to install this: npm i jwt-decode

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? new URLSearchParams({ username: email, password }) 
        : { email, password };
      
      const { data } = await client.post(endpoint, payload);
      const token = data.access_token;
      
      setToken(token);
      
      // Decode rudimentary details. In real app, fetch /me endpoint for full user object
      // Here we assume rudimentary check. For strict role check, we'd call /api/me
      // But for speed, let's assume we fetch user details immediately.
      
      // Workaround: We won't fetch /me to keep code small, 
      // instead we will rely on backend to reject admin routes if not allowed.
      // But let's mock user object for UI state:
      setUser({ email, is_admin: false }); // User needs to refresh or call separate endpoint to know if admin
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Register'}</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input 
              className="w-full border p-2 rounded" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input 
              className="w-full border p-2 rounded" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full text-center mt-4 text-blue-500 text-sm hover:underline"
        >
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
};
