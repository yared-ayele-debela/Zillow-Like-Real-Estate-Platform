import StarRating from './StarRating';
import { StarIcon } from '@heroicons/react/24/solid';

const RatingSummary = ({ summary }) => {
  if (!summary || summary.total_reviews === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Reviews & Ratings</h2>
        <p className="text-gray-500">No reviews yet</p>
      </div>
    );
  }

  const { average_rating, total_reviews, percentage_distribution } = summary;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Reviews & Ratings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {average_rating.toFixed(1)}
          </div>
          <div className="mb-2">
            <StarRating rating={Math.round(average_rating)} size="lg" />
          </div>
          <p className="text-gray-600">
            Based on {total_reviews} {total_reviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const percentage = percentage_distribution[rating] || 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatingSummary;
