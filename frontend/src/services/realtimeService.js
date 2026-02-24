import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

const getEcho = () => {
  if (echoInstance) return echoInstance;

  const key = process.env.REACT_APP_PUSHER_KEY || 'local';
  const wsHost = process.env.REACT_APP_PUSHER_HOST || '127.0.0.1';
  const wsPort = Number(process.env.REACT_APP_PUSHER_PORT || 8080);
  const forceTLS = process.env.REACT_APP_PUSHER_SCHEME === 'https';
  const cluster = process.env.REACT_APP_PUSHER_CLUSTER || 'mt1';
  const token = localStorage.getItem('token');

  window.Pusher = Pusher;

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key,
    cluster,
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
};

const leaveUserChannel = (userId) => {
  if (!echoInstance || !userId) return;
  echoInstance.leave(`private-users.${userId}`);
};

const subscribeToUserNotifications = (userId, onNotification) => {
  if (!userId || typeof onNotification !== 'function') return () => {};

  const echo = getEcho();
  const channelName = `users.${userId}`;
  const channel = echo.private(channelName);

  channel.listen('.notification.created', (payload) => {
    onNotification(payload);
  });

  return () => {
    leaveUserChannel(userId);
  };
};

const disconnectRealtime = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};

const realtimeService = {
  subscribeToUserNotifications,
  disconnectRealtime,
};

export default realtimeService;
