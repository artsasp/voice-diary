import { useState } from 'react';
import { Check, ChevronRight, Minus, Clock, Plus, Pencil, Trophy, Calendar } from 'lucide-react';
import { isGoogleConnected, createCalendarEvent, getGoogleCalendarUrl } from '../utils/googleCalendar';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function HomeDashboard({ todayData, today, setAffirmation, addBullet, updateBulletStatus, deleteBullet, updateWin, addBulletAlarm }) {
  const [editingAffirmation, setEditingAffirmation] = useState(false);
  const [affirmationDraft, setAffirmationDraft] = useState('');
  const [newBulletText, setNewBulletText] = useState('');
  const [newBulletTime, setNewBulletTime] = useState('');
  const [showAddBullet, setShowAddBullet] = useState(false);
  const [calSyncing, setCalSyncing] = useState(null);

  const dateObj = new Date(today + 'T00:00:00');
  const dayStr = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 ${WEEKDAYS[dateObj.getDay()]}요일`;

  const handleAffirmationTap = () => {
    setAffirmationDraft(todayData.affirmation);
    setEditingAffirmation(true);
  };

  const saveAffirmation = () => {
    setAffirmation(affirmationDraft);
    setEditingAffirmation(false);
  };

  const handleAddBullet = () => {
    if (!newBulletText.trim()) return;
    const bullet = addBullet(newBulletText.trim(), newBulletTime || null);
    if (newBulletTime) {
      addBulletAlarm(bullet);
      autoSyncToCalendar(newBulletText.trim(), newBulletTime);
    }
    setNewBulletText('');
    setNewBulletTime('');
    setShowAddBullet(false);
  };

  const autoSyncToCalendar = async (text, time) => {
    if (isGoogleConnected()) {
      try {
        await createCalendarEvent(text, today, time);
      } catch (err) {
        console.log('캘린더 자동 동기화 실패:', err);
      }
    }
  };

  const handleCalendarAdd = async (bullet) => {
    if (!bullet.time) return;

    if (isGoogleConnected()) {
      setCalSyncing(bullet.id);
      try {
        await createCalendarEvent(bullet.text, today, bullet.time);
        setCalSyncing(null);
      } catch {
        // 실패 시 URL 폴백
        window.open(getGoogleCalendarUrl(bullet.text, today, bullet.time), '_blank');
        setCalSyncing(null);
      }
    } else {
      // 구글 연결 안 되어 있으면 URL로 바로 열기
      window.open(getGoogleCalendarUrl(bullet.text, today, bullet.time), '_blank');
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'done': return <Check className="w-4 h-4 text-success" />;
      case 'moved': return <ChevronRight className="w-4 h-4 text-primary-light" />;
      default: return <span className="w-3 h-3 rounded-full border-2 border-primary inline-block" />;
    }
  };

  const nextStatus = (current) => {
    const order = ['todo', 'done', 'moved'];
    const idx = order.indexOf(current);
    return order[(idx + 1) % order.length];
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 px-4">
      {/* 날짜 */}
      <div className="text-center pt-6 pb-3">
        <p className="text-sm text-text-muted">{today}</p>
        <h1 className="text-xl font-bold text-primary-dark">{dayStr}</h1>
      </div>

      {/* 확언 */}
      <div
        className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-4 cursor-pointer"
        onClick={!editingAffirmation ? handleAffirmationTap : undefined}
      >
        <p className="text-xs text-primary-dark font-semibold mb-1">💜 오늘의 확언</p>
        {editingAffirmation ? (
          <div>
            <textarea
              className="w-full bg-white/70 rounded-lg p-2 text-sm resize-none border-0 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
              value={affirmationDraft}
              onChange={(e) => setAffirmationDraft(e.target.value)}
              autoFocus
            />
            <button
              className="mt-2 bg-primary text-white text-xs px-4 py-1.5 rounded-full font-medium"
              onClick={saveAffirmation}
            >
              저장
            </button>
          </div>
        ) : (
          <p className="text-sm text-primary-dark leading-relaxed flex items-start gap-1">
            <span>{todayData.affirmation}</span>
            <Pencil className="w-3 h-3 mt-0.5 shrink-0 opacity-40" />
          </p>
        )}
      </div>

      {/* 불렛 로그 */}
      <div className="bg-card rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text">📋 불렛 로그</h2>
          <button
            className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center"
            onClick={() => setShowAddBullet(!showAddBullet)}
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>

        {showAddBullet && (
          <div className="mb-3 p-3 bg-purple-50 rounded-xl animate-float-up">
            <input
              className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary mb-2"
              placeholder="할 일 입력..."
              value={newBulletText}
              onChange={(e) => setNewBulletText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBullet()}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              <input
                type="time"
                className="bg-white rounded-lg px-2 py-1 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={newBulletTime}
                onChange={(e) => setNewBulletTime(e.target.value)}
              />
              <button
                className="ml-auto bg-primary text-white text-xs px-4 py-1.5 rounded-full font-medium"
                onClick={handleAddBullet}
              >
                추가
              </button>
            </div>
          </div>
        )}

        {todayData.bullets.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">
            아직 항목이 없어요. 음성 캡처나 + 버튼으로 추가해보세요!
          </p>
        ) : (
          <div className="space-y-2">
            {todayData.bullets.map((bullet) => (
              <div
                key={bullet.id}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                  bullet.status === 'done' ? 'bg-green-50 opacity-70' :
                  bullet.status === 'moved' ? 'bg-blue-50 opacity-70' : 'bg-gray-50'
                }`}
              >
                <button
                  className="shrink-0 w-6 h-6 flex items-center justify-center"
                  onClick={() => updateBulletStatus(bullet.id, nextStatus(bullet.status))}
                >
                  {statusIcon(bullet.status)}
                </button>
                <span className={`flex-1 text-sm ${bullet.status === 'done' ? 'line-through text-text-muted' : ''}`}>
                  {bullet.text}
                </span>
                {bullet.time && (
                  <>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {bullet.time}
                    </span>
                    <button
                      className="shrink-0 w-6 h-6 flex items-center justify-center text-blue-500 hover:text-blue-700"
                      onClick={() => handleCalendarAdd(bullet)}
                      title="구글 캘린더에 추가"
                    >
                      {calSyncing === bullet.id ? (
                        <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <Calendar className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
                <button
                  className="shrink-0 w-6 h-6 flex items-center justify-center text-text-muted hover:text-danger"
                  onClick={() => deleteBullet(bullet.id)}
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3 Wins */}
      <div className="bg-card rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-text mb-3 flex items-center gap-1">
          <Trophy className="w-4 h-4 text-warning" /> 3 Wins 감사일기
        </h2>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm font-bold text-warning w-5">{i + 1}.</span>
              <input
                className="flex-1 bg-yellow-50 rounded-lg px-3 py-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-warning/50"
                placeholder={`${i + 1}번째 감사한 일...`}
                value={todayData.wins[i] || ''}
                onChange={(e) => updateWin(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
