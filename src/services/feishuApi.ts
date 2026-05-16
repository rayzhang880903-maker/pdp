import type { AnimalType, ScoreMap } from '../types';

const TYPE_NAMES: Record<AnimalType, string> = {
  tiger: '老虎',
  peacock: '孔雀',
  koala: '考拉',
  owl: '猫头鹰',
  chameleon: '变色龙',
};

const PROXY_URL = '';

export function getAnonymousId(): string {
  let id = localStorage.getItem('pdp_anonymous_id');
  if (!id) {
    id = 'anon_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('pdp_anonymous_id', id);
  }
  return id;
}

export async function submitResultToFeishu(
  anonymousId: string,
  primaryType: AnimalType,
  scores: ScoreMap
): Promise<void> {
  try {
    const response = await fetch(`${PROXY_URL}/api/feishu/write-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousId,
        primaryType,
        primaryTypeName: TYPE_NAMES[primaryType],
        scores,
        totalScore: scores[primaryType],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown' }));
      throw new Error(`Proxy error ${response.status}: ${err.error || err.detail || response.statusText}`);
    }

    const data = await response.json() as { success: boolean; recordId?: string };
    console.log('[Feishu] 记录写入成功:', data.recordId);
  } catch (err) {
    console.error('[Feishu] 写入失败:', err);
  }
}