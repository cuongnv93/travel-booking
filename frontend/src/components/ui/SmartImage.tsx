'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SmartImageProps extends Omit<ImageProps, 'src' | 'alt' | 'onLoad' | 'onError'> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  containerClassName?: string;
  showIcon?: boolean;
}

export const SmartImage = React.forwardRef<HTMLImageElement, SmartImageProps>(function SmartImage(
  {
    src,
    alt,
    fallbackSrc = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    containerClassName,
    className,
    fill,
    width,
    height,
    showIcon = true,
    ...rest
  },
  ref
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  return (
    <div className={cn('relative overflow-hidden bg-slate-100', fill && 'w-full h-full', containerClassName)}>
      {/* Light shimmer placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 z-[1] bg-slate-100/90 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
          {showIcon && (
            <div className="text-slate-300 flex flex-col items-center gap-1 opacity-60">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
          )}
        </div>
      )}

      <Image
        ref={ref}
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          }
          setIsLoaded(true);
        }}
        className={cn(
          'transition-all duration-700 ease-out',
          isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-[1.02]',
          className
        )}
        {...rest}
      />
    </div>
  );
});

export default SmartImage;
