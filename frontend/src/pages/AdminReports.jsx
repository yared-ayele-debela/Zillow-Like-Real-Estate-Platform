import { useEffect, useMemo, useState } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../components/admin/AdminLayout';
import adminService from '../services/adminService';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState('');
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    group_by: 'day',
    top_locations: 10,
  });

  useEffect(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 29);

    const initialFilters = {
      start_date: start.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
      group_by: 'day',
      top_locations: 10,
    };

    setFilters(initialFilters);
    fetchReport(initialFilters);
  }, []);

  const fetchReport = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const data = await adminService.getAdvancedReport(nextFilters);
      setReport(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      setDownloading(format);
      const blobData = await adminService.downloadAdvancedReport(filters, format);
      const blob = new Blob([blobData], {
        type: format === 'json' ? 'application/json' : format === 'txt' ? 'text/plain' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateTag = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.href = url;
      link.setAttribute('download', `advanced_report_${dateTag}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.response?.data?.message || `Failed to download ${format.toUpperCase()} report`);
    } finally {
      setDownloading('');
    }
  };

  const topLocations = useMemo(() => report?.top_locations || [], [report]);
  const topAgents = useMemo(() => report?.top_agents || [], [report]);
  const current = report?.kpis?.current || {};
  const growth = report?.kpis?.growth || {};

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and download advanced reports in different formats.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading === 'csv' || loading}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {downloading === 'csv' ? 'Downloading...' : 'Download CSV'}
            </button>
            <button
              onClick={() => handleDownload('json')}
              disabled={downloading === 'json' || loading}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm flex items-center gap-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              {downloading === 'json' ? 'Downloading...' : 'Download JSON'}
            </button>
            <button
              onClick={() => handleDownload('txt')}
              disabled={downloading === 'txt' || loading}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm flex items-center gap-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              {downloading === 'txt' ? 'Downloading...' : 'Download TXT'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                value={filters.group_by}
                onChange={(e) => setFilters({ ...filters, group_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Top Locations</label>
              <input
                type="number"
                min="1"
                max="50"
                value={filters.top_locations}
                onChange={(e) => setFilters({ ...filters, top_locations: Number(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchReport()}
                disabled={loading}
                className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">New Users</p>
            <p className="text-2xl font-bold text-gray-900">{current.new_users || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Growth: {growth.new_users ?? 0}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">New Properties</p>
            <p className="text-2xl font-bold text-gray-900">{current.new_properties || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Growth: {growth.new_properties ?? 0}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">New Messages</p>
            <p className="text-2xl font-bold text-gray-900">{current.new_messages || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Growth: {growth.new_messages ?? 0}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${(current.revenue || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Growth: {growth.revenue ?? 0}%</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Agents</h2>
            {topAgents.length === 0 ? (
              <p className="text-sm text-gray-500">No data available</p>
            ) : (
              <div className="space-y-2">
                {topAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{agent.name}</span>
                    <span className="font-semibold text-gray-900">{agent.properties_count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Locations</h2>
            {topLocations.length === 0 ? (
              <p className="text-sm text-gray-500">No data available</p>
            ) : (
              <div className="space-y-2">
                {topLocations.map((location, idx) => (
                  <div key={`${location.city}-${location.state}-${idx}`} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{location.city}, {location.state}</span>
                    <span className="font-semibold text-gray-900">{location.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Available download formats: <strong>CSV</strong>, <strong>JSON</strong>, <strong>TXT</strong>.
        </div>
        {loading && (
          <div className="mt-4 text-sm text-gray-500">
            Generating report...
          </div>
        )}
        {!loading && !report && (
          <div className="mt-4 text-sm text-red-500">
            Could not load report data.
          </div>
        )}
        {!loading && report && (
          <div className="mt-4 text-sm text-green-600">
            Report generated successfully.
          </div>
        )}

        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Current Filter Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
            <div className="text-gray-600">Start: <span className="text-gray-900">{filters.start_date || '-'}</span></div>
            <div className="text-gray-600">End: <span className="text-gray-900">{filters.end_date || '-'}</span></div>
            <div className="text-gray-600">Group: <span className="text-gray-900">{filters.group_by}</span></div>
            <div className="text-gray-600">Top Locations: <span className="text-gray-900">{filters.top_locations}</span></div>
          </div>
        </div>

        {/* small visual spacer to keep page breathing room */}
        <div className="h-2" />

        {/* export note */}
        <div className="text-xs text-gray-500">
          Download buttons use the same filters shown above.
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
