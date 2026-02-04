
import React, { useState } from 'react';
import { X, Clock, Calendar as CalIcon, Sparkles } from 'lucide-react';

interface ScheduleModalProps {
  onClose: () => void;
  onConfirm: (date: string) => void;
  candidateTitle: string;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ onClose, onConfirm, candidateTitle }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onConfirm(`${date}T${time}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Publishing Schedule</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3 items-start">
          <Sparkles className="text-amber-600 shrink-0" size={18} />
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-bold mb-0.5">AI Suggestion</p>
            Post between <span className="font-bold">6:00 PM - 8:00 PM</span> for maximum engagement in your region.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Select Date
            </label>
            <div className="relative">
              <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                required
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Post Time
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-red-600/10 mt-2"
          >
            Schedule Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
