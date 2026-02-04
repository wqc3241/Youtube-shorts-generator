
import React, { useState } from 'react';
import { X, Clock, Calendar as CalIcon } from 'lucide-react';

interface ScheduleModalProps {
  onClose: () => void;
  onConfirm: (date: string) => void;
  candidateTitle: string;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ onClose, onConfirm, candidateTitle }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onConfirm(`${date}T${time}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Schedule Short</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Confirming schedule for <span className="text-slate-900 font-semibold">"{candidateTitle}"</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Post Date
            </label>
            <div className="relative">
              <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                required
                value={date}
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
            Confirm Schedule
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
