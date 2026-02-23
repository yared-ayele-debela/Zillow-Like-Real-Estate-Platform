import { useState } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import messageService from '../../services/messageService';
import useAuthStore from '../../store/authStore';

const TourRequestForm = ({ isOpen, onClose, property, receiverId, onSuccess }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    preferred_dates: [],
    preferred_times: [],
    notes: '',
    message: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];

  const handleAddDate = () => {
    if (selectedDate && !formData.preferred_dates.includes(selectedDate)) {
      setFormData({
        ...formData,
        preferred_dates: [...formData.preferred_dates, selectedDate],
      });
      setSelectedDate('');
    }
  };

  const handleRemoveDate = (date) => {
    setFormData({
      ...formData,
      preferred_dates: formData.preferred_dates.filter((d) => d !== date),
    });
  };

  const handleAddTime = () => {
    if (selectedTime && !formData.preferred_times.includes(selectedTime)) {
      setFormData({
        ...formData,
        preferred_times: [...formData.preferred_times, selectedTime],
      });
      setSelectedTime('');
    }
  };

  const handleRemoveTime = (time) => {
    setFormData({
      ...formData,
      preferred_times: formData.preferred_times.filter((t) => t !== time),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.preferred_dates.length === 0) {
      setError('Please select at least one preferred date');
      return;
    }

    setLoading(true);

    try {
      await messageService.requestTour({
        property_id: property?.id,
        receiver_id: receiverId,
        preferred_dates: formData.preferred_dates,
        preferred_times: formData.preferred_times,
        notes: formData.notes,
        message: formData.message,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
      setFormData({
        preferred_dates: [],
        preferred_times: [],
        notes: '',
        message: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit tour request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Request a Tour</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {property && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{property.title}</h3>
              <p className="text-sm text-gray-600">
                {property.address}, {property.city}, {property.state}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Preferred Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-5 w-5 inline mr-1" />
                Preferred Dates *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={minDate}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddDate}
                  disabled={!selectedDate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              {formData.preferred_dates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.preferred_dates.map((date) => (
                    <span
                      key={date}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {new Date(date).toLocaleDateString()}
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(date)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Times */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="h-5 w-5 inline mr-1" />
                Preferred Times (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddTime}
                  disabled={!selectedTime}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              {formData.preferred_times.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.preferred_times.map((time) => (
                    <span
                      key={time}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {time}
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(time)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Any special requests or questions..."
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Additional message for the agent..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading || formData.preferred_dates.length === 0}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Tour Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourRequestForm;
