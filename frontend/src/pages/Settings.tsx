import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';
import { User, Lock } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      // Assuming a backend endpoint for password change
      await client.post('/api/auth/change-password', {
        current_password: passwordData.current,
        new_password: passwordData.new
      });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      // If endpoint doesn't exist, show a mock success for UI demonstration or specific error
      if (err.response && err.response.status === 404) {
         setMessage({ type: 'error', text: 'Password change not implemented on server yet.' });
      } else {
         setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update password' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">User Settings</h1>

      {/* Profile Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center mb-4">
          <User className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-700">Profile Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Email Address</label>
            <div className="mt-1 text-lg text-gray-900">{user?.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Account Role</label>
            <div className="mt-1 text-lg text-gray-900 capitalize">
              {user?.is_admin ? 'Administrator' : 'User'}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Lock className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-700">Change Password</h2>
        </div>
        
        {message.text && (
          <div className={`p-3 rounded mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={passwordData.current}
              onChange={e => setPasswordData({...passwordData, current: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={passwordData.new}
              onChange={e => setPasswordData({...passwordData, new: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={passwordData.confirm}
              onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};