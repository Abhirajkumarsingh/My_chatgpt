import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Metrics {
  total_requests: number;
  total_tokens: number;
  recent_logs_sample: any[];
}

interface UserData {
  id: number;
  email: string;
  is_active: boolean;
  daily_token_limit: number;
}

export const Admin: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users'>('metrics');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, uRes] = await Promise.all([
        client.get('/api/admin/metrics'),
        client.get('/api/admin/users')
      ]);
      setMetrics(mRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error("Admin fetch error", err);
    }
  };

  const chartData = metrics?.recent_logs_sample.map((log: any) => ({
    name: `Req ${log.id}`,
    tokens: log.tokens_used
  })) || [];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="mb-6 border-b">
         <button 
           className={`px-4 py-2 mr-2 ${activeTab === 'metrics' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
           onClick={() => setActiveTab('metrics')}
         >
           Metrics
         </button>
         <button 
           className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
           onClick={() => setActiveTab('users')}
         >
           User Management
         </button>
      </div>

      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                 <h3 className="text-gray-500 text-sm font-medium">Total Requests</h3>
                 <p className="text-4xl font-bold text-gray-900">{metrics.total_requests}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                 <h3 className="text-gray-500 text-sm font-medium">Total Tokens Consumed</h3>
                 <p className="text-4xl font-bold text-gray-900">{metrics.total_tokens}</p>
              </div>
           </div>

           <div className="bg-white p-6 rounded-lg shadow h-80">
              <h3 className="mb-4 font-semibold text-gray-700">Recent Token Usage</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tokens" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limit</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {users.map(u => (
                 <tr key={u.id}>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.id}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.daily_token_limit}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}
    </div>
  );
};
