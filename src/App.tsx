import React, { useState } from 'react';
import { Brain, FilePlus, Archive, Settings, LayoutDashboard, Menu, Activity, ShieldPlus, BookOpen } from 'lucide-react';
import CaseUpload from './components/CaseUpload';
import ReportViewer from './components/ReportViewer';
import BrainVisualization from './components/BrainVisualization';
import ArchiveList from './components/ArchiveList';
import KnowledgeBase from './components/KnowledgeBase';
import { CaseRecord, CaseRecordDraft } from './types';

// Use basic layout and state management
type ViewState = 'dashboard' | 'upload' | 'inference3d' | 'archive' | 'report' | 'kb';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleCaseCreated = (newCase: CaseRecordDraft) => {
    const caseWithNumber: CaseRecord = { ...newCase, caseNumber: cases.length + 1 };
    setCases(prev => [caseWithNumber, ...prev]);
    setSelectedCaseId(caseWithNumber.id);
    setCurrentView('report');
  };

  const handleUpdateStatus = (id: string, status: CaseRecord['status']) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const openReport = (id: string) => {
    setSelectedCaseId(id);
    setCurrentView('report');
  };

  const activeCase = cases.find(c => c.id === selectedCaseId);

  return (
    <div className="min-h-screen bg-slate-900 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#080c16] text-slate-300 flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden shadow-2xl z-20 border-r border-[#1e293b]">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a] to-[#080c16]">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
            <ShieldPlus size={22} />
          </div>
          <span className="font-bold text-lg text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">NeuroClinical AI</span>
        </div>

        <nav className="flex-1 pt-6 pb-6 px-4 space-y-1.5 custom-scrollbar overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Core Environment</div>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium ${currentView === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}
          >
            <LayoutDashboard size={18} /> Diagnostics Hub
          </button>
          
          <button 
            onClick={() => setCurrentView('upload')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium ${currentView === 'upload' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}
          >
            <FilePlus size={18} /> Initialize Case
          </button>

          <button 
            onClick={() => setCurrentView('inference3d')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium ${currentView === 'inference3d' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}
          >
            <Brain size={18} /> Neural Dynamics
          </button>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-8 px-2">Knowledge & Records</div>

          <button 
            onClick={() => setCurrentView('kb')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium ${currentView === 'kb' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}
          >
            <BookOpen size={18} /> Clinical KB
          </button>

          <button 
            onClick={() => setCurrentView('archive')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium ${(currentView === 'archive' || currentView === 'report') ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}
          >
             <Archive size={18} /> Case Archive
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800/80 bg-[#080c16]">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium hover:bg-slate-800/50 hover:text-slate-200 border border-transparent">
             <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content Arena */}
      <main className="flex-1 min-w-0 p-8 h-screen overflow-hidden bg-[#0f172a] text-slate-200 flex flex-col relative">
        
        {/* Dynamic Background Top Glow */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none z-0"></div>

        {/* Top Header */}
        <header className="mb-6 flex items-center justify-between z-10 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {currentView === 'dashboard' && 'Active Inference Diagnostics Hub'}
              {currentView === 'upload' && 'Case Initialization'}
              {currentView === 'inference3d' && 'Active Inference Neural Dynamics'}
              {currentView === 'archive' && 'Archived Cases'}
              {currentView === 'kb' && 'Knowledge Base & RAG Query'}
              {currentView === 'report' && 'Clinical Review & Interactive Dialogue'}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">Real-time analytical inference and therapeutic planning</p>
          </div>

          {/* KPI Minis (glassmorphism if in dashboard) */}
          <div className="flex gap-4">
             <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-lg flex items-center gap-4 pr-6 transition-all hover:bg-slate-800/60">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Active</div>
                  <div className="font-bold text-xl leading-none text-white">{cases.filter(c => c.status === 'Pending' || c.status === 'Delegated').length}</div>
                </div>
             </div>
             <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-lg flex items-center gap-4 pr-6 transition-all hover:bg-slate-800/60">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Archive size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Approved</div>
                  <div className="font-bold text-xl leading-none text-white">{cases.filter(c => c.status === 'Approved').length}</div>
                </div>
             </div>
          </div>
        </header>

        {/* View Component Wrapper (z-10 layer for scrolling views) */}
        <div className={`flex-1 min-h-0 z-10 ${currentView === 'dashboard' ? '' : 'overflow-y-auto custom-scrollbar'}`}>
          {currentView === 'dashboard' && (
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl bg-black">
              {/* Immersive 3D layer */}
              <div className="absolute inset-0">
                <BrainVisualization hideLegend={true} className="w-full h-full border-none rounded-none shadow-none" caseActive={cases.length > 0} />
              </div>
              
              {/* Glassmorphism UI Overlay */}
              <div className="absolute inset-0 z-10 p-6 flex flex-col pointer-events-none">
                 
                 {/* Top Status Banner */}
                 <div className="flex justify-between items-start pointer-events-auto">
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-xl max-w-sm">
                      <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Brain size={18} className="text-blue-400" /> Markov Blanket Status</h3>
                      <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">Sensory / Active States</span>
                            <span className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-xs font-semibold">COUPLED</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">Inference Engine</span>
                            <span className="font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md text-xs font-semibold">SYNCED</span>
                          </div>
                      </div>
                    </div>
                 </div>

                 {/* Bottom Action Area */}
                 <div className="mt-auto flex gap-6 items-end pointer-events-auto">
                    {/* Cases Mini List */}
                    <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl pt-1 flex flex-col max-h-[300px]">
                       <ArchiveList cases={cases.slice(0, 3)} onSelectCase={openReport} />
                    </div>

                    <button 
                      onClick={() => setCurrentView('upload')}
                      className="ml-auto flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] border border-blue-400/50"
                    >
                      <FilePlus size={24} /> Generate New Clinical Report
                    </button>
                    <button 
                      onClick={() => setCurrentView('inference3d')}
                      className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md text-white px-6 py-4 rounded-2xl font-bold border border-slate-600 transition-all hover:scale-105"
                    >
                      <Brain size={24} /> Expand 3D
                    </button>
                 </div>
              </div>
            </div>
          )}

          {currentView === 'upload' && (
            <CaseUpload onCaseCreated={handleCaseCreated} />
          )}

          {currentView === 'inference3d' && (
            <div className="w-full h-full flex flex-col">
              <div className="mb-4 shrink-0 z-10">
                <div className="bg-slate-800/80 backdrop-blur-md p-6 border border-slate-700/50 rounded-2xl shadow-xl max-w-5xl">
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Brain className="text-blue-400" /> Hierarchical Markov Blanket Dynamics</h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    This visualization simulates cortical column firing mapping to real-world clinical inference. 
                    <strong className="text-[#e2e8f0]"> External states</strong> (grey/white) represent presenting symptoms, narrative, environmental toxins, and clinical history. These transmit to spinal/medullary receptors as <strong className="text-[#39ff14]">Sensory states</strong> (green).
                    <br/><br/>
                    As processing ascends to the midbrain and cortex, complex decisions form the <strong className="text-[#00ffff]">Internal states</strong> (cyan), representing the exact pathophysiology, disease mechanics, and diagnostic inference (e.g., Wilson's disease). <strong className="text-[#ff007f]">Active states</strong> (pink) demonstrate the resulting clinical action or neuro-motor output, completing the blanket.
                  </p>
                  {cases.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-[#39ff14] text-xs font-mono font-bold tracking-wider">
                       <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse shadow-[0_0_8px_#39ff14]"></span>
                       LIVE SIMULATION: ACTIVE CASE LOADED
                    </div>
                  )}
                </div>
              </div>
              <BrainVisualization className="flex-1 w-full" caseActive={cases.length > 0} />
            </div>
          )}

          {currentView === 'kb' && (
            <KnowledgeBase />
          )}

          {currentView === 'archive' && (
            <div className="max-w-5xl h-full pb-8">
              <ArchiveList cases={cases} onSelectCase={openReport} showSearch={true} />
            </div>
          )}

          {currentView === 'report' && activeCase && (
            <ReportViewer 
               caseRecord={activeCase} 
               onUpdateStatus={handleUpdateStatus} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
