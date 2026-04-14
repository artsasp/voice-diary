import { getGoogleClientId } from './tokens';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;

// GAPI 초기화
export async function initGapi() {
  if (gapiInited) return;
  await new Promise((resolve, reject) => {
    if (window.gapi) {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({ discoveryDocs: [DISCOVERY_DOC] });
          gapiInited = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    } else {
      reject(new Error('Google API 스크립트가 로드되지 않았습니다.'));
    }
  });
}

// GIS 토큰 클라이언트 초기화
export function initTokenClient(onSuccess, onError) {
  if (!window.google?.accounts?.oauth2) {
    onError?.('Google Identity Services가 로드되지 않았습니다.');
    return;
  }
  const clientId = getGoogleClientId();
  if (!clientId) {
    onError?.('구글 Client ID를 설정 탭에서 입력해주세요.');
    return;
  }
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        onError?.(response.error);
      } else {
        localStorage.setItem('gcal_token', JSON.stringify({
          access_token: response.access_token,
          expires_at: Date.now() + (response.expires_in * 1000),
        }));
        onSuccess?.(response);
      }
    },
  });
}

// 로그인 (동의 팝업)
export function requestGoogleAuth() {
  if (!tokenClient) return;
  const saved = getStoredToken();
  if (saved) {
    window.gapi.client.setToken({ access_token: saved });
    tokenClient.callback({ access_token: saved });
  } else {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }
}

// 저장된 토큰 가져오기
function getStoredToken() {
  try {
    const data = JSON.parse(localStorage.getItem('gcal_token'));
    if (data && data.expires_at > Date.now()) {
      return data.access_token;
    }
  } catch {}
  return null;
}

// 로그인 상태 확인
export function isGoogleConnected() {
  return !!getStoredToken();
}

// 로그아웃
export function disconnectGoogle() {
  const token = getStoredToken();
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token);
  }
  localStorage.removeItem('gcal_token');
  if (window.gapi?.client) {
    window.gapi.client.setToken(null);
  }
}

// 캘린더 이벤트 생성
export async function createCalendarEvent(title, date, time, durationMinutes = 30) {
  const token = getStoredToken();
  if (!token) throw new Error('구글 캘린더 연결이 필요합니다.');

  await initGapi();
  window.gapi.client.setToken({ access_token: token });

  const startDateTime = `${date}T${time}:00`;
  const endDate = new Date(`${date}T${time}:00`);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  const endDateTime = endDate.toISOString().replace('Z', '');

  const event = {
    summary: `📋 ${title}`,
    description: 'Voice Diary에서 생성된 할일',
    start: {
      dateTime: startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime.slice(0, 19),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
        { method: 'popup', minutes: 0 },
      ],
    },
  };

  try {
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    return response.result;
  } catch (err) {
    // 토큰 만료 시 재인증
    if (err.status === 401) {
      localStorage.removeItem('gcal_token');
      throw new Error('인증이 만료되었습니다. 다시 연결해주세요.');
    }
    throw err;
  }
}

// 간편 URL 생성 (폴백 - API 없이도 동작)
export function getGoogleCalendarUrl(title, date, time, durationMinutes = 30) {
  const start = `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
  const endDate = new Date(`${date}T${time}:00`);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  const end = endDate.toISOString().replace(/[-:]/g, '').slice(0, 15);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `📋 ${title}`,
    dates: `${start}/${end}`,
    details: 'Voice Diary에서 생성된 할일',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
