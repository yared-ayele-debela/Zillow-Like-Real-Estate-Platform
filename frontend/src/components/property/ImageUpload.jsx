import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon, PhotoIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const ImageUpload = ({ images = [], onImagesChange, onReorder, onSetPrimary, onDelete }) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        is_primary: images.length === 0,
        order: images.length,
      }));

      onImagesChange([...images, ...newImages]);
    },
    [images, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 20,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleDelete = (imageId) => {
    if (onDelete) {
      onDelete(imageId);
    } else {
      const updatedImages = images.filter((img) => img.id !== imageId);
      // If deleted image was primary, set first image as primary
      const deletedImage = images.find((img) => img.id === imageId);
      if (deletedImage?.is_primary && updatedImages.length > 0) {
        updatedImages[0].is_primary = true;
      }
      onImagesChange(updatedImages);
    }
  };

  const handleSetPrimary = (imageId) => {
    const updatedImages = images.map((img) => ({
      ...img,
      is_primary: img.id === imageId,
    }));
    onImagesChange(updatedImages);
    if (onSetPrimary) {
      onSetPrimary(imageId);
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    newImages[index - 1].order = index - 1;
    newImages[index].order = index;
    onImagesChange(newImages);
    if (onReorder) {
      onReorder(newImages);
    }
  };

  const handleMoveDown = (index) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    newImages[index].order = index;
    newImages[index + 1].order = index + 1;
    onImagesChange(newImages);
    if (onReorder) {
      onReorder(newImages);
    }
  };

  const getImageUrl = (image) => {
    if (image.preview) return image.preview;
    if (image.image_path) {
      return `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${image.image_path}`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          {isDragActive
            ? 'Drop the images here'
            : 'Drag & drop images here, or click to select'}
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, GIF up to 5MB (max 20 images)
        </p>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => {
            const imageUrl = getImageUrl(image);
            return (
              <div
                key={image.id}
                className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <PhotoIcon className="w-12 h-12" />
                  </div>
                )}

                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <StarIcon className="w-3 h-3" />
                    Primary
                  </div>
                )}

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    className={`p-2 rounded ${
                      image.is_primary
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Set as primary"
                  >
                    <StarIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-2 bg-white text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUpIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === images.length - 1}
                    className="p-2 bg-white text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDownIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    title="Delete"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Image Number */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {uploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Uploading images...</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
