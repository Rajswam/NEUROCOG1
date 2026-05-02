import React, { useState } from 'react';
import { CaseRecord } from '../types';
import Markdown from 'react-markdown';
import { CheckCircle, Clock, Save, FileText, Activity } from 'lucide-react';
import ChatBox from './ChatBox';

interface ReportViewerProps {
  caseRecord: CaseRecord;
  onUpdateStatus: (id: string, status: CaseRecord['status']) => void;
}

export default function ReportViewer({ caseRecord, onUpdateStatus }: ReportViewerProps) {
  const handleApprove = () => {
    onUpdateStatus(caseRecord.id, 'Approved');
  };

  const handleDelegate = () => {
    onUpdateStatus(caseRecord.id, 'Delegated');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left side: Report Document */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText size={22} className="text-blue-600" />
              Active Inference Analytical Report
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Case #{caseRecord.caseNumber} • {caseRecord.specialty}
            </p>
          </div>
          <div className="flex items-center gap-3">
             {caseRecord.status === 'Pending' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                <Clock size={14} /> Pending Review
              </span>
             )}
             {caseRecord.status === 'Approved' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                <CheckCircle size={14} /> Approved
              </span>
             )}
              {caseRecord.status === 'Delegated' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                <Activity size={14} /> Delegated
              </span>
             )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <div className="max-w-3xl mx-auto">
            <div className="markdown-body prose prose-slate prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none">
              <Markdown>{caseRecord.report || '*No report generated*'}</Markdown>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
           <span className="text-xs text-slate-400 font-mono">ID: {caseRecord.id} • Generated {new Date(caseRecord.createdAt).toLocaleString()}</span>
           <div className="flex gap-3">
             <button 
                onClick={handleDelegate}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-sm transition-colors"
             >
                Delegate Case
             </button>
             {caseRecord.status === 'Pending' && (
               <button 
                 onClick={handleApprove}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
               >
                  <CheckCircle size={16} />
                  Approve Report
               </button>
             )}
           </div>
        </div>
      </div>

      {/* Right side: Chat & Interactions */}
      <div className="w-[400px] shrink-0">
        <ChatBox context={caseRecord.report || ''} />
      </div>
    </div>
  );
}
