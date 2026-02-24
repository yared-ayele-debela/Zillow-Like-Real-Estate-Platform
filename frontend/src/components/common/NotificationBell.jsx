import { useEffect, useMemo, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import realtimeService from '../../services/realtimeService';
import useAuthStore from '../../store/authStore';

const NotificationBell = () => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data?.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({ per_page: 5 });
      setNotifications(data?.data || []);
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;

    const unsubscribe = realtimeService.subscribeToUserNotifications(user.id, (payload) => {
      setUnreadCount((prev) => prev + 1);
      setToast({
        title: payload?.title || 'New notification',
        message: payload?.message || '',
      });
      setTimeout(() => setToast(null), 3500);
      if (open) {
        fetchNotifications();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, open]);

  const handleBellClick = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      await fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div className="fixed top-4 right-4 z-[60] w-80 bg-white border border-indigo-200 shadow-lg rounded-lg p-3">
          <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
          <p className="text-xs text-gray-600 mt-1">{toast.message}</p>
        </div>
      )}
      <button onClick={handleBellClick} className="relative p-2 text-gray-500 hover:text-gray-700">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <Link to="/notifications" className="text-xs text-indigo-600 hover:text-indigo-700" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && <p className="p-4 text-sm text-gray-500">Loading...</p>}
            {!loading && recentNotifications.length === 0 && (
              <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
            )}
            {!loading &&
              recentNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`px-4 py-3 border-b border-gray-100 ${item.is_read ? 'bg-white' : 'bg-indigo-50'}`}
                >
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                    {!item.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
