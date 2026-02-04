
import React, { useRef, useEffect } from 'react';

interface VideoPreviewProps {
  url: string;
  startTime: number;
  endTime: number;
  isPlaying?: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ url, startTime, endTime, isPlaying = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
    }
  }, [startTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        if (!isPlaying) video.pause();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [startTime, endTime, isPlaying]);

  return (
    <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover"
        muted
        playsInline
        autoPlay={isPlaying}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-4 left-4 right-4">
        <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-600 transition-all duration-300" 
            style={{ width: '30%' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
