import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationContextType {
  notifyRoomRelease: (tournamentName: string, roomId: string) => void;
  notifyWin: (tournamentName: string, position: number, prize: number) => void;
  notifyTournamentReminder: (tournamentName: string, minutesLeft: number) => void;
  requestPermission: () => Promise<boolean>;
  permission: NotificationPermission;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    permission,
    requestPermission,
    notifyRoomRelease,
    notifyWin,
    notifyTournamentReminder
  } = usePushNotifications();

  return (
    <NotificationContext.Provider
      value={{
        notifyRoomRelease,
        notifyWin,
        notifyTournamentReminder,
        requestPermission,
        permission
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
