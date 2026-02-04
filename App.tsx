
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gemini = useRef(new GeminiService());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const meta: VideoMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      url,
      duration: 300 
    };

    setUploadedVideo(meta);
    setAppState(AppState.ANALYZING);
    startAnalysis(meta);
  };

  const startAnalysis = async (meta: VideoMetadata) => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 200);

    try {
      const results = await gemini.current.analyzeVideo(meta.name, meta.duration || 300);
      setCandidates(results);
      setAppState(AppState.REVIEWING);
      setAnalysisProgress(100);
      clearInterval(interval);
    } catch (err) {
      console.error(err);
      setAppState(AppState.IDLE);
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

  const handleRegenerate = async (id: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, title: 'Analysing...', description: 'Our AI is re-scanning engagement points...' } : c
    ));
    setTimeout(() => {
      setCandidates(prev => prev.map(c => 
        c.id === id ? { ...c, title: "Better Viral Moment", confidence: Math.floor(Math.random() * 20) + 80 } : c
      ));
    }, 1500);
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
  };

  const menuItems = [
    { id: 'upload', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'shorts', icon: Sparkles, label: 'AI Shorts' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <PlaySquare size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">ShortsMagic</h1>
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsSidebarOpen(false)}>
            <CloseIcon size={20} />
          </button>
        </div>

        <nav className="flex-grow px-4 mt-4 space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === item.id 
                  ? 'bg-red-50 text-red-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all">
            <Settings size={18} />
            Settings
          </button>
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
            <p className="text-sm font-bold text-slate-900">Pro Creator</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 w-64 lg:w-96">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2 md:gap-3 pl-4 md:pl-6 border-l border-slate-200">
              <span className="hidden sm:block text-sm font-semibold text-slate-600">Studio</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                <User size={16} className="text-slate-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Area */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto pb-32">
            
            {appState === AppState.IDLE && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-100 blur-3xl rounded-full" />
                  <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center group cursor-pointer hover:border-red-500/50 hover:bg-red-50 transition-all duration-300">
                    <Upload size={32} className="text-slate-300 md:text-slate-200 group-hover:text-red-500 group-hover:scale-110 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900">Create Viral Shorts</h2>
                  <p className="text-slate-500 max-w-sm md:max-w-md mx-auto leading-relaxed text-sm md:text-base">
                    Upload your video and let Gemini AI extract the best moments for your YouTube channel.
                  </p>
                </div>
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 text-white px-8 md:px-12 py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg hover:bg-slate-800 hover:shadow-xl active:scale-95 transition-all"
                >
                  Upload Long Video
                </button>
              </div>
            )}

            {appState === AppState.ANALYZING && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 md:space-y-12 animate-in fade-in duration-500">
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-red-600 transition-all duration-500 ease-out"
                      strokeDasharray="100 100"
                      strokeDashoffset={100 - analysisProgress}
                      style={{ strokeDasharray: '283', strokeDashoffset: `${283 * (1 - analysisProgress / 100)}` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl md:text-5xl font-extrabold text-slate-900">{analysisProgress}%</span>
                    <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Processing</span>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900">AI is Analyzing Footage</h3>
                  <div className="flex items-center gap-2 justify-center text-slate-500 text-sm">
                    <Sparkles size={16} className="text-red-500 animate-pulse" />
                    <span>Detecting engagement spikes and transitions...</span>
                  </div>
                </div>
              </div>
            )}

            {appState === AppState.REVIEWING && (
              <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">AI Recommendations</h2>
                    <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                      <Video size={14} /> {uploadedVideo?.name} • Found {candidates.length} segments
                    </p>
                  </div>
                  <button 
                    onClick={resetUpload}
                    className="self-start sm:self-auto px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs md:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel Analysis
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {candidates.map((candidate) => (
                    <ShortsCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      videoUrl={uploadedVideo?.url || ''}
                      onSelect={handleSelect}
                      onDiscard={handleDiscard}
                      onRegenerate={handleRegenerate}
                      onSchedule={(id) => setSchedulingId(id)}
                    />
                  ))}
                </div>

                {/* Sticky Footer Action - Fully Responsive */}
                <div className="fixed bottom-0 md:bottom-6 left-0 right-0 md:left-auto md:right-8 lg:right-12 md:max-w-xl lg:max-w-2xl bg-white/95 backdrop-blur-xl border-t md:border border-slate-200 p-4 md:rounded-3xl flex flex-col sm:flex-row items-center justify-between shadow-2xl z-40 gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto px-2">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-bold shrink-0">
                      {candidates.filter(c => c.status === 'selected').length}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ready to publish</span>
                      <span className="font-bold text-slate-900 truncate">Segments Selected</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {candidates.some(c => c.status === 'selected') ? (
                      <button 
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg shadow-slate-900/10"
                        onClick={() => alert('Publishing pipeline started for ' + candidates.filter(c => c.status === 'selected').length + ' segments!')}
                      >
                        Publish All
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic px-2">Choose your favorite clips to publish</span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Scheduling Modal */}
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
