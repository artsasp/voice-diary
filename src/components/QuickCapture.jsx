import { useState } from 'react';
import { Mic, MicOff, Loader2, Send } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { classifyVoiceInput } from '../utils/claude';

const CATEGORY_LABELS = {
  bullet_with_time: { label: '할일 (시간 포함)', color: 'bg-purple-100 text-purple-800', icon: '⏰' },
  bullet: { label: '할일/메모', color: 'bg-gray-100 text-gray-800', icon: '📝' },
  mind_junk: { label: '마인드 정크', color: 'bg-amber-100 text-amber-800', icon: '🌧️' },
  win: { label: '3 Wins', color: 'bg-green-100 text-green-800', icon: '✨' },
};

export default function QuickCapture({ addBullet, addMindJunk, updateWin, todayData, addBulletAlarm }) {
  const { isListening, transcript, error, startListening, stopListening, setTranscript } = useSpeechRecognition();
  const [classifyResult, setClassifyResult] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [manualText, setManualText] = useState('');

  const handleStop = async () => {
    stopListening();
    if (transcript.trim()) {
      await classify(transcript.trim());
    }
  };

  const classify = async (text) => {
    setIsClassifying(true);
    setSaved(false);
    try {
      const result = await classifyVoiceInput(text);
      setClassifyResult(result);
      saveResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const saveResult = (result) => {
    if (!result) return;
    switch (result.category) {
      case 'bullet_with_time': {
        const bullet = addBullet(result.text, result.time);
        if (result.time) addBulletAlarm(bullet);
        break;
      }
      case 'bullet':
        addBullet(result.text);
        break;
      case 'mind_junk':
        addMindJunk(result.text);
        break;
      case 'win': {
        const emptyIdx = todayData.wins.findIndex((w) => !w);
        if (emptyIdx !== -1) updateWin(emptyIdx, result.text);
        else updateWin(2, result.text);
        break;
      }
    }
    setSaved(true);
  };

  const handleManualSend = async () => {
    if (!manualText.trim()) return;
    setTranscript(manualText.trim());
    await classify(manualText.trim());
    setManualText('');
  };

  const reset = () => {
    setClassifyResult(null);
    setSaved(false);
    setTranscript('');
  };

  const catInfo = classifyResult ? CATEGORY_LABELS[classifyResult.category] || CATEGORY_LABELS.bullet : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
      <h2 className="text-lg font-bold text-primary-dark mb-2">음성 캡처</h2>
      <p className="text-xs text-text-muted mb-8">마이크를 누르고 말해보세요. AI가 자동 분류해요!</p>

      {/* 마이크 버튼 */}
      <div className="relative mb-8">
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" style={{ margin: '-16px' }} />
        )}
        <button
          className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            isListening
              ? 'bg-danger text-white shadow-danger/30'
              : 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-primary/30'
          }`}
          onClick={isListening ? handleStop : startListening}
          disabled={isClassifying}
        >
          {isClassifying ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>

      <p className="text-xs text-text-muted mb-4">
        {isListening ? '듣고 있어요... 다시 누르면 멈춰요' :
         isClassifying ? 'AI가 분류 중...' : '탭해서 시작'}
      </p>

      {/* 실시간 트랜스크립트 */}
      {(isListening || transcript) && (
        <div className="w-full bg-card rounded-2xl p-4 shadow-sm mb-4 animate-float-up">
          <p className="text-xs text-text-muted mb-1">인식된 텍스트</p>
          <p className="text-sm text-text">{transcript || '...'}</p>
        </div>
      )}

      {/* 분류 결과 */}
      {classifyResult && (
        <div className="w-full bg-card rounded-2xl p-4 shadow-sm mb-4 animate-float-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{classifyResult.emoji || catInfo?.icon}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catInfo?.color}`}>
              {catInfo?.label}
            </span>
            {saved && <span className="text-xs text-success font-semibold ml-auto">✅ 저장됨</span>}
          </div>
          <p className="text-sm text-text">{classifyResult.text}</p>
          {classifyResult.time && (
            <p className="text-xs text-primary mt-1">⏰ 알림: {classifyResult.time}</p>
          )}
          <button
            className="mt-3 text-xs text-primary underline"
            onClick={reset}
          >
            다시 캡처하기
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-danger mb-4">{error}</p>
      )}

      {/* 수동 입력 */}
      <div className="w-full mt-auto">
        <p className="text-xs text-text-muted mb-2 text-center">또는 직접 입력</p>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-card rounded-xl px-4 py-3 text-sm shadow-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="텍스트로 입력..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSend()}
          />
          <button
            className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center shadow-sm active:scale-95"
            onClick={handleManualSend}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
