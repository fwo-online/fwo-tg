export type NotificationSettings = {
  gameStart: boolean;
  gameEnd: boolean;
  afkWarning: boolean;
  dailyRewards: boolean;
  levelUp: boolean;
};

export type NotificationType = keyof NotificationSettings;

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  gameStart: true,
  gameEnd: false,
  afkWarning: false,
  dailyRewards: false,
  levelUp: false,
};
