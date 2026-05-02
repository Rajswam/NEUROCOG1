import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2, Paperclip } from 'lucide-react';
import { CaseRecordDraft } from '../types';
import { generateAnalyticalReport } from '../services/geminiService';

interface CaseUploadProps {
  onCaseCreated: (record: CaseRecordDraft) => void;
}

const specialties = [
  "Cardiology", "Neurology", "Nephrology", "Gastroenterology", 
  "Emergency Medicine & Critical Care", "Anesthesiology", 
  "Cancer Care", "Mental Health/Psychiatry", "General Medicine"
];

export default function CaseUpload({ onCaseCreated }: CaseUploadProps) {
  const [specialty, setSpecialty] = useState(specialties[0]);
  const [presentation, setPresentation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presentation) return;

    setIsGenerating(true);

    const caseDetails = `
Specialty: ${specialty}
Clinical Presentation: 
${presentation}
    `;

    const reportContent = await generateAnalyticalReport(caseDetails);

    const newRecord: CaseRecordDraft = {
      id: Math.random().toString(36).substring(2, 9),
      specialty,
      presentation,
      report: reportContent,
      status: 'Pending',
      createdAt: new Date(),
    };

    setIsGenerating(false);
    onCaseCreated(newRecord);
    
    // reset form
    setPresentation('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setPresentation((prev) => prev ? prev + '\n\n' + text : text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl mx-auto text-slate-800">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Upload size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Case Initialization</h2>
          <p className="text-slate-500 mt-1">Provide clinical summaries to generate the 21-step active inference report.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Clinical Specialty Module</label>
          <select 
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
          >
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-700">Clinical Presentation & Initial Findings</label>
          <div className="flex flex-col gap-3">
            <div 
               className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               onClick={() => fileInputRef.current?.click()}
            >
               <Upload size={24} className={`mb-2 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
               <p className="text-sm font-medium text-slate-700">Drag & drop a patient file, or click to browse</p>
               <p className="text-xs text-slate-500 mt-1">Accepts text, markdown, csv, or json data</p>
            </div>
            
            <div className="relative">
              <textarea 
                required
                rows={10}
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y font-sans leading-relaxed text-slate-800 placeholder:text-slate-400"
                placeholder="Or type / paste the clinical presentation directly here..."
              ></textarea>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.csv,.md,.json" 
              onChange={handleFileChange} 
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            {isGenerating ? 'Running Active Inference...' : 'Generate Analytical Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
