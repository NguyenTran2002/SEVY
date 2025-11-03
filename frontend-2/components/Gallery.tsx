import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Masonry from '@mui/lab/Masonry';
import { useTranslations } from '../lib/i18n';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { XIcon } from './icons/XIcon';
import { galleryImages } from '../data/gallery-images';

const Gallery: React.FC = () => {
  const { t, language } = useTranslations();

  // Randomize gallery images on each page visit using Fisher-Yates shuffle
  const images = useMemo(() => {
    const shuffled = [...galleryImages];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentImageIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'Escape') closeLightbox();
    };

    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, goToNext, goToPrevious, closeLightbox]);

  return (
    <>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl lg:text-center">
            <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold leading-7 text-sevy-blue">{t('gallerySubtitle')}</h2>
            <p className={`mt-2 text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
              {t('galleryTitle')}
            </p>
            <p className="mt-6 text-xl sm:text-2xl xl:text-3xl leading-8 text-sevy-text-secondary">
              {t('galleryParagraph')}
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
            <Masonry
              columns={{ xs: 2, md: 3, lg: 4 }}
              spacing={3}
              sequential={false}
              sx={{ margin: 0 }}
            >
              {images.map((image, index) => (
                <div key={image.id}>
                  <img
                    onClick={() => openLightbox(index)}
                    className="w-full h-auto object-cover rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                    src={image.thumbnail}
                    alt={image.alt}
                  />
                </div>
              ))}
            </Masonry>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-heading"
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-[10001]"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <XIcon className="h-10 w-10" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/50 transition-all z-[10001]"
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="h-8 w-8" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/50 transition-all z-[10001]"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            aria-label="Next image"
          >
            <ChevronRightIcon className="h-8 w-8" />
          </button>

          <div
            className="relative w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />
             <h2 id="lightbox-heading" className="sr-only">
              {images[currentImageIndex].alt}
            </h2>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
