import type { VercelRequest, VercelResponse } from '@vercel/node';

const FEISHU_APP_ID = process.env.VITE_FEISHU_APP_ID || '';
const FEISHU_APP_SECRET = process.env.VITE_FEISHU_APP_SECRET || '';
const FEISHU_APP_TOKEN = 'ZUrHbn56qabWqisBRSCctbt2nqe';
const FEISHU_TABLE_ID = 'tblUpUmfqsFGN1IB';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { anonymousId, primaryType, primaryTypeName, scores, totalScore } = req.body || {};

  if (!anonymousId || !primaryType || !scores) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get tenant_access_token
    const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }),
    });

    const tokenData = await tokenRes.json() as { code: number; msg: string; tenant_access_token: string };
    if (tokenData.code !== 0 || !tokenData.tenant_access_token) {
      console.error('[Feishu] Token error:', tokenData.msg);
      return res.status(500).json({ error: 'Feishu token error', detail: tokenData.msg });
    }

    const token = tokenData.tenant_access_token;

    // 2. Write record to bitable
    const recordRes = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fields: {
            '用户ID': anonymousId,
            '关联测评ID': 'recvikTAZoRSsa',
            '状态': 'completed',
            '完成时间': Date.now(),
            'score_tiger': scores.tiger,
            'score_peacock': scores.peacock,
            'score_koala': scores.koala,
            'score_owl': scores.owl,
            'score_chameleon': scores.chameleon,
          },
        }),
      }
    );

    const recordData = await recordRes.json() as { code: number; msg: string; data?: { record?: { record_id: string } } };
    if (recordData.code !== 0) {
      console.error('[Feishu] Write error:', recordData.msg);
      return res.status(500).json({ error: 'Feishu write error', detail: recordData.msg });
    }

    console.log('[Feishu] Record written:', recordData.data?.record?.record_id);
    return res.status(200).json({ success: true, recordId: recordData.data?.record?.record_id });
  } catch (err) {
    console.error('[Feishu] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}