import { useState, useRef, useCallback, useEffect } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const onEndCallbackRef = useRef(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('이 브라우저는 음성인식을 지원하지 않습니다. Chrome을 사용해주세요.');
      return;
    }

    // 기존 인식 정리
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    finalTranscriptRef.current = '';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      // 최종 결과 ref에 누적, 화면에는 누적+임시 표시
      if (final) {
        finalTranscriptRef.current = final;
      }
      setTranscript((finalTranscriptRef.current + ' ' + interim).trim());
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError('음성이 감지되지 않았어요. 다시 말해주세요.');
      } else if (event.error === 'not-allowed') {
        setError('마이크 권한이 거부되었습니다. 브라우저 설정을 확인하세요.');
      } else if (event.error !== 'aborted') {
        setError('음성 인식 오류: ' + event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // 최종 트랜스크립트가 있으면 화면에 반영
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        setTranscript(finalText);
      }
      // stop 후 콜백 실행 (classify 트리거)
      if (onEndCallbackRef.current) {
        const cb = onEndCallbackRef.current;
        onEndCallbackRef.current = null;
        cb(finalText);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      setError('음성 인식을 시작할 수 없습니다: ' + err.message);
    }
  }, []);

  const stopListening = useCallback((onComplete) => {
    if (recognitionRef.current) {
      // onend가 호출되면 콜백 실행
      if (onComplete) {
        onEndCallbackRef.current = onComplete;
      }
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    } else {
      setIsListening(false);
      if (onComplete) onComplete(finalTranscriptRef.current.trim());
    }
  }, []);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    setTranscript,
  };
}
