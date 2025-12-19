import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive alerts for room releases and wins!"
        });
        return true;
      } else {
        toast({
          title: "Notifications Blocked",
          description: "Enable notifications in browser settings to receive alerts",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported, toast]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [permission]);

  const notifyRoomRelease = useCallback((tournamentName: string, roomId: string) => {
    sendNotification('🎮 Room Released!', {
      body: `Room details for "${tournamentName}" are now available!\nRoom ID: ${roomId}`,
      tag: 'room-release',
      requireInteraction: true
    });
  }, [sendNotification]);

  const notifyWin = useCallback((tournamentName: string, position: number, prize: number) => {
    const positionText = position === 1 ? '1st' : position === 2 ? '2nd' : position === 3 ? '3rd' : `${position}th`;
    sendNotification('🏆 Congratulations!', {
      body: `You secured ${positionText} place in "${tournamentName}"!\nPrize: ₹${prize}`,
      tag: 'win-notification',
      requireInteraction: true
    });
  }, [sendNotification]);

  const notifyTournamentReminder = useCallback((tournamentName: string, minutesLeft: number) => {
    sendNotification('⏰ Tournament Starting Soon!', {
      body: `"${tournamentName}" starts in ${minutesLeft} minutes. Get ready!`,
      tag: 'tournament-reminder'
    });
  }, [sendNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    notifyRoomRelease,
    notifyWin,
    notifyTournamentReminder
  };
};
