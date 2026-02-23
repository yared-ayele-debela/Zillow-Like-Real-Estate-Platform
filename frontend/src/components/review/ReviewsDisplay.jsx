import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { reviewService } from '../../services/reviewService';
import useAuthStore from '../../store/authStore';

const ReviewsDisplay = ({ reviews = [], pagination, propertyId, agentId, onRefresh }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [editingReview, setEditingReview] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowEditForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      alert('Failed to delete review. Please try again.');
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingReview(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${avatar}`;
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Reviews ({pagination?.total || reviews.length})
        </h2>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {review.user?.avatar ? (
                    <img
                      src={getAvatarUrl(review.user.avatar)}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                  </div>
                </div>

                {isAuthenticated && user?.id === review.user_id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Edit review"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete review"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-2">
                <StarRating rating={review.rating} size="sm" />
              </div>

              {review.review && (
                <p className="text-gray-700 whitespace-pre-line">{review.review}</p>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === pagination.last_page ||
                  (page >= pagination.current_page - 2 &&
                    page <= pagination.current_page + 2)
              )
              .map((page, index, array) => (
                <div key={page} className="flex items-center gap-2">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2">...</span>
                  )}
                  <button
                    onClick={() => {
                      // Handle pagination - would need to be passed as prop
                      console.log('Page:', page);
                    }}
                    className={`px-3 py-1 border rounded ${
                      pagination.current_page === page
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Edit Review Form */}
      {showEditForm && editingReview && (
        <ReviewForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setEditingReview(null);
          }}
          propertyId={propertyId}
          agentId={agentId}
          existingReview={editingReview}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default ReviewsDisplay;
