import { useState, useEffect } from 'react';
import { Bell, Clock, RefreshCw, CheckCircle, AlertCircle, Loader2, Trash2, CalendarPlus, Unlink } from 'lucide-react';
import { requestNotificationPermission } from '../utils/notifications';
import { syncToNotion } from '../utils/notion';
import {
  initGapi, initTokenClient, requestGoogleAuth,
  isGoogleConnected, disconnectGoogle
} from '../utils/googleCalendar';

export default function AlarmSettings({
  alarms, bulletAlarms, updateAlarm, removeBulletAlarm,
  todayData, mindJunk, today, setNotionSyncStatus, notionSyncStatus
}) {
  const [syncing, setSyncing] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [gcalConnected, setGcalConnected] = useState(isGoogleConnected());
  const [gcalLoading, setGcalLoading] = useState(false);
  const [gcalError, setGcalError] = useState(null);

  // Google API 초기화
  useEffect(() => {
    const setup = async () => {
      try {
        await initGapi();
        initTokenClient(
          () => setGcalConnected(true),
          (err) => setGcalError(typeof err === 'string' ? err : '연결 실패')
        );
      } catch {
        // Google API 로드 안 되면 무시 (URL 폴백 사용)
      }
    };
    // 스크립트 로드 후 초기화
    const timer = setTimeout(setup, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleConnect = () => {
    setGcalLoading(true);
    setGcalError(null);
    try {
      requestGoogleAuth();
    } catch (err) {
      setGcalError('구글 로그인 팝업을 열 수 없습니다.');
    } finally {
      setTimeout(() => setGcalLoading(false), 2000);
    }
  };

  const handleGoogleDisconnect = () => {
    disconnectGoogle();
    setGcalConnected(false);
  };

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

      {/* 구글 캘린더 연결 */}
      <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="text-sm font-bold text-text mb-3">📅 구글 캘린더 연동</h3>
        <p className="text-xs text-text-muted mb-3">
          연결하면 시간이 있는 할일이 자동으로 구글 캘린더에 추가되어 핸드폰에서 알림을 받아요!
        </p>

        {gcalConnected ? (
          <div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm text-success font-medium flex-1">구글 캘린더 연결됨</span>
              <button
                className="text-xs text-text-muted hover:text-danger flex items-center gap-1"
                onClick={handleGoogleDisconnect}
              >
                <Unlink className="w-3.5 h-3.5" />
                해제
              </button>
            </div>
          </div>
        ) : (
          <button
            className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-sm font-medium flex items-center justify-center gap-3 active:scale-[0.98] transition-transform hover:border-blue-300 disabled:opacity-50"
            onClick={handleGoogleConnect}
            disabled={gcalLoading}
          >
            {gcalLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            구글 캘린더 연결하기
          </button>
        )}

        {!gcalConnected && (
          <p className="text-[10px] text-text-muted mt-2 text-center">
            연결 없이도 할일에서 📅 버튼으로 캘린더에 추가할 수 있어요
          </p>
        )}

        {gcalError && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg text-xs text-danger flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {gcalError}
          </div>
        )}
      </div>

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
                  {alarm.gcalSynced && (
                    <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">📅</span>
                  )}
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
