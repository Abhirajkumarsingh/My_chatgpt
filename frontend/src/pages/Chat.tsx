import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import ReactMarkdown from 'react-markdown';
import { Send, Paperclip, Menu, Plus } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: number;
  title: string;
}

export const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentConvoId, setCurrentConvoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Settings
  const [model, setModel] = useState('mistralai/Mistral-7B-Instruct-v0.2');
  const [fileText, setFileText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await client.get('/api/conversations');
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversation = async (id: number) => {
    try {
      const { data } = await client.get(`/api/conversations/${id}`);
      setMessages(data.messages || []);
      setCurrentConvoId(id);
      if (window.innerWidth < 768) setShowSidebar(false);
    } catch (err) {
      console.error(err);
    }
  };

  const startNewChat = () => {
    setCurrentConvoId(null);
    setMessages([]);
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setFileText(text); // Basic client-side read for demo
      alert(`Attached ${file.name} context.`);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !fileText) return;

    const newHistory = [...messages, { role: 'user', content: input } as Message];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const { data } = await client.post('/api/chat', {
        prompt: input,
        conversation_id: currentConvoId,
        model: model,
        file_content: fileText,
        history: messages // sending previous history
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setFileText(null); // Clear context after use (optional)
      
      if (!currentConvoId) {
        setCurrentConvoId(data.conversation_id);
        fetchConversations();
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not reach backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar for Conversations */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
           <button 
             onClick={startNewChat}
             className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 shadow-sm"
           >
             <Plus size={18} /> New Chat
           </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c => (
            <div 
              key={c.id} 
              onClick={() => loadConversation(c.id)}
              className={`p-3 mx-2 my-1 rounded cursor-pointer truncate text-sm hover:bg-gray-200 ${currentConvoId === c.id ? 'bg-gray-200 font-medium' : 'text-gray-700'}`}
            >
              {c.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header / Mobile Toggle */}
        <div className="h-14 border-b bg-white flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
                <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-gray-100 rounded">
                    <Menu size={20} />
                </button>
                <span className="font-semibold text-gray-700">
                    {currentConvoId ? conversations.find(c => c.id === currentConvoId)?.title : 'New Chat'}
                </span>
            </div>
            <div>
                <select 
                    value={model} 
                    onChange={e => setModel(e.target.value)}
                    className="text-xs border rounded p-1"
                >
                    <option value="mistralai/Mistral-7B-Instruct-v0.2">Mistral 7B</option>
                    <option value="gpt2">GPT-2 (Test)</option>
                </select>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white shadow-sm border border-gray-100'}`}>
                <ReactMarkdown className="prose prose-sm max-w-none">
                    {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-white p-4 rounded-lg shadow-sm border animate-pulse text-gray-400 text-sm">
                 Thinking...
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="max-w-4xl mx-auto relative flex items-center gap-2 border rounded-xl p-2 shadow-sm focus-within:ring-2 ring-blue-100">
             <label className="cursor-pointer text-gray-400 hover:text-blue-500">
                 <Paperclip size={20} />
                 <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.md,.json" />
             </label>
             <input 
               className="flex-1 outline-none text-gray-700"
               placeholder="Send a message..."
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && sendMessage()}
               disabled={loading}
             />
             <button 
                onClick={sendMessage}
                disabled={loading}
                className={`p-2 rounded-lg ${loading ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
             >
                <Send size={18} />
             </button>
          </div>
          {fileText && <div className="text-xs text-green-600 mt-1 ml-2">File attached (Context loaded)</div>}
        </div>
      </div>
    </div>
  );
};
