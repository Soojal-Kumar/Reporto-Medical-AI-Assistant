// app/components/Sidebar.tsx
"use client";

import { useEffect } from 'react';
import { Plus, FileText, MessageSquare, PanelLeftClose, Trash2, LogOut, Search, Repeat2Icon } from 'lucide-react';
import { useAppContext } from './AppContext';
import { signOut } from "firebase/auth";
import { auth } from '@/firebase/config';

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { 
    user, 
    conversations, 
    files,
    activeSessionId, 
    setActiveSessionId, 
    createNewConversation, 
    deleteConversation,
    deleteFile
  } = useAppContext();
  
  // const activeConversation = conversations.find(c => c.id === activeSessionId) || null; // This variable was unused

  useEffect(() => {
    if (!activeSessionId && conversations.length > 0) {
      setActiveSessionId(conversations[0].id);
    }
    if (activeSessionId && !conversations.some(c => c.id === activeSessionId)) {
      setActiveSessionId(conversations.length > 0 ? conversations[0].id : null);
    }
  }, [conversations, activeSessionId, setActiveSessionId]);

  if (!isOpen) return null;
  
  const handleNewChat = async () => { await createNewConversation(); };
  const handleSignOut = async () => { await signOut(auth); };

  const handleDeleteChat = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteConversation(sessionId);
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this file? This will remove it from all conversations.")) {
      await deleteFile(fileId);
    }
  };

  return (
    <div className="flex flex-col h-full text-sm whitespace-nowrap">
      <div onClick={handleNewChat} className="flex items-center justify-between p-2 mb-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
        <div className="flex items-center gap-3 text-left"><Plus size={20} /> New Chat</div>
        <button onClick={(e) => { e.stopPropagation(); toggleSidebar(); }} className="p-1 rounded-md"><PanelLeftClose size={20} /></button>
      </div>

      <div className="px-2 mb-4">
        <div className="flex items-center gap-3 p-2 rounded-lg text-left w-full bg-[#1e1f22] border border-gray-600/50 text-gray-400">
          <Search size={18} /><span>Search</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          <h2 className="px-3 text-xs text-gray-400 font-semibold my-2">Report Files ({files.length})</h2>
          {files.length > 0 ? (
            <div className="space-y-1">
              {files.map((file) => (
                <div key={file.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50">
                    <div className="flex items-center gap-3 truncate">
                        <FileText size={18} className="flex-shrink-0" />
                        <span className="truncate" title={file.name}>{file.name}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteFile(e, file.id)}
                      className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete file"
                    >
                      <Trash2 size={16} />
                    </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-3 text-xs text-gray-500">No files uploaded yet.</p>
          )}
        </div>

        <div>
          <h2 className="px-3 text-xs text-gray-400 font-semibold my-2">Chat History ({conversations.length})</h2>
          {conversations.length > 0 ? (
            <div className="space-y-1">
              {conversations.map((convo) => (
                <div key={convo.id} onClick={() => setActiveSessionId(convo.id)}
                  className={`group relative flex items-center p-3 rounded-lg truncate cursor-pointer ${
                    activeSessionId === convo.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                  }`}>
                    <div className="flex items-center gap-3 truncate flex-1">
                      <MessageSquare size={18} className="flex-shrink-0" />
                      <span className="truncate" title={convo.title || "New Chat"}>{convo.title || "New Chat"}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteChat(e, convo.id)}
                      className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      title="Delete conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-3 text-xs text-gray-500">No conversations yet.</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-700/50 pt-2 mt-2 space-y-1">
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50"><Repeat2Icon size={18} /> Reporto</a>
        <div className="flex items-center justify-between p-3 rounded-lg mt-2">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-bold truncate max-w-[120px]" title={user?.displayName || user?.email || "User"}>
                  {user?.displayName || user?.email || "User"}
                </p>
              </div>
          </div>
          <button 
            onClick={handleSignOut} 
            className="p-2 text-gray-400 hover:text-white"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}