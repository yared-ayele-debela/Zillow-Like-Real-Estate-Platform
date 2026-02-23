import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../components/admin/AdminLayout';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', status: '' });

  // Note: This is a placeholder. Reports functionality would require backend implementation
  useEffect(() => {
    // In a real implementation, this would fetch reports from the API
    setReports([]);
  }, [filters]);

  const handleAction = async (reportId, action) => {
    // Placeholder for report actions
    alert(`Action "${action}" would be performed on report ${reportId}`);
  };

  const handleResolve = async (reportId) => {
    // Placeholder for resolving reports
    alert(`Report ${reportId} would be marked as resolved`);
  };

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports Management</h1>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> Reports functionality requires backend implementation. This page is a placeholder for future development.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                <option value="property">Property</option>
                <option value="user">User</option>
                <option value="review">Review</option>
                <option value="message">Message</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reports found</p>
              <p className="text-sm text-gray-400 mt-2">
                Reports will appear here once the backend is implemented
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-gray-900">
                          {report.type} Report
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            report.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : report.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{report.reason}</p>
                      <p className="text-sm text-gray-500">
                        Reported by: {report.reporter?.name} on{' '}
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAction(report.id, 'warn')}
                        className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleAction(report.id, 'suspend')}
                        className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => handleAction(report.id, 'delete')}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleResolve(report.id)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Resolve
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

export default AdminReports;
