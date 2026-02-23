import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import StarRating from './StarRating';
import { reviewService } from '../../services/reviewService';

const ReviewForm = ({ isOpen, onClose, propertyId, agentId, existingReview, onSuccess }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [review, setReview] = useState(existingReview?.review || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (existingReview) {
        // Update existing review
        await reviewService.updateReview(existingReview.id, {
          rating,
          review,
        });
      } else {
        // Create new review
        await reviewService.createReview({
          property_id: propertyId,
          agent_id: agentId,
          rating,
          review,
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setRating(0);
      setReview('');
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {existingReview ? 'Edit Review' : 'Write a Review'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                interactive={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="Share your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {review.length} / 2000 characters
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isLoading || rating === 0}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Your review will be published after admin approval.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
