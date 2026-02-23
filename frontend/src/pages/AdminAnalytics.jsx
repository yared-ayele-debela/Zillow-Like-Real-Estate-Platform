import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import adminService from '../services/adminService';
import AdminLayout from '../components/admin/AdminLayout';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csv = [
      ['Metric', 'Value'],
      ['Total Properties', analytics.property_stats?.total || 0],
      ['Approved Properties', analytics.property_stats?.approved || 0],
      ['Pending Properties', analytics.property_stats?.pending || 0],
      ['Featured Properties', analytics.property_stats?.featured || 0],
      ['Total Users', analytics.user_stats?.total || 0],
      ['Agents', analytics.user_stats?.agents || 0],
      ['Buyers', analytics.user_stats?.buyers || 0],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const propertyStats = analytics?.property_stats || {};
  const userStats = analytics?.user_stats || {};
  const propertiesByMonth = analytics?.properties_by_month || [];
  const usersByMonth = analytics?.users_by_month || [];
  const popularLocations = analytics?.popular_locations || [];

  // Prepare data for pie charts
  const propertyStatusData = [
    { name: 'For Sale', value: propertyStats.for_sale || 0 },
    { name: 'For Rent', value: propertyStats.for_rent || 0 },
    { name: 'Sold', value: propertyStats.sold || 0 },
  ].filter(item => item.value > 0);

  const userRoleData = [
    { name: 'Agents', value: userStats.agents || 0 },
    { name: 'Buyers', value: userStats.buyers || 0 },
  ].filter(item => item.value > 0);

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-2 text-gray-600">Platform statistics and insights</p>
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export Data
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total Properties</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{propertyStats.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Approved Properties</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{propertyStats.approved || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.active || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Properties by Month */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Properties Created (Last 12 Months)</h2>
            {propertiesByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={propertiesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#4F46E5" name="Properties" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>

          {/* Users by Month */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Users Registered (Last 12 Months)</h2>
            {usersByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usersByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#10B981" name="Users" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>

          {/* Property Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Status Distribution</h2>
            {propertyStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>

          {/* User Role Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Role Distribution</h2>
            {userRoleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Popular Locations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Locations</h2>
          {popularLocations.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={popularLocations.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" name="Properties" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>

        {/* Statistics Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Statistics</h2>
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 text-gray-600">Total</td>
                  <td className="py-2 font-semibold text-right">{propertyStats.total || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Approved</td>
                  <td className="py-2 font-semibold text-right">{propertyStats.approved || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Pending</td>
                  <td className="py-2 font-semibold text-right">{propertyStats.pending || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Featured</td>
                  <td className="py-2 font-semibold text-right">{propertyStats.featured || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">For Sale</td>
                  <td className="py-2 font-semibold text-right">{propertyStats.for_sale || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">For Rent</td>
                  <td className="py-2 font-semibold text-right">{propertyStats.for_rent || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Sold</td>
                  <td className="py-2 font-semibold text-right">{propertyStats.sold || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Statistics</h2>
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 text-gray-600">Total</td>
                  <td className="py-2 font-semibold text-right">{userStats.total || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Agents</td>
                  <td className="py-2 font-semibold text-right">{userStats.agents || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Buyers</td>
                  <td className="py-2 font-semibold text-right">{userStats.buyers || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Active</td>
                  <td className="py-2 font-semibold text-right">{userStats.active || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Verified</td>
                  <td className="py-2 font-semibold text-right">{userStats.verified || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
