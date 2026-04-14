import { useState } from 'react';
import { Bell, BellOff, Clock, RefreshCw, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { requestNotificationPermission } from '../utils/notifications';
import { syncToNotion } from '../utils/notion';

export default function AlarmSettings({
  alarms, bulletAlarms, updateAlarm, removeBulletAlarm,
  todayData, mindJunk, today, setNotionSyncStatus, notionSyncStatus
}) {
  const [syncing, setSyncing] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const handlePermission = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
  };

  const handleSync = async () => {
    setSyncing(true);
    setNotionSyncStatus(null);
    try {
      await syncToNotion(todayData, mindJunk, today);
      setNotionSyncStatus({ success: true, time: new Date().toLocaleTimeString('ko-KR') });
    } catch (err) {
      setNotionSyncStatus({ success: false, message: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const fixedAlarms = [
    { key: 'morning', icon: '🌅', label: '아침 확언 알림' },
    { key: 'evening', icon: '🧹', label: '마인드 정크 정화' },
    { key: 'night', icon: '🏆', label: '3 Wins 작성' },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      <div className="text-center pt-6 pb-4">
        <h2 className="text-lg font-bold text-primary-dark">⚙️ 알림 설정</h2>
      </div>

      {/* 알림 권한 */}
      {notifPermission !== 'granted' && (
        <button
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-4 mb-4 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          onClick={handlePermission}
        >
          <Bell className="w-5 h-5" />
          알림 권한 허용하기
        </button>
      )}

      {/* 고정 알림 */}
      <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="text-sm font-bold text-text mb-3">🔔 매일 고정 알림</h3>
        <div className="space-y-3">
          {fixedAlarms.map(({ key, icon, label }) => {
            const alarm = alarms[key];
            return (
              <div key={key} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                <span className="text-xl">{icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">{label}</p>
                  <p className="text-xs text-text-muted">{alarm.label}</p>
                </div>
                <input
                  type="time"
                  className="bg-white rounded-lg px-2 py-1 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  value={alarm.time}
                  onChange={(e) => updateAlarm(key, { time: e.target.value })}
                />
                <button
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    alarm.enabled ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => updateAlarm(key, { enabled: !alarm.enabled })}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      alarm.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 할일 알림 */}
      <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="text-sm font-bold text-text mb-3">⏰ 등록된 할일 알림</h3>
        {bulletAlarms.filter((a) => a.date === today).length === 0 ? (
          <p className="text-xs text-text-muted text-center py-3">오늘 등록된 할일 알림이 없어요</p>
        ) : (
          <div className="space-y-2">
            {bulletAlarms
              .filter((a) => a.date === today)
              .map((alarm) => (
                <div key={alarm.bulletId} className="flex items-center gap-2 p-2 rounded-xl bg-purple-50">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-primary font-semibold w-12">{alarm.time}</span>
                  <span className="flex-1 text-sm text-text truncate">{alarm.text}</span>
                  <button
                    className="shrink-0 text-text-muted hover:text-danger"
                    onClick={() => removeBulletAlarm(alarm.bulletId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 노션 동기화 */}
      <div className="bg-card rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-text mb-3">📓 노션 동기화</h3>
        <p className="text-xs text-text-muted mb-3">
          오늘의 기록을 노션에 자동으로 보내요.
        </p>
        <button
          className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-3 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          {syncing ? '동기화 중...' : '지금 노션에 동기화'}
        </button>
        {notionSyncStatus && (
          <div className={`mt-3 p-2 rounded-lg text-xs flex items-center gap-1 ${
            notionSyncStatus.success ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
          }`}>
            {notionSyncStatus.success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                마지막 동기화: {notionSyncStatus.time}
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                {notionSyncStatus.message}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
