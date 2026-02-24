import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dashboardService from '../services/dashboardService';
import { propertyService } from '../services/propertyService';
import AgentLayout from '../components/agent/AgentLayout';

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboard, propertiesData] = await Promise.all([
        dashboardService.getDashboard(),
        propertyService.getMyProperties({ per_page: 100 }),
      ]);
      setDashboardData(dashboard);
      setProperties(propertiesData.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AgentLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-luxury-charcoal flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-luxury-warm/70">Loading analytics...</p>
          </div>
        </div>
      </AgentLayout>
    );
  }

  if (error) {
    return (
      <AgentLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-luxury-charcoal flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-luxury-gold text-luxury-navy rounded-md hover:bg-luxury-gold"
            >
              Retry
            </button>
          </div>
        </div>
      </AgentLayout>
    );
  }

  // Prepare data for charts
  const performanceData = (dashboardData?.performance_data || []).map((prop) => ({
    name: prop.title?.substring(0, 20) + (prop.title?.length > 20 ? '...' : '') || 'Property',
    views: prop.views || 0,
    saves: prop.saves || 0,
  }));

  const statusDistribution = properties.reduce((acc, prop) => {
    acc[prop.status] = (acc[prop.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status.replace('_', ' '),
    count,
  }));

  return (
    <AgentLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-luxury-charcoal">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-luxury-warm">Analytics</h1>
          <p className="mt-2 text-luxury-warm/70">Track your property performance and insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-luxury-navy rounded-lg shadow p-6">
            <p className="text-sm font-medium text-luxury-warm/70">Total Views</p>
            <p className="text-3xl font-bold text-luxury-warm mt-2">
              {dashboardData?.statistics?.total_views?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-luxury-navy rounded-lg shadow p-6">
            <p className="text-sm font-medium text-luxury-warm/70">Total Saves</p>
            <p className="text-3xl font-bold text-luxury-warm mt-2">
              {dashboardData?.statistics?.total_saves?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-luxury-navy rounded-lg shadow p-6">
            <p className="text-sm font-medium text-luxury-warm/70">Total Inquiries</p>
            <p className="text-3xl font-bold text-luxury-warm mt-2">
              {dashboardData?.statistics?.total_inquiries?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-luxury-navy rounded-lg shadow p-6">
            <p className="text-sm font-medium text-luxury-warm/70">Active Listings</p>
            <p className="text-3xl font-bold text-luxury-warm mt-2">
              {dashboardData?.statistics?.active_listings?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Property Performance Chart */}
          <div className="bg-luxury-navy rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-luxury-warm mb-4">Top Properties by Views</h2>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#4F46E5" name="Views" />
                  <Bar dataKey="saves" fill="#10B981" name="Saves" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-luxury-warm/60 text-center py-12">No data available</p>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-luxury-navy rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-luxury-warm mb-4">Status Distribution</h2>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-luxury-warm/60 text-center py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Property Performance Table */}
        <div className="bg-luxury-navy rounded-lg shadow">
          <div className="p-6 border-b border-luxury-gold/20">
            <h2 className="text-xl font-semibold text-luxury-warm">Property Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-luxury-charcoal">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-warm/60 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-warm/60 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-warm/60 uppercase tracking-wider">
                    Saves
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-warm/60 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-luxury-navy divide-y divide-gray-200">
                {properties.slice(0, 10).map((property) => (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-luxury-warm">{property.title}</div>
                      <div className="text-sm text-luxury-warm/60">{property.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-luxury-warm">
                      {property.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-luxury-warm">
                      {property.saves || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          property.status === 'for_sale'
                            ? 'bg-luxury-emerald/20 text-luxury-emerald'
                            : property.status === 'for_rent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-luxury-navy text-luxury-warm'
                        }`}
                      >
                        {property.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </AgentLayout>
  );
};

export default Analytics;
