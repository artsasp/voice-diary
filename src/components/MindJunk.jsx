import { useState } from 'react';
import { Trash2, Send } from 'lucide-react';

const PURIFY_QUESTIONS = [
  '지금 내 마음속에서 가장 큰 목소리를 내는 감정은?',
  '끌어당김을 하다 불안해질 때 떠오르는 생각은?',
  '가장 친한 친구가 같은 상황이라면 뭐라고 말해줄까?',
  '걱정 없이 하루를 보낸다면 지금과 뭐가 달라질까?',
  '어린 나에게 지금 해주고 싶은 말은?',
];

export default function MindJunk({ mindJunk, deleteMindJunk, addMindJunkAnswer }) {
  const [answers, setAnswers] = useState({});

  const handleAnswer = (questionIdx) => {
    const text = answers[questionIdx];
    if (!text?.trim()) return;
    // 가장 최근 마인드 정크에 답변 연결
    if (mindJunk.length > 0) {
      addMindJunkAnswer(mindJunk[0].id, questionIdx, text.trim());
    }
    setAnswers((prev) => ({ ...prev, [questionIdx]: '' }));
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      <div className="text-center pt-6 pb-4">
        <h2 className="text-lg font-bold text-primary-dark">🧹 마인드 정크</h2>
        <p className="text-xs text-text-muted mt-1">불안과 감정을 꺼내놓고, 정화해보세요</p>
      </div>

      {/* 마인드 정크 카드 목록 */}
      {mindJunk.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🌤️</p>
          <p className="text-sm text-text-muted">마음이 깨끗해요!</p>
          <p className="text-xs text-text-muted mt-1">음성 캡처에서 감정이 자동으로 이동해요</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {mindJunk.map((item) => (
            <div
              key={item.id}
              className="bg-junk border border-junk-border rounded-xl p-3 animate-float-up"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm text-text">{item.text}</p>
                  <p className="text-xs text-text-muted mt-1">{formatTime(item.createdAt)}</p>
                </div>
                <button
                  className="shrink-0 w-7 h-7 flex items-center justify-center text-text-muted hover:text-danger rounded-lg hover:bg-red-50"
                  onClick={() => deleteMindJunk(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {/* 이 카드에 달린 답변들 */}
              {item.answers && Object.entries(item.answers).map(([qIdx, ans]) => (
                <div key={qIdx} className="mt-2 pl-3 border-l-2 border-primary/30">
                  <p className="text-xs text-text-muted">{PURIFY_QUESTIONS[qIdx]}</p>
                  <p className="text-xs text-text mt-0.5">{ans}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 정화 질문 */}
      <div className="bg-card rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-text mb-3">🔮 정화 질문</h3>
        <div className="space-y-3">
          {PURIFY_QUESTIONS.map((q, idx) => (
            <div key={idx}>
              <p className="text-xs text-primary-dark font-medium mb-1">
                {idx + 1}. {q}
              </p>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-purple-50 rounded-lg px-3 py-2 text-xs border-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="여기에 적어보세요..."
                  value={answers[idx] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [idx]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnswer(idx)}
                />
                <button
                  className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0"
                  onClick={() => handleAnswer(idx)}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
