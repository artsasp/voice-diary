let scheduledTimers = {};

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleNotification(id, time, title, body) {
  if (scheduledTimers[id]) {
    clearTimeout(scheduledTimers[id]);
  }

  const now = new Date();
  const [hours, mins] = time.split(':').map(Number);
  const target = new Date();
  target.setHours(hours, mins, 0, 0);

  if (target <= now) return;

  const delay = target.getTime() - now.getTime();

  scheduledTimers[id] = setTimeout(() => {
    showNotification(title, body);
    delete scheduledTimers[id];
  }, delay);
}

export function cancelNotification(id) {
  if (scheduledTimers[id]) {
    clearTimeout(scheduledTimers[id]);
    delete scheduledTimers[id];
  }
}

function showNotification(title, body) {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
      });
    } else {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      });
    }
  }
}

export function scheduleAllAlarms(alarms, bulletAlarms) {
  // Fixed daily alarms
  Object.entries(alarms).forEach(([key, alarm]) => {
    if (alarm.enabled) {
      scheduleNotification(`fixed-${key}`, alarm.time, 'Voice Diary', alarm.label);
    } else {
      cancelNotification(`fixed-${key}`);
    }
  });

  // Bullet alarms
  const today = new Date().toISOString().slice(0, 10);
  bulletAlarms
    .filter((a) => a.date === today)
    .forEach((alarm) => {
      scheduleNotification(
        `bullet-${alarm.bulletId}`,
        alarm.time,
        '할일 알림',
        alarm.text
      );
    });
}
