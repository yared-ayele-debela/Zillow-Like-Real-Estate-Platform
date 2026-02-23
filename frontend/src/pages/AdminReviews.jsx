import { useEffect, useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import adminService from '../services/adminService';
import AdminLayout from '../components/admin/AdminLayout';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingReviews();
      setReviews(data.data || []);
      setPagination(data);
    } catch (err) {
      console.error('Reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveReview(id);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve review');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject and delete this review?')) return;
    try {
      await adminService.rejectReview(id);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject review');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Moderation</h1>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {reviews.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No pending reviews</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <p className="font-medium text-gray-900">{review.user?.name || 'Unknown'}</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${
                                star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        {review.property && (
                          <span className="text-sm text-indigo-600">
                            Property: {review.property.title}
                          </span>
                        )}
                        {review.agent && (
                          <span className="text-sm text-indigo-600">
                            Agent: {review.agent.name}
                          </span>
                        )}
                      </div>
                      {review.review && (
                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.review}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckIcon className="h-5 w-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
