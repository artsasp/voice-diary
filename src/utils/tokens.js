// 토큰 관리 유틸 - localStorage에 저장하고, 없으면 환경변수로 폴백
const STORAGE_KEY = 'voice-diary-tokens';

export function getTokens() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveTokens(tokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
}

// 각 토큰 조회 (localStorage 우선, 없으면 env)
export function getClaudeKey() {
  return getTokens().claudeKey || import.meta.env.VITE_CLAUDE_API_KEY || '';
}

export function getNotionToken() {
  return getTokens().notionToken || import.meta.env.VITE_NOTION_TOKEN || '';
}

export function getNotionDbId() {
  return getTokens().notionDbId || import.meta.env.VITE_NOTION_DATABASE_ID || '';
}

export function getGoogleClientId() {
  return getTokens().googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
}
