'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface VideoBackgroundProps {
  videoSrc?: string | null;
  videoSources?: { src: string; type?: string }[];
  posterSrc: string;
  fallbackPosterSrc?: string;
  overlayGradient?: string;
  className?: string;
  children?: React.ReactNode;
  alt?: string;
}

export const VideoBackground = memo(function VideoBackground({
  videoSrc,
  videoSources,
  posterSrc,
  fallbackPosterSrc = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600',
  overlayGradient = 'bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/25',
  className,
  children,
  alt = 'Background',
}: VideoBackgroundProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [currentPoster, setCurrentPoster] = useState(posterSrc || fallbackPosterSrc);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setCurrentPoster(posterSrc || fallbackPosterSrc);
  }, [posterSrc, fallbackPosterSrc]);

  useEffect(() => {
    // Reset video loaded state if video source changes
    setIsVideoLoaded(false);
    setHasVideoError(false);

    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser prevented autoplay or low power mode - keep poster visible
        });
      }
    }
  }, [videoSrc, videoSources]);

  const hasVideo = !hasVideoError && Boolean(videoSrc || (videoSources && videoSources.length > 0));

  return (
    <div className={cn('relative overflow-hidden bg-slate-950 select-none', className)}>
      {/* 1. Underlying Poster Image (Always present to ensure instant visual, fallback & smooth loop) */}
      <img
        src={currentPoster}
        alt={alt}
        onError={() => {
          if (currentPoster !== fallbackPosterSrc) {
            setCurrentPoster(fallbackPosterSrc);
          }
        }}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out pointer-events-none',
          isVideoLoaded ? 'opacity-40 scale-100' : 'opacity-80 scale-[1.02]'
        )}
        loading="eager"
      />

      {/* 2. Cinematic Background Video */}
      {hasVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={() => setIsVideoLoaded(true)}
          onPlaying={() => setIsVideoLoaded(true)}
          onError={() => {
            setHasVideoError(true);
            setIsVideoLoaded(false);
          }}
          className={cn(
            'absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ease-out',
            isVideoLoaded ? 'opacity-85' : 'opacity-0'
          )}
        >
          {videoSources && videoSources.length > 0 ? (
            videoSources.map((source, idx) => (
              <source key={idx} src={source.src} type={source.type || (source.src.endsWith('.webm') ? 'video/webm' : 'video/mp4')} />
            ))
          ) : videoSrc ? (
            <source src={videoSrc} type={videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          ) : null}
        </video>
      )}

      {/* 3. Dark atmospheric gradient overlay for readability */}
      {overlayGradient && (
        <div className={cn('absolute inset-0 pointer-events-none z-10', overlayGradient)} />
      )}

      {/* 4. Child Content (Text, search forms, buttons) */}
      {children && (
        <div className="relative z-20 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
});

export default VideoBackground;
