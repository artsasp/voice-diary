import { useState, useEffect } from 'react';
import { Home, Mic, Brain, Settings } from 'lucide-react';
import { useStore } from './store/useStore';
import { scheduleAllAlarms, requestNotificationPermission } from './utils/notifications';
import HomeDashboard from './components/HomeDashboard';
import QuickCapture from './components/QuickCapture';
import MindJunk from './components/MindJunk';
import AlarmSettings from './components/AlarmSettings';
import './App.css';

const TABS = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'capture', label: '캡처', Icon: Mic },
  { id: 'junk', label: '정크', Icon: Brain },
  { id: 'settings', label: '설정', Icon: Settings },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const store = useStore();

  // Service Worker 등록
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  // 알림 스케줄링
  useEffect(() => {
    requestNotificationPermission();
    scheduleAllAlarms(store.data.alarms, store.data.bulletAlarms);
  }, [store.data.alarms, store.data.bulletAlarms]);

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeDashboard
            todayData={store.todayData}
            today={store.today}
            setAffirmation={store.setAffirmation}
            addBullet={store.addBullet}
            updateBulletStatus={store.updateBulletStatus}
            deleteBullet={store.deleteBullet}
            updateWin={store.updateWin}
          />
        );
      case 'capture':
        return (
          <QuickCapture
            addBullet={store.addBullet}
            addMindJunk={store.addMindJunk}
            updateWin={store.updateWin}
            todayData={store.todayData}
            addBulletAlarm={store.addBulletAlarm}
          />
        );
      case 'junk':
        return (
          <MindJunk
            mindJunk={store.data.mindJunk}
            deleteMindJunk={store.deleteMindJunk}
            addMindJunkAnswer={store.addMindJunkAnswer}
          />
        );
      case 'settings':
        return (
          <AlarmSettings
            alarms={store.data.alarms}
            bulletAlarms={store.data.bulletAlarms}
            updateAlarm={store.updateAlarm}
            removeBulletAlarm={store.removeBulletAlarm}
            todayData={store.todayData}
            mindJunk={store.data.mindJunk}
            today={store.today}
            setNotionSyncStatus={store.setNotionSyncStatus}
            notionSyncStatus={store.data.notionSyncStatus}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderTab()}
      </main>

      {/* 하단 탭바 */}
      <nav className="bg-card border-t border-border px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            const isCapture = id === 'capture';
            return (
              <button
                key={id}
                className={`flex-1 flex flex-col items-center py-2 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-muted'
                }`}
                onClick={() => setActiveTab(id)}
              >
                {isCapture ? (
                  <div className={`w-12 h-12 -mt-5 rounded-full flex items-center justify-center shadow-lg ${
                    isActive
                      ? 'bg-gradient-to-br from-primary to-primary-dark text-white'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                <span className={`text-[10px] mt-0.5 font-medium ${isCapture ? 'mt-1' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default App;
