import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon, PencilIcon, BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';
import { savedSearchService } from '../services/savedSearchService';
import useAuthStore from '../store/authStore';

const SavedSearches = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedSearches();
    }
  }, [isAuthenticated]);

  const fetchSavedSearches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await savedSearchService.getSavedSearches();
      setSavedSearches(response);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load saved searches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSearch = (savedSearch) => {
    // Build URL with filters
    const params = new URLSearchParams();
    Object.entries(savedSearch.filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      }
    });
    navigate(`/properties?${params.toString()}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    try {
      await savedSearchService.deleteSavedSearch(id);
      setSavedSearches(savedSearches.filter((s) => s.id !== id));
    } catch (error) {
      alert('Failed to delete saved search. Please try again.');
    }
  };

  const handleToggleNotifications = async (savedSearch) => {
    try {
      await savedSearchService.updateSavedSearch(savedSearch.id, {
        email_notifications: !savedSearch.email_notifications,
      });
      setSavedSearches(
        savedSearches.map((s) =>
          s.id === savedSearch.id
            ? { ...s, email_notifications: !s.email_notifications }
            : s
        )
      );
    } catch (error) {
      alert('Failed to update notification settings. Please try again.');
    }
  };

  const handleStartEdit = (savedSearch) => {
    setEditingId(savedSearch.id);
    setEditName(savedSearch.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await savedSearchService.updateSavedSearch(id, {
        name: editName.trim(),
      });
      setSavedSearches(
        savedSearches.map((s) =>
          s.id === id ? { ...s, name: editName.trim() } : s
        )
      );
      setEditingId(null);
      setEditName('');
    } catch (error) {
      alert('Failed to update saved search. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          Please <Link to="/login" className="underline">login</Link> to view your saved searches.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Saved Searches</h1>
        <p className="text-gray-600 mt-2">
          {savedSearches.length} {savedSearches.length === 1 ? 'search' : 'searches'} saved
        </p>
      </div>

      {savedSearches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">You haven't saved any searches yet.</p>
          <Link
            to="/properties"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedSearches.map((savedSearch) => (
            <div
              key={savedSearch.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingId === savedSearch.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(savedSearch.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleSaveEdit(savedSearch.id)}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {savedSearch.name}
                    </h3>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(savedSearch.filters).map(([key, value]) => {
                      if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                        return null;
                      }
                      return (
                        <span
                          key={key}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {key}: {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Created: {new Date(savedSearch.created_at).toLocaleDateString()}
                    </span>
                    {savedSearch.last_notified_at && (
                      <span>
                        Last notified: {new Date(savedSearch.last_notified_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleNotifications(savedSearch)}
                    className={`p-2 rounded hover:bg-gray-100 ${
                      savedSearch.email_notifications
                        ? 'text-indigo-600'
                        : 'text-gray-400'
                    }`}
                    title={
                      savedSearch.email_notifications
                        ? 'Disable email notifications'
                        : 'Enable email notifications'
                    }
                  >
                    {savedSearch.email_notifications ? (
                      <BellIcon className="w-5 h-5" />
                    ) : (
                      <BellSlashIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleStartEdit(savedSearch)}
                    className="p-2 rounded hover:bg-gray-100 text-gray-600"
                    title="Edit name"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(savedSearch.id)}
                    className="p-2 rounded hover:bg-red-50 text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => handleRunSearch(savedSearch)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Run Search
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearches;
