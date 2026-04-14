import { getClaudeKey } from './tokens';

export async function classifyVoiceInput(text) {
  const CLAUDE_API_KEY = getClaudeKey();
  if (!CLAUDE_API_KEY) {
    return fallbackClassify(text);
  }

  try {
    const response = await fetch('/api/claude/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `다음 음성 입력을 분류해주세요. JSON으로만 답해주세요.

음성 입력: "${text}"

분류 규칙:
1. 시간이 포함된 할일 → category: "bullet_with_time", time: "HH:MM" 형식
2. 시간 없는 할일/메모 → category: "bullet"
3. 부정적 감정, 불안, 걱정 → category: "mind_junk"
4. 감사, 좋았던 일, 성취 → category: "win"

응답 형식 (JSON만):
{"category": "...", "text": "정리된 텍스트", "time": "HH:MM 또는 null", "emoji": "적절한 이모지 1개"}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return fallbackClassify(text);
  } catch (err) {
    console.error('Claude API error:', err);
    return fallbackClassify(text);
  }
}

function fallbackClassify(text) {
  const lower = text.toLowerCase();

  const timeMatch = text.match(/(\d{1,2})\s*시\s*(\d{0,2})\s*분?/);
  const timeMatch2 = text.match(/(\d{1,2}):(\d{2})/);

  if (timeMatch || timeMatch2) {
    const hours = timeMatch ? timeMatch[1].padStart(2, '0') : timeMatch2[1].padStart(2, '0');
    const mins = timeMatch ? (timeMatch[2] || '00').padStart(2, '0') : timeMatch2[2];
    return {
      category: 'bullet_with_time',
      text,
      time: `${hours}:${mins}`,
      emoji: '⏰',
    };
  }

  const negativeWords = ['불안', '걱정', '힘들', '지치', '짜증', '화나', '우울', '슬프', '두렵', '무섭', '스트레스', '못하', '싫'];
  if (negativeWords.some((w) => lower.includes(w))) {
    return { category: 'mind_junk', text, time: null, emoji: '🌧️' };
  }

  const positiveWords = ['감사', '고마', '좋았', '행복', '기뻐', '뿌듯', '성공', '해냈', '잘했', '감동'];
  if (positiveWords.some((w) => lower.includes(w))) {
    return { category: 'win', text, time: null, emoji: '✨' };
  }

  return { category: 'bullet', text, time: null, emoji: '📝' };
}
