// app/page.tsx
"use client";

import { useRef, useState, useEffect } from 'react';
import { Plus, Mic, Send, Square } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { useAppContext } from './components/AppContext';

const API_BASE_URL = 'http://localhost:8000';

export default function HomePage() {
  const {
    conversations,
    files,
    activeSessionId,
    setActiveSessionId,
    addMessageToConversation,
    addFileToGlobalPool,
    createNewConversation,
    updateConversationTitle,
  } = useAppContext();
  
  const activeConversation = conversations.find(c => c.id === activeSessionId) || null;
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handlePlusClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to process file");
      
      await addFileToGlobalPool({
        name: file.name,
        extractedText: data.extractedText,
      });
      
    } catch (error) { 
      console.error("File upload failed:", error); 
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return;

    let currentSessionId = activeSessionId;
    let isFirstMessage = false;

    if (!currentSessionId) {
      try {
        const newSessionId = await createNewConversation();
        currentSessionId = newSessionId;
        isFirstMessage = true;
      } catch (error) {
        console.error("Failed to create new conversation:", error);
        return;
      }
    } else {
      const conversation = conversations.find(c => c.id === currentSessionId);
      isFirstMessage = conversation ? conversation.messages.length === 0 : false;
    }

    const userMessage = { role: 'user' as const, content: inputValue };
    await addMessageToConversation(currentSessionId, userMessage);
    setInputValue('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingResponse('');

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const globalContextText = files.map(f => f.extractedText).join('\n\n---\n\n');
      const currentConversation = conversations.find(c => c.id === currentSessionId);
      const conversationHistory = currentConversation ? currentConversation.messages : [];
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: userMessage.content,
            contextText: globalContextText || null,
            conversationHistory: conversationHistory
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Network response failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          try {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6).trim();
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr);
                    if (data.error) {
                      throw new Error(data.error);
                    }
                    if (data.done) {
                      setIsStreaming(false);
                      setIsLoading(false);
                      break;
                    }
                    if (data.content) {
                      fullResponse += data.content;
                      setStreamingResponse(fullResponse);
                    }
                  }
                } catch (parseError) {
                  console.warn('Failed to parse JSON:', line, parseError);
                  continue;
                }
              }
            }
          } catch (readError) {
            console.error('Error reading stream:', readError);
            break;
          }
        }
      }

      // Save the complete response
      if (fullResponse) {
        const aiResponse = { role: 'assistant' as const, content: fullResponse };
        await addMessageToConversation(currentSessionId, aiResponse);
        
        // Generate title for first message
        if (isFirstMessage) {
          try {
            const titleResponse = await fetch(`${API_BASE_URL}/generate-title`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firstUserMessage: userMessage.content,
                firstAiMessage: fullResponse,
              }),
            });
            
            if (titleResponse.ok) {
              const titleData = await titleResponse.json();
              await updateConversationTitle(currentSessionId!, titleData.title);
            }
          } catch (titleError) {
            console.error("Failed to generate title:", titleError);
          }
        }
      }
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Chat error:", error);
      }
    } finally { 
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingResponse('');
      abortControllerRef.current = null;
    }
  };
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, streamingResponse]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center h-full p-4">
        <h1 className="text-4xl font-semibold">Welcome to Reporto</h1>
        <p className="text-gray-400 mt-2">Click "New Chat" or upload a file to get started.</p>
        {isUploading && <p className="text-blue-400 mt-4">Uploading file...</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="application/pdf,image/*" />
      <header className="p-4 border-b border-gray-700/50">
        <h1 className="text-lg font-semibold">{activeConversation.title || "New Chat"}</h1>
        {isUploading && <p className="text-sm text-blue-400">Uploading file...</p>}
      </header>
      
      <div className="flex-1 overflow-y-auto">
        {activeConversation.messages.length === 0 && !isStreaming ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-full p-4">
            <h1 className="text-3xl font-semibold">Analysis Ready</h1>
            <p className="text-gray-400 mt-2">Ask a question about your uploaded documents or get medical advice.</p>
            {files.length > 0 && (
              <p className="text-sm text-green-400 mt-2">{files.length} document{files.length > 1 ? 's' : ''} uploaded</p>
            )}
          </div>
        ) : (
          <div>
            {activeConversation.messages.map((msg, index) => (
              <ChatMessage key={index} role={msg.role} content={msg.content} />
            ))}
            {isStreaming && streamingResponse && (
              <ChatMessage role="assistant" content={streamingResponse} isStreaming={true} />
            )}
            {isLoading && !isStreaming && (
              <ChatMessage role="assistant" content="Thinking..." />
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl mx-auto p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={files.length > 0 ? "Ask anything about your reports or get medical advice..." : "Ask me anything about health and medicine..."}
              className="w-full bg-[#1e1f22] rounded-lg border border-gray-600 pl-4 pr-28 py-3"
              disabled={isLoading || isStreaming}
            />
            <div className="absolute right-3 flex items-center gap-2">
              <button 
                onClick={handlePlusClick} 
                type="button" 
                className="p-1 text-gray-400 hover:text-white disabled:opacity-50" 
                disabled={isUploading || isLoading || isStreaming}
              >
                <Plus size={22} />
              </button>
              <button 
                type="button" 
                className="p-1 text-gray-400 hover:text-white"
                disabled={isLoading || isStreaming}
              >
                <Mic size={22} />
              </button>
              {isStreaming ? (
                <button 
                  onClick={stopStreaming}
                  type="button" 
                  className="p-1 text-red-400 hover:text-red-300"
                  title="Stop generation"
                >
                  <Square size={22} fill="currentColor" />
                </button>
              ) : (
                inputValue && !isLoading && (
                  <button type="submit" className="p-1 text-gray-400 hover:text-white">
                    <Send size={22} />
                  </button>
                )
              )}
            </div>
          </div>
        </form>
        <p className="text-center text-xs text-gray-500 mt-2">
          Reporto can make mistakes. Please verify important medical information.
        </p>
      </div>
    </div>
  );
}