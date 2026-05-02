import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Paperclip } from 'lucide-react';
import { getGemini } from '../services/geminiService';
import Markdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface ChatBoxProps {
  context: string;
}

export default function ChatBox({ context }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Hello doctor. I am ready to discuss this case. Do you have any specific queries, modifications, or opinions to add to the report?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const fileAddition = `\n\n[File Attached: ${file.name}]\n${text}\n[End of File]`;
      setInput(prev => prev ? prev + fileAddition : fileAddition.trim());
    } catch (err) {
      console.error("Failed to read file", err);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const aiInstance = getGemini();
      
      // Build history for the chat
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // Start chat
      const chat = aiInstance.chats.create({
        model: 'gemini-2.5-flash',
        history: [
            { role: 'user', parts: [{ text: `You are an expert AI clinical assistant. We are discussing the following case report. Be precise, analytical, and professional.\n\nContext to refer to:\n${context}` }]},
            { role: 'model', parts: [{ text: "Understood. I will use this case report as context to assist you." }]},
            ...history
        ],
      });

      const result = await chat.sendMessage({ message: userMessage });
      
      setMessages(prev => [...prev, { role: 'model', content: result.text }]);
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Sorry, there was an error processing your request. Please ensure the API key is configured.';
      const errorMessage = err?.message || String(err);
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = '⚠️ **API Quota Exceeded:** You have exceeded your Gemini API quota. Please check your plan and billing details at Google AI Studio, or wait for the limit to reset.';
      }
      setMessages(prev => [...prev, { role: 'model', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-slate-100 border-b border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Bot size={18} className="text-blue-600" />
          Interactive Clinical Dialogue
        </h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-blue-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
              {msg.role === 'model' ? (
                <div className="markdown-body prose prose-sm max-w-none text-slate-800">
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                msg.content
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User size={16} className="text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-blue-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm rounded-tl-none">
              <Loader2 size={16} className="animate-spin text-slate-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-end gap-2">
          <button 
            title="Upload file for context"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0 mb-1"
          >
            <Paperclip size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".txt,.csv,.md,.json" 
            onChange={handleFileUpload} 
          />
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question, request modifications, or attach files..."
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans text-slate-800 placeholder:text-slate-400 resize-none min-h-[46px] max-h-32 custom-scrollbar"
            rows={Math.max(1, Math.min(input.split('\n').length, 4))}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 shrink-0 mb-1"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
