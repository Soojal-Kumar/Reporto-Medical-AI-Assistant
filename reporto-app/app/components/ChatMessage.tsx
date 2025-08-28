// app/components/ChatMessage.tsx
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type ChatMessageProps = {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

export function ChatMessage({ role, content, isStreaming = false }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`w-full py-6 px-4 md:px-6 border-b border-gray-800/30 ${
      isUser ? 'bg-transparent' : 'bg-gray-900/20'
    }`}>
<div className={`max-w-4xl mx-auto flex items-start gap-4 ${isUser ? 'flex-row-reverse justify-end' : ''}`}>        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full ${
          isUser ? 'bg-orange-500' : 'bg-gray-700'
        }`}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-gray-300" />
          )}
        </div>
        
        {/* CONTENT */}
        {isUser ? (
          // --- User's Message: Clean text with subtle styling ---
          <div className="flex-1">
            <p className="text-white text-base leading-relaxed">{content}</p>
          </div>
        ) : (
          // --- AI's Message: Better formatted with streaming cursor ---
          <div className="flex-1">
            <div className="prose prose-invert max-w-none text-gray-100 text-sm">
              <ReactMarkdown
                components={{
                  // Better styling for markdown elements with smaller font sizes
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 text-white" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-semibold mb-2 text-white" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-2 text-white" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-orange-400" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-0.5 ml-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-0.5 ml-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-0.5 text-gray-300 text-sm" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 text-gray-300 leading-relaxed text-sm" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-400 mb-3 text-sm" {...props} />
                  ),
                  code: ({node, inline, ...props}) => 
                    inline ? (
                      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-orange-300 text-xs" {...props} />
                    ) : (
                      <code className="block bg-gray-800 p-3 rounded-lg text-orange-300 text-xs overflow-x-auto" {...props} />
                    ),
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-orange-400 animate-pulse ml-1" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}