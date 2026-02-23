import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  EyeIcon,
  HeartIcon,
  EnvelopeIcon,
  PlusIcon,
  ChartBarIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import dashboardService from '../services/dashboardService';

const AgentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.statistics || {};
  const recentProperties = dashboardData?.recent_properties || [];
  const recentMessages = dashboardData?.recent_messages || [];

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.total_properties || 0,
      icon: HomeIcon,
      color: 'bg-blue-500',
      link: '/agent/properties',
    },
    {
      title: 'Active Listings',
      value: stats.active_listings || 0,
      icon: HomeIcon,
      color: 'bg-green-500',
      link: '/agent/properties?status=for_sale',
    },
    {
      title: 'Total Views',
      value: stats.total_views || 0,
      icon: EyeIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Saves',
      value: stats.total_saves || 0,
      icon: HeartIcon,
      color: 'bg-pink-500',
    },
    {
      title: 'Inquiries',
      value: stats.total_inquiries || 0,
      icon: EnvelopeIcon,
      color: 'bg-yellow-500',
      link: '/agent/leads',
    },
    {
      title: 'Unread Messages',
      value: stats.unread_messages || 0,
      icon: InboxIcon,
      color: 'bg-red-500',
      link: '/agent/leads?is_read=false',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's an overview of your properties.</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <Link
            to="/properties/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5" />
            Add New Property
          </Link>
          <Link
            to="/agent/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <ChartBarIcon className="h-5 w-5" />
            View Analytics
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const content = (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            );

            if (stat.link) {
              return (
                <Link key={index} to={stat.link}>
                  {content}
                </Link>
              );
            }

            return <div key={index}>{content}</div>;
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Properties</h2>
                <Link
                  to="/agent/properties"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentProperties.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No properties yet</p>
              ) : (
                <div className="space-y-4">
                  {recentProperties.map((property) => (
                    <Link
                      key={property.id}
                      to={`/properties/${property.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition"
                    >
                      <div className="flex items-start gap-4">
                        {property.primary_image && (
                          <img
                            src={property.primary_image.image_url || property.primary_image.thumbnail_url}
                            alt={property.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{property.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {property.address}, {property.city}, {property.state}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm font-semibold text-indigo-600">
                              ${property.price?.toLocaleString()}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                property.status === 'for_sale'
                                  ? 'bg-green-100 text-green-800'
                                  : property.status === 'for_rent'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {property.status?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Messages</h2>
                <Link
                  to="/agent/leads"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentMessages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <Link
                      key={message.id}
                      to={`/agent/leads/${message.id}`}
                      className={`block p-4 border rounded-lg hover:border-indigo-300 transition ${
                        !message.is_read ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {message.sender?.name || 'Unknown'}
                            </p>
                            {!message.is_read && (
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                            )}
                          </div>
                          {message.property && (
                            <p className="text-sm text-gray-600 mt-1">
                              Re: {message.property.title}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 ml-4">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
