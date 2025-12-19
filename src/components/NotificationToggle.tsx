import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const NotificationToggle = () => {
  const { permission, isSupported, requestPermission } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    if (permission === 'default') {
      await requestPermission();
    }
  };

  const getIcon = () => {
    switch (permission) {
      case 'granted':
        return <BellRing className="h-5 w-5 text-primary" />;
      case 'denied':
        return <BellOff className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTooltipText = () => {
    switch (permission) {
      case 'granted':
        return 'Notifications enabled';
      case 'denied':
        return 'Notifications blocked - enable in browser settings';
      default:
        return 'Enable notifications for room alerts & wins';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          disabled={permission === 'denied'}
          className="relative"
        >
          {getIcon()}
          {permission === 'granted' && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltipText()}</p>
      </TooltipContent>
    </Tooltip>
  );
};
