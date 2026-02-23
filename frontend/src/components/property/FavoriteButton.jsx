import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { favoriteService } from '../../services/favoriteService';
import useAuthStore from '../../store/authStore';

const FavoriteButton = ({ propertyId, savesCount = 0, onToggle }) => {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSavesCount, setCurrentSavesCount] = useState(savesCount);

  useEffect(() => {
    if (isAuthenticated && propertyId) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, propertyId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteService.checkFavorite(propertyId);
      setIsFavorite(response.is_favorite);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login or show message
      alert('Please login to save favorites');
      return;
    }

    setIsLoading(true);
    try {
      const response = await favoriteService.toggleFavorite(propertyId);
      setIsFavorite(response.is_favorite);
      setCurrentSavesCount(response.saves_count);
      
      if (onToggle) {
        onToggle(response.is_favorite);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorite. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleToggle}
        className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
        title="Login to save favorites"
      >
        <HeartIcon className="w-5 h-5" />
        {currentSavesCount > 0 && <span className="text-sm">{currentSavesCount}</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 transition-colors ${
        isFavorite
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-600 hover:text-red-500'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? (
        <HeartIconSolid className="w-5 h-5" />
      ) : (
        <HeartIcon className="w-5 h-5" />
      )}
      {currentSavesCount > 0 && <span className="text-sm">{currentSavesCount}</span>}
    </button>
  );
};

export default FavoriteButton;
