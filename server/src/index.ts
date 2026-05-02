import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config({ path: 'D:/ccTest/asssessments/server/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use('/webhooks/:path', express.raw({ type: '*', extended: true }));
app.use(express.json());

const FEISHU_APP_ID = process.env.VITE_FEISHU_APP_ID || '';
const FEISHU_APP_SECRET = process.env.VITE_FEISHU_APP_SECRET || '';
const FEISHU_APP_TOKEN = 'ZUrHbn56qabWqisBRSCctbt2nqe';
const FEISHU_TABLE_ID = 'tblUpUmfqsFGN1IB';

app.post('/api/feishu/write-record', async (req, res) => {
  const { anonymousId, primaryType, primaryTypeName, scores, totalScore } = req.body;

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
      console.error('[Feishu Server] Token error:', tokenData.msg);
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
      console.error('[Feishu Server] Write error:', recordData.msg);
      return res.status(500).json({ error: 'Feishu write error', detail: recordData.msg });
    }

    console.log('[Feishu Server] Record written:', recordData.data?.record?.record_id);
    res.json({ success: true, recordId: recordData.data?.record?.record_id });
  } catch (err) {
    console.error('[Feishu Server] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', appId: FEISHU_APP_ID || 'EMPTY' });
});

app.get('/debug-env', (_req, res) => {
  res.json({
    VITE_FEISHU_APP_ID: process.env.VITE_FEISHU_APP_ID || '(not set)',
    VITE_FEISHU_APP_SECRET: process.env.VITE_FEISHU_APP_SECRET ? '(set)' : '(not set)',
    cwd: process.cwd(),
  });
});

app.listen(PORT, () => {
  console.log(`[Feishu Proxy] Running on http://localhost:${PORT}`);
  console.log(`[Feishu Proxy] FEISHU_APP_ID set: ${FEISHU_APP_ID ? 'YES' : 'NO'}`);
});