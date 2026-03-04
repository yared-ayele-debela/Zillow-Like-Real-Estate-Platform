import { useEffect, useState, useCallback } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import adminService from '../services/adminService';
import AdminLayout from '../components/admin/AdminLayout';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    status: 'pending',
    rating: '',
    property_id: '',
  });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.rating) params.rating = filters.rating;
      if (filters.property_id) params.property_id = filters.property_id;

      const data = await adminService.getPendingReviews(params);
      setReviews(data.data || []);
      setPagination(data);
    } catch (err) {
      console.error('Reviews error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getProperties({ per_page: 200 });
        const list = data.data ?? data;
        setProperties(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Properties load error:', err);
      }
    };
    load();
  }, []);

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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="all">All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All ratings</option>
                <option value="1">1 star</option>
                <option value="2">2 stars</option>
                <option value="3">3 stars</option>
                <option value="4">4 stars</option>
                <option value="5">5 stars</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
              <select
                value={filters.property_id}
                onChange={(e) => setFilters({ ...filters, property_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All properties</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
              <p className="mt-4 text-gray-500">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No reviews match the selected filters</p>
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
                      {!review.is_approved && (
                        <>
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
                        </>
                      )}
                      {review.is_approved && (
                        <span className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md">
                          Approved
                        </span>
                      )}
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
