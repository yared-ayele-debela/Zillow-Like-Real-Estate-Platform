import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const SearchBar = ({ onSearch, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Get search query from URL
    const urlQuery = searchParams.get('search') || '';
    setSearchQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    // Fetch suggestions as user types
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300); // Debounce

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    try {
      const response = await api.get('/search/suggestions', {
        params: { q: query },
      });
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set('search', query.trim());
      params.set('page', '1'); // Reset to first page
      setSearchParams(params);
      setShowSuggestions(false);
      
      if (onSearch) {
        onSearch(query.trim());
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    let query = suggestion.value;
    
    // If it's a location suggestion, navigate to properties with that location
    if (suggestion.type === 'city') {
      const params = new URLSearchParams(searchParams);
      params.set('city', suggestion.value);
      params.delete('search');
      setSearchParams(params);
    } else if (suggestion.type === 'state') {
      const params = new URLSearchParams(searchParams);
      params.set('state', suggestion.value);
      params.delete('search');
      setSearchParams(params);
    } else {
      setSearchQuery(query);
      handleSearch(query);
    }
    
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    setSearchParams(params);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
          placeholder="Search by location, property type, or keywords..."
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-900 cursor-pointer"
            >
              <div className="flex items-center">
                <span className="font-medium">{suggestion.label}</span>
                <span className="ml-2 text-xs text-gray-500 capitalize">
                  {suggestion.type.replace('_', ' ')}
                </span>
                {suggestion.count && (
                  <span className="ml-auto text-xs text-gray-400">
                    {suggestion.count} properties
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
