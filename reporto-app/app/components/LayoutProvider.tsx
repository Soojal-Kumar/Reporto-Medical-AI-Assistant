// app/components/AppContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, firestore } from '@/firebase/config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, orderBy, deleteDoc, Timestamp } from 'firebase/firestore';

// --- TYPE DEFINITIONS ---
export type Message = { role: 'user' | 'assistant'; content: string };
export type GlobalFile = {
  id: string;
  name: string;
  createdAt: Timestamp;
  userId: string;
  extractedText: string;
};
export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Timestamp;
  userId: string;
};

// --- CONTEXT SHAPE ---
interface AppContextType {
  user: User | null;
  authLoading: boolean;
  conversations: Conversation[];
  files: GlobalFile[];
  activeSessionId: string | null;
  setActiveSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  createNewConversation: () => Promise<string>;
  addMessageToConversation: (sessionId: string, message: Message) => Promise<void>;
  addFileToGlobalPool: (fileInfo: Omit<GlobalFile, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateConversationTitle: (sessionId: string, title: string) => Promise<void>;
  deleteConversation: (sessionId: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [files, setFiles] = useState<GlobalFile[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    console.log('AppContext: Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('AppContext: Auth state changed', {
        user: currentUser ? { uid: currentUser.uid, email: currentUser.email } : null,
        timestamp: new Date().toISOString()
      });
      
      setUser(currentUser);
      setAuthLoading(false);
      
      if (!currentUser) { 
        console.log('AppContext: No user, clearing data');
        setConversations([]); 
        setFiles([]); 
        setActiveSessionId(null); 
      }
    });

    return () => {
      console.log('AppContext: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Listener for conversations
  useEffect(() => {
    if (!user) { 
      console.log('AppContext: No user, clearing conversations');
      setConversations([]); 
      return; 
    }
    
    console.log('AppContext: Setting up conversations listener for user:', user.uid);
    const q = query(collection(firestore, 'users', user.uid, 'conversations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const convos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      console.log('AppContext: Conversations updated:', convos.length);
      setConversations(convos);
    }, (error) => {
      console.error('AppContext: Error listening to conversations:', error);
    });
    
    return () => {
      console.log('AppContext: Cleaning up conversations listener');
      unsubscribe();
    };
  }, [user]);

  // Listener for global files
  useEffect(() => {
    if (!user) { 
      console.log('AppContext: No user, clearing files');
      setFiles([]); 
      return; 
    }
    
    console.log('AppContext: Setting up files listener for user:', user.uid);
    const q = query(collection(firestore, 'users', user.uid, 'files'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userFiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GlobalFile));
      console.log('AppContext: Files updated:', userFiles.length);
      setFiles(userFiles);
    }, (error) => {
      console.error('AppContext: Error listening to files:', error);
    });
    
    return () => {
      console.log('AppContext: Cleaning up files listener');
      unsubscribe();
    };
  }, [user]);

  const createNewConversation = async (): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    console.log('AppContext: Creating new conversation');
    const docRef = await addDoc(collection(firestore, 'users', user.uid, 'conversations'), {
      title: "New Chat",
      messages: [],
      createdAt: serverTimestamp(),
      userId: user.uid,
    });
    setActiveSessionId(docRef.id);
    console.log('AppContext: New conversation created:', docRef.id);
    return docRef.id;
  };

  const addMessageToConversation = async (sessionId: string, message: Message) => {
    if (!user) throw new Error("User not authenticated");
    const convoRef = doc(firestore, 'users', user.uid, 'conversations', sessionId);
    await updateDoc(convoRef, { messages: arrayUnion(message) });
  };

  const addFileToGlobalPool = async (fileInfo: Omit<GlobalFile, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) throw new Error("User not authenticated");
    await addDoc(collection(firestore, 'users', user.uid, 'files'), {
      ...fileInfo,
      createdAt: serverTimestamp(),
      userId: user.uid,
    });
  };
  
  const updateConversationTitle = async (sessionId: string, title: string) => {
    if (!user) throw new Error("User not authenticated");
    const convoRef = doc(firestore, 'users', user.uid, 'conversations', sessionId);
    await updateDoc(convoRef, { title: title });
  };
  
  const deleteConversation = async (sessionId: string) => {
    if (!user) throw new Error("User not authenticated");
    const convoRef = doc(firestore, 'users', user.uid, 'conversations', sessionId);
    await deleteDoc(convoRef);
    
    // If we're deleting the active conversation, clear the active session
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!user) throw new Error("User not authenticated");
    const fileRef = doc(firestore, 'users', user.uid, 'files', fileId);
    await deleteDoc(fileRef);
  };

  const value = {
    user, authLoading, conversations, files, activeSessionId, setActiveSessionId,
    createNewConversation, addMessageToConversation, addFileToGlobalPool, 
    deleteConversation, updateConversationTitle, deleteFile
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) { throw new Error('useAppContext must be used within an AppProvider'); }
  return context;
};