import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'voice-diary-data';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getDefaultDay() {
  return {
    affirmation: '나는 충분히 잘하고 있고, 좋은 일들이 나에게 다가오고 있다.',
    bullets: [],
    wins: ['', '', ''],
  };
}

function getDefaultData() {
  return {
    days: {},
    mindJunk: [],
    alarms: {
      morning: { enabled: true, time: '07:00', label: '오늘의 확언 읽기' },
      evening: { enabled: true, time: '21:00', label: '마인드 정크 정화 시간' },
      night: { enabled: true, time: '22:00', label: '3 Wins 작성하기' },
    },
    bulletAlarms: [],
    notionSyncStatus: null,
  };
}

export function useStore() {
  const [data, setData] = useState(() => {
    const saved = loadData();
    return saved || getDefaultData();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const today = getToday();

  const todayData = data.days[today] || getDefaultDay();

  const updateToday = useCallback((updater) => {
    setData((prev) => {
      const current = prev.days[today] || getDefaultDay();
      const updated = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, days: { ...prev.days, [today]: { ...current, ...updated } } };
    });
  }, [today]);

  // Bullets
  const addBullet = useCallback((text, time = null) => {
    const bullet = {
      id: Date.now().toString(),
      text,
      status: 'todo', // todo, done, moved, deleted
      time,
      createdAt: new Date().toISOString(),
    };
    updateToday((day) => ({ bullets: [...day.bullets, bullet] }));
    return bullet;
  }, [updateToday]);

  const updateBulletStatus = useCallback((id, status) => {
    updateToday((day) => ({
      bullets: day.bullets.map((b) => (b.id === id ? { ...b, status } : b)),
    }));
  }, [updateToday]);

  const deleteBullet = useCallback((id) => {
    updateToday((day) => ({
      bullets: day.bullets.filter((b) => b.id !== id),
    }));
  }, [updateToday]);

  // Affirmation
  const setAffirmation = useCallback((text) => {
    updateToday(() => ({ affirmation: text }));
  }, [updateToday]);

  // 3 Wins
  const updateWin = useCallback((index, text) => {
    updateToday((day) => {
      const wins = [...day.wins];
      wins[index] = text;
      return { wins };
    });
  }, [updateToday]);

  // Mind Junk
  const addMindJunk = useCallback((text) => {
    const item = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      mindJunk: [item, ...prev.mindJunk],
    }));
  }, []);

  const deleteMindJunk = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      mindJunk: prev.mindJunk.filter((j) => j.id !== id),
    }));
  }, []);

  const addMindJunkAnswer = useCallback((id, questionIndex, answer) => {
    setData((prev) => ({
      ...prev,
      mindJunk: prev.mindJunk.map((j) =>
        j.id === id
          ? { ...j, answers: { ...(j.answers || {}), [questionIndex]: answer } }
          : j
      ),
    }));
  }, []);

  // Alarms
  const updateAlarm = useCallback((key, updates) => {
    setData((prev) => ({
      ...prev,
      alarms: { ...prev.alarms, [key]: { ...prev.alarms[key], ...updates } },
    }));
  }, []);

  const addBulletAlarm = useCallback((bullet) => {
    if (!bullet.time) return;
    setData((prev) => ({
      ...prev,
      bulletAlarms: [
        ...prev.bulletAlarms.filter((a) => a.bulletId !== bullet.id),
        { bulletId: bullet.id, text: bullet.text, time: bullet.time, date: today },
      ],
    }));
  }, [today]);

  const removeBulletAlarm = useCallback((bulletId) => {
    setData((prev) => ({
      ...prev,
      bulletAlarms: prev.bulletAlarms.filter((a) => a.bulletId !== bulletId),
    }));
  }, []);

  // Notion sync
  const setNotionSyncStatus = useCallback((status) => {
    setData((prev) => ({ ...prev, notionSyncStatus: status }));
  }, []);

  return {
    data,
    today,
    todayData,
    addBullet,
    updateBulletStatus,
    deleteBullet,
    setAffirmation,
    updateWin,
    addMindJunk,
    deleteMindJunk,
    addMindJunkAnswer,
    updateAlarm,
    addBulletAlarm,
    removeBulletAlarm,
    setNotionSyncStatus,
  };
}
