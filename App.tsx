
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  Video, 
  BarChart3, 
  Settings, 
  PlaySquare, 
  Plus, 
  LayoutDashboard, 
  Sparkles,
  Search,
  Bell,
  User,
  History,
  Menu,
  CheckCircle2,
  AlertCircle,
  X as CloseIcon
} from 'lucide-react';
import { VideoMetadata, ShortsCandidate, AppState } from './types';
import { GeminiService } from './services/geminiService';
import ShortsCandidateCard from './components/ShortsCandidateCard';
import ScheduleModal from './components/ScheduleModal';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [uploadedVideo, setUploadedVideo] = useState<VideoMetadata | null>(null);
  const [candidates, setCandidates] = useState<ShortsCandidate[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gemini = useRef(new GeminiService());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024 * 1024) {
      setErrorMsg("File size exceeds 2GB limit.");
      setAppState(AppState.ERROR);
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(url);
      const duration = video.duration;
      
      const meta: VideoMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // Re-create for persistent use
        duration
      };

      setUploadedVideo(meta);
      setAppState(AppState.ANALYZING);
      startAnalysis(meta);
    };
    video.src = url;
  };

  const startAnalysis = async (meta: VideoMetadata) => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 2, 95));
    }, 300);

    try {
      const results = await gemini.current.analyzeVideo(meta.name, meta.duration || 300);
      setCandidates(results);
      setAppState(AppState.REVIEWING);
      setAnalysisProgress(100);
    } catch (err) {
      setErrorMsg("AI analysis failed. Please try again.");
      setAppState(AppState.ERROR);
    } finally {
      clearInterval(interval);
    }
  };

  const handleSelect = (id: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'selected' as const } : c
    ));
  };

  const handleDiscard = (id: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'discarded' as const } : c
    ));
  };

  const handleUpdate = (id: string, updates: Partial<ShortsCandidate>) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleBulkSelect = () => {
    setCandidates(prev => prev.map(c => ({ ...c, status: 'selected' as const })));
  };

  const handleBulkDeselect = () => {
    setCandidates(prev => prev.map(c => ({ ...c, status: 'pending' as const })));
  };

  const handleScheduleConfirm = (scheduledTime: string) => {
    if (schedulingId) {
      setCandidates(prev => prev.map(c => 
        c.id === schedulingId ? { ...c, scheduledTime } : c
      ));
      setSchedulingId(null);
    }
  };

  const resetUpload = () => {
    setUploadedVideo(null);
    setCandidates([]);
    setAppState(AppState.IDLE);
    setAnalysisProgress(0);
    setErrorMsg(null);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <PlaySquare size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">ShortsMagic</h1>
          </div>
        </div>

        <nav className="flex-grow px-4 mt-4 space-y-1.5">
          {[
            { id: 'upload', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'shorts', icon: Sparkles, label: 'AI Library' },
            { id: 'history', icon: History, label: 'Sync Logs' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === item.id ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-grow flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md z-30">
          <button className="md:hidden p-2 text-slate-500" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="hidden sm:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 w-64">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search library..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500"><Bell size={20} /></button>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200"><User size={16} /></div>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto pb-32">
            
            {appState === AppState.IDLE && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in duration-500">
                <div className="w-32 h-32 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center group cursor-pointer hover:border-red-500/50 hover:bg-red-50 transition-all">
                  <Upload size={32} className="text-slate-300 group-hover:text-red-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold">Extract Your Viral Moments</h2>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">Upload a video to generate up to 8 high-engagement Shorts with AI.</p>
                </div>
                <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl transition-all">
                  Get Started
                </button>
              </div>
            )}

            {appState === AppState.ERROR && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold">Upload Failed</h3>
                <p className="text-slate-500">{errorMsg}</p>
                <button onClick={resetUpload} className="px-6 py-2 bg-slate-100 rounded-lg font-bold">Try Again</button>
              </div>
            )}

            {appState === AppState.ANALYZING && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-extrabold">{analysisProgress}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI Thinking</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Scanning for Highlights</h3>
                  <p className="text-slate-500 text-sm">Identifying viral hooks, explanations, and conclusions...</p>
                </div>
              </div>
            )}

            {appState === AppState.REVIEWING && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                  <div>
                    <h2 className="text-2xl font-extrabold">Review Candidates</h2>
                    <p className="text-slate-500 text-sm">Gemini picked {candidates.length} segments based on engagement potential.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleBulkSelect} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold">Select All</button>
                    <button onClick={handleBulkDeselect} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold">Clear All</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {candidates.map((candidate) => (
                    <ShortsCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      videoUrl={uploadedVideo?.url || ''}
                      onSelect={handleSelect}
                      onDiscard={handleDiscard}
                      onUpdate={handleUpdate}
                      onRegenerate={() => {}}
                      onSchedule={(id) => setSchedulingId(id)}
                    />
                  ))}
                </div>

                <div className="fixed bottom-0 md:bottom-6 left-0 right-0 md:left-auto md:right-8 lg:right-12 md:max-w-xl lg:max-w-2xl bg-white/95 backdrop-blur-xl border-t md:border border-slate-200 p-4 md:rounded-3xl flex items-center justify-between shadow-2xl z-40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-bold">
                      {candidates.filter(c => c.status === 'selected').length}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Sync Queue</span>
                      <p className="font-bold text-sm">Ready to Schedule</p>
                    </div>
                  </div>
                  <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-slate-900/10">
                    Push to Channel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {schedulingId && (
        <ScheduleModal
          candidateTitle={candidates.find(c => c.id === schedulingId)?.title || ''}
          onClose={() => setSchedulingId(null)}
          onConfirm={handleScheduleConfirm}
        />
      )}
    </div>
  );
};

export default App;
