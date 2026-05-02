import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Database, BookOpen, Bot, Send, Loader2, Trash2 } from 'lucide-react';
import { queryKnowledgeBase } from '../services/geminiService';
import Markdown from 'react-markdown';

interface KBFile {
  id: string;
  name: string;
  content: string;
  size: number;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function KnowledgeBase() {
  const [files, setFiles] = useState<KBFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Knowledge Base initialized. I am ready to extract and cross-reference clinical information from your uploaded files. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (uploadedFiles: FileList | File[]) => {
    const newDocs: KBFile[] = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const text = await file.text();
        newDocs.push({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: file.size,
            content: text
        });
    }
    setFiles(prev => [...prev, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const resultText = await queryKnowledgeBase(userMessage, files);
      setMessages(prev => [...prev, { role: 'model', content: resultText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: 'Connection error while querying the knowledge base.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 text-slate-800">
      {/* File Upload & List Panel (Left) */}
      <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 bg-slate-50 relative">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Database size={22} className="text-blue-600" />
                Clinical Repository
            </h2>
            <p className="text-sm text-slate-500 mt-1">Upload reference materials (txt, md)</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Upload Zone */}
            <div 
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload size={32} className={`mb-3 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                <p className="text-sm font-medium text-slate-700">Click or drag & drop text files</p>
                <p className="text-xs text-slate-500 mt-1">Supports generic text/Markdown formats</p>
                <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept=".txt,.md,.csv,.json"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
            </div>

            <div className="mt-8 space-y-3">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Indexed Documents ({files.length})</h3>
                {files.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={18} className="text-blue-500 shrink-0" />
                            <div className="truncate">
                                <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                                <p className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleRemoveFile(f.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove Document"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {files.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                        <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents in knowledge base</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Query/Chat Interface (Right) */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Bot size={22} className="text-blue-600" />
                KB Intelligence Query
            </h2>
            <p className="text-sm text-slate-500 mt-1">Cross-reference clinical data, guidelines, and uploaded contexts.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" ref={scrollRef}>
             {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={16} className="text-blue-600" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                    {msg.role === 'model' ? (
                      <div className="markdown-body prose prose-sm max-w-none text-slate-800 leading-relaxed">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-blue-600" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm rounded-tl-none">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                  </div>
                </div>
              )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="E.g., What are the criteria for hepatorenal syndrome based on the guidelines?"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </div>
            <p className="text-xs text-center text-slate-400 mt-2">Intelligence query will utilize the indexed documents in your Clinical Repository.</p>
        </div>
      </div>
    </div>
  );
}
