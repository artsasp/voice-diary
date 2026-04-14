import { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, Trash2, ExternalLink } from 'lucide-react';
import { getTokens, saveTokens, clearTokens } from '../utils/tokens';

export default function TokenSettings() {
  const [tokens, setTokensState] = useState(() => getTokens());
  const [show, setShow] = useState({});
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key, value) => {
    setTokensState((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveTokens(tokens);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (!confirm('저장된 모든 토큰을 삭제할까요?')) return;
    clearTokens();
    setTokensState({});
    setSaved(false);
  };

  const toggleShow = (key) => {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fields = [
    {
      key: 'geminiKey',
      label: 'Gemini API 키 (무료 추천)',
      placeholder: 'AIzaSy...',
      help: 'https://aistudio.google.com/apikey',
      desc: '🆓 무료 AI 분류 - 1순위로 사용',
    },
    {
      key: 'claudeKey',
      label: 'Claude API 키',
      placeholder: 'sk-ant-api03-...',
      help: 'https://console.anthropic.com',
      desc: 'AI 자동 분류 (Gemini 없을 때 사용)',
    },
    {
      key: 'notionToken',
      label: 'Notion Integration Token',
      placeholder: 'secret_... 또는 ntn_...',
      help: 'https://www.notion.so/my-integrations',
      desc: '노션 동기화용',
    },
    {
      key: 'notionDbId',
      label: 'Notion Database ID',
      placeholder: '32자리 문자열',
      help: 'https://www.notion.so',
      desc: '노션 페이지 URL에서 복사',
    },
    {
      key: 'googleClientId',
      label: 'Google Client ID',
      placeholder: 'xxxxx.apps.googleusercontent.com',
      help: 'https://console.cloud.google.com',
      desc: '구글 캘린더 연동용 (선택)',
    },
  ];

  const configuredCount = fields.filter((f) => tokens[f.key]).length;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-text">내 API 토큰 설정</h3>
          {configuredCount > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
              {configuredCount}/5 등록됨
            </span>
          )}
        </div>
        <span className="text-text-muted text-xs">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="bg-blue-50 rounded-lg p-2 text-[11px] text-blue-800">
            💡 토큰은 브라우저(localStorage)에만 저장돼요. 서버에 올라가지 않아 안전합니다!
          </div>

          {fields.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-text">{field.label}</label>
                <a
                  href={field.help}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-primary flex items-center gap-0.5"
                >
                  발급받기 <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[10px] text-text-muted mb-1">{field.desc}</p>
              <div className="relative">
                <input
                  type={show[field.key] ? 'text' : 'password'}
                  className="w-full bg-gray-50 rounded-lg px-3 py-2 pr-9 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={field.placeholder}
                  value={tokens[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                  onClick={() => toggleShow(field.key)}
                  type="button"
                >
                  {show[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-medium active:scale-[0.98] flex items-center justify-center gap-1"
              onClick={handleSave}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  저장됨!
                </>
              ) : (
                '저장'
              )}
            </button>
            <button
              className="bg-gray-100 text-text-muted rounded-xl px-4 py-2 text-sm hover:bg-red-50 hover:text-danger flex items-center gap-1"
              onClick={handleClear}
              title="모두 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
