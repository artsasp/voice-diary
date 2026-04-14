import { getTokens } from './tokens';

export function getGeminiKey() {
  return getTokens().geminiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export async function classifyWithGemini(text) {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  const prompt = `다음 음성 입력을 분류해주세요. JSON으로만 답해주세요.

음성 입력: "${text}"

분류 규칙:
1. 시간이 포함된 할일 → category: "bullet_with_time", time: "HH:MM" 형식
2. 시간 없는 할일/메모 → category: "bullet"
3. 부정적 감정, 불안, 걱정 → category: "mind_junk"
4. 감사, 좋았던 일, 성취 → category: "win"

응답 형식 (JSON만):
{"category": "...", "text": "정리된 텍스트", "time": "HH:MM 또는 null", "emoji": "적절한 이모지 1개"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API 오류:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (err) {
    console.error('Gemini 분류 실패:', err);
    return null;
  }
}
