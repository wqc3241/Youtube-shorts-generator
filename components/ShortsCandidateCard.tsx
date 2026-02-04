
import React from 'react';
import { ShortsCandidate } from '../types';
import VideoPreview from './VideoPreview';
import { Check, Calendar, RotateCcw, Trash2 } from 'lucide-react';

interface ShortsCandidateCardProps {
  candidate: ShortsCandidate;
  videoUrl: string;
  onSelect: (id: string) => void;
  onDiscard: (id: string) => void;
  onRegenerate: (id: string) => void;
  onSchedule: (id: string) => void;
}

const ShortsCandidateCard: React.FC<ShortsCandidateCardProps> = ({
  candidate,
  videoUrl,
  onSelect,
  onDiscard,
  onRegenerate,
  onSchedule
}) => {
  const isSelected = candidate.status === 'selected';
  const isDiscarded = candidate.status === 'discarded';

  return (
    <div className={`group relative flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-2xl transition-all duration-300 border ${
      isSelected 
        ? 'bg-red-50 border-red-200 shadow-sm' 
        : 'bg-white border-slate-200 hover:border-red-200 hover:shadow-md'
    } ${isDiscarded ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
      
      {/* Visual Preview Section */}
      <div className="w-full md:w-40 lg:w-48 shrink-0">
        <VideoPreview 
          url={videoUrl} 
          startTime={candidate.startTime} 
          endTime={candidate.endTime} 
        />
      </div>

      {/* Info Section */}
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-grow pr-2">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
              {candidate.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {Math.floor(candidate.startTime / 60)}:{(candidate.startTime % 60).toString().padStart(2, '0')} - 
                {Math.floor(candidate.endTime / 60)}:{(candidate.endTime % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                {candidate.confidence}% AI Accuracy
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {!isSelected && !isDiscarded && (
              <>
                <button 
                  onClick={() => onDiscard(candidate.id)}
                  className="p-1.5 md:p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                  title="Discard"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => onRegenerate(candidate.id)}
                  className="p-1.5 md:p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                  title="Regenerate"
                >
                  <RotateCcw size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-4 md:mb-6 leading-relaxed flex-grow line-clamp-2 md:line-clamp-none">
          {candidate.description}
        </p>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
          <div className="flex items-center gap-4">
            {isSelected ? (
              <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                <Check size={16} /> Selected
              </div>
            ) : (
              <button 
                onClick={() => onSelect(candidate.id)}
                className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
              >
                Select Segment
              </button>
            )}
          </div>

          {isSelected && (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {candidate.scheduledTime && (
                <div className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  <Calendar size={12} /> {new Date(candidate.scheduledTime).toLocaleDateString()}
                </div>
              )}
              <button 
                onClick={() => onSchedule(candidate.id)}
                className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs md:text-sm transition-all"
              >
                <Calendar size={14} />
                {candidate.scheduledTime ? 'Reschedule' : 'Schedule'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortsCandidateCard;
