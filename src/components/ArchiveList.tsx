import React, { useState, useMemo } from 'react';
import { CaseRecord } from '../types';
import { FileText, ChevronRight, Clock, CheckCircle, Activity, Search, Calendar, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface ArchiveListProps {
  cases: CaseRecord[];
  onSelectCase: (id: string) => void;
  showSearch?: boolean;
}

export default function ArchiveList({ cases, onSelectCase, showSearch = false }: ArchiveListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredCases = useMemo(() => {
    let result = cases;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.caseNumber.toString().includes(q) ||
        c.specialty.toLowerCase().includes(q) ||
        format(c.createdAt, 'MMM dd, yyyy').toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      const diff = b.createdAt.getTime() - a.createdAt.getTime();
      return sortOrder === 'desc' ? diff : -diff;
    });
  }, [cases, searchQuery, sortOrder]);

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm h-64">
        <FileText size={48} className="mb-4 text-slate-300" />
        <p className="text-lg font-medium">No cases recorded yet.</p>
        <p className="text-sm">Upload a new case to start the active inference process.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden auto-rows-max flex flex-col h-full max-h-full">
      <div className="p-5 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Case Archive</h2>
            <p className="text-sm text-slate-500">Review approved cases and active monitoring</p>
          </div>
          {showSearch && (
             <button 
               onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
               className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium"
               title="Toggle sorting order"
             >
               <ArrowUpDown size={16} />
               {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
             </button>
          )}
        </div>
        
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by case number, specialty, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 bg-white placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100 overflow-y-auto custom-scrollbar flex-1">
        {filteredCases.length === 0 ? (
           <div className="p-8 text-center text-slate-500">
              No cases match your search criteria.
           </div>
        ) : (
          filteredCases.map((c) => (
            <div 
              key={c.id} 
              onClick={() => onSelectCase(c.id)}
              className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-center justify-between"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 shrink-0">
                  #{c.caseNumber}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    Case #{c.caseNumber}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-medium whitespace-nowrap overflow-hidden">
                    <span className="flex items-center gap-1.5"><Activity size={12} className="text-pink-500"/> {c.specialty}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {format(c.createdAt, 'MMM dd, HH:mm')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0">
                 {c.status === 'Pending' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                      <Clock size={14} /> Pending
                    </span>
                 )}
                 {c.status === 'Approved' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full">
                      <CheckCircle size={14} /> Approved
                    </span>
                 )}
                 {c.status === 'Delegated' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 border border-purple-200 text-purple-700 text-xs font-semibold rounded-full">
                      <Activity size={14} /> Delegated
                    </span>
                 )}
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
