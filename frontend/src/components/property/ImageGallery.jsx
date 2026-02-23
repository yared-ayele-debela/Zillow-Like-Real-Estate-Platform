import { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ImageGallery = ({ images = [], propertyTitle = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const getImageUrl = (image) => {
    if (image.image_url) return image.image_url;
    if (image.image_path) {
      return `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${image.image_path}`;
    }
    return null;
  };

  const selectedImage = images[selectedIndex];
  const imageUrl = getImageUrl(selectedImage);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
    if (isLightboxOpen) {
      setLightboxIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    if (isLightboxOpen) {
      setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Main Image */}
          <div className="lg:col-span-3 relative h-96 bg-gray-200 group">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={propertyTitle || `Property image ${selectedIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openLightbox(selectedIndex)}
                />
                <button
                  onClick={() => openLightbox(selectedIndex)}
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center"
                >
                  <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100">
                    Click to enlarge
                  </span>
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Grid */}
          {images.length > 1 && (
            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {images.map((image, index) => {
                const thumbUrl = getImageUrl(image);
                return (
                  <button
                    key={image.id || index}
                    onClick={() => setSelectedIndex(index)}
                    className={`relative h-24 bg-gray-200 rounded overflow-hidden transition-all ${
                      index === selectedIndex
                        ? 'ring-2 ring-indigo-600 scale-105'
                        : 'hover:opacity-75 hover:scale-105'
                    }`}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`${propertyTitle} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        {index + 1}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Close lightbox"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-10 h-10" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-10 h-10" />
              </button>
            </>
          )}

          <div className="max-w-7xl max-h-full p-4">
            {getImageUrl(images[lightboxIndex]) ? (
              <img
                src={getImageUrl(images[lightboxIndex])}
                alt={propertyTitle || `Property image ${lightboxIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <p className="text-white">Image not available</p>
            )}
          </div>

          {/* Lightbox Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4">
              {images.map((image, index) => {
                const thumbUrl = getImageUrl(image);
                return (
                  <button
                    key={image.id || index}
                    onClick={() => setLightboxIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                      index === lightboxIndex
                        ? 'border-white'
                        : 'border-transparent opacity-50 hover:opacity-75'
                    }`}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">
                        {index + 1}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Image Counter in Lightbox */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;
