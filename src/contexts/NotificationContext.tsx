'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { WebNotification, NotificationState, NotificationAction } from '@/types/notifications';
import { useAuth } from './AuthContext';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
};

// Extended action type
type ExtendedNotificationAction =
  | NotificationAction
  | { type: 'SET_NOTIFICATIONS'; payload: WebNotification[] };

function notificationReducer(state: NotificationState, action: ExtendedNotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS': {
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
      };
    }

    case 'ADD_NOTIFICATION': {
      const newNotification: WebNotification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      };

      const updatedNotifications = [newNotification, ...state.notifications];
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }

    case 'ADD_MULTIPLE_NOTIFICATIONS': {
      const newNotifications: WebNotification[] = action.payload.map(payload => ({
        ...payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      }));

      const updatedNotifications = [...newNotifications, ...state.notifications];
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }

    case 'MARK_AS_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }

    case 'MARK_ALL_AS_READ': {
      const updatedNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    }

    case 'REMOVE_NOTIFICATION': {
      const updatedNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    }

    case 'TOGGLE_NOTIFICATIONS_PANEL': {
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    }

    default:
      return state;
  }
}

interface NotificationContextType {
  state: NotificationState;
  dispatch: React.Dispatch<ExtendedNotificationAction>;
  addNotification: (notification: Omit<WebNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  togglePanel: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        headers: {
          'x-user-email': user.email
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.notifications)) {
          // Parse dates
          const notifications = data.notifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();

      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.email]);

  const addNotification = (notification: Omit<WebNotification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markAsRead = async (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });

    if (user?.email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email
          },
          body: JSON.stringify({ id, userEmail: user.email })
        });
      } catch (error) {
        console.error('Failed to sync read status:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });

    if (user?.email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email
          },
          body: JSON.stringify({ all: true, userEmail: user.email })
        });
      } catch (error) {
        console.error('Failed to sync mark all read:', error);
      }
    }
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const togglePanel = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' });
  };

  return (
    <NotificationContext.Provider
      value={{
        state,
        dispatch,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        togglePanel,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}