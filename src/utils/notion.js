import { getNotionToken, getNotionDbId } from './tokens';

export async function syncToNotion(todayData, mindJunk, date) {
  const NOTION_TOKEN = getNotionToken();
  const NOTION_DB_ID = getNotionDbId();
  if (!NOTION_TOKEN || !NOTION_DB_ID) {
    throw new Error('노션 토큰과 DB ID를 설정 탭에서 입력해주세요.');
  }

  const bullets = todayData.bullets || [];
  const wins = todayData.wins || ['', '', ''];
  const affirmation = todayData.affirmation || '';

  const bulletText = bullets
    .map((b) => {
      const status = b.status === 'done' ? '✅' : b.status === 'moved' ? '➡️' : '⬜';
      const timeStr = b.time ? ` [${b.time}]` : '';
      return `${status} ${b.text}${timeStr}`;
    })
    .join('\n');

  const winsText = wins
    .filter(Boolean)
    .map((w, i) => `${i + 1}. ${w}`)
    .join('\n');

  const todayJunk = mindJunk
    .filter((j) => j.createdAt?.startsWith(date))
    .map((j) => `- ${j.text}`)
    .join('\n');

  const children = [
    heading2Block(`💜 오늘의 확언`),
    paragraphBlock(affirmation || '(미작성)'),
    dividerBlock(),
    heading2Block(`📋 불렛 로그`),
    paragraphBlock(bulletText || '(항목 없음)'),
    dividerBlock(),
    heading2Block(`🏆 3 Wins`),
    paragraphBlock(winsText || '(미작성)'),
    dividerBlock(),
    heading2Block(`🧹 마인드 정크`),
    paragraphBlock(todayJunk || '(없음)'),
  ];

  const response = await fetch('/api/notion/v1/pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_ID },
      properties: {
        title: {
          title: [{ text: { content: `📖 ${date} 데일리 다이어리` } }],
        },
        Date: {
          date: { start: date },
        },
      },
      children,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Notion 동기화 실패');
  }

  return await response.json();
}

function heading2Block(text) {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  };
}

function paragraphBlock(text) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  };
}

function dividerBlock() {
  return { object: 'block', type: 'divider', divider: {} };
}
