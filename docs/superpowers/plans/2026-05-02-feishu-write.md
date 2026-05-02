# 飞书写入功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用户完成测试后，自动将结果静默写入飞书多维表格指定表（tblUpUmfqsFGN1IB）。

**Architecture:**
- 纯前端实现：在 `calculateResult()` 执行后调用飞书 API
- 使用 Feishu 开放平台 API（需认证）：`POST /open-apis/suite/passport/tokens/tenant_access_token` 获取 tenant token，然后用 `POST /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records` 写入记录
- 配置项：飞书 App ID、App Secret、App Token、Table ID（写入配置文件）
- 容错：写入失败不影响结果页展示，console.error 记录即可

**Tech Stack:** Feishu Open API (fetch), 前端配置文件

---

## 文件结构

```
src/
├── config/
│   └── feishu.ts        # 飞书配置（App ID, Secret, AppToken, TableId）
├── services/
│   └── feishuApi.ts     # 飞书 API 写入函数
└── composables/
    └── useAssessment.ts  # 修改：calculateResult 后调用写入
```

---

## 1. 配置文件

**`src/config/feishu.ts`** — Create this file:

```typescript
// 飞书多维表格配置
// 目标表：https://gqcouivq19u.feishu.cn/base/ZUrHbn56qabWqisBRSCctbt2nqe?table=tblUpUmfqsFGN1IB
export const FEISHU_CONFIG = {
  appId: process.env.VITE_FEISHU_APP_ID || '',
  appSecret: process.env.VITE_FEISHU_APP_SECRET || '',
  appToken: 'ZUrHbn56qabWqisBRSCctbt2nqe',   // 飞书应用 Token
  tableId: 'tblUpUmfqsFGN1IB',                // 目标数据表 ID
};
```

---

## 2. 飞书 API 服务

**`src/services/feishuApi.ts`** — Create this file:

```typescript
import { FEISHU_CONFIG } from '../config/feishu';
import type { AnimalType, ScoreMap } from '../types';
import { resultData } from '../data/results';

interface FeishuTokenResponse {
  code: number;
  msg: string;
  tenant_access_token: string;
}

interface FeishuRecord {
  fields: {
    anonymous_id: string;
    test_time: string;
    primary_type: string;
    primary_type_name: string;
    score_tiger: number;
    score_peacock: number;
    score_koala: number;
    score_owl: number;
    score_chameleon: number;
    total_score: number;
  };
}

const TYPE_NAMES: Record<AnimalType, string> = {
  tiger: '老虎',
  peacock: '孔雀',
  koala: '考拉',
  owl: '猫头鹰',
  chameleon: '变色龙',
};

export async function submitResultToFeishu(
  anonymousId: string,
  primaryType: AnimalType,
  scores: ScoreMap
): Promise<void> {
  const { appId, appSecret, appToken, tableId } = FEISHU_CONFIG;

  if (!appId || !appSecret) {
    console.warn('[Feishu] 未配置 appId 或 appSecret，跳过写入');
    return;
  }

  try {
    // 1. 获取 tenant_access_token
    const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    });

    if (!tokenRes.ok) throw new Error(`Token request failed: ${tokenRes.status}`);

    const tokenData: FeishuTokenResponse = await tokenRes.json();
    if (tokenData.code !== 0 || !tokenData.tenant_access_token) {
      throw new Error(`Token error: ${tokenData.msg}`);
    }

    const token = tokenData.tenant_access_token;

    // 2. 写入记录
    const record: FeishuRecord = {
      fields: {
        anonymous_id: anonymousId,
        test_time: new Date().toISOString(),
        primary_type: primaryType,
        primary_type_name: TYPE_NAMES[primaryType],
        score_tiger: scores.tiger,
        score_peacock: scores.peacock,
        score_koala: scores.koala,
        score_owl: scores.owl,
        score_chameleon: scores.chameleon,
        total_score: scores[primaryType],
      },
    };

    const recordRes = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(record),
      }
    );

    if (!recordRes.ok) throw new Error(`Record write failed: ${recordRes.status}`);

    const recordData = await recordRes.json();
    if (recordData.code !== 0) {
      throw new Error(`Record error: ${recordData.msg}`);
    }

    console.log('[Feishu] 记录写入成功:', recordData.data?.record?.record_id);
  } catch (err) {
    // 容错：写入失败不影响用户体验
    console.error('[Feishu] 写入失败:', err);
  }
}

export function getAnonymousId(): string {
  let id = localStorage.getItem('pdp_anonymous_id');
  if (!id) {
    id = 'anon_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('pdp_anonymous_id', id);
  }
  return id;
}
```

---

## 3. 修改 useAssessment.ts

**Modify `src/composables/useAssessment.ts`**:

在文件顶部添加导入：
```typescript
import { submitResultToFeishu, getAnonymousId } from '../services/feishuApi';
```

在 `calculateResult()` 函数中，找到 `state.value = 'completed';` 之后，添加：

```typescript
// 静默写入飞书（失败不影响用户体验）
const anonId = getAnonymousId();
submitResultToFeishu(anonId, primaryType, scores).catch(console.error);
```

完整修改后的 `calculateResult` 函数：

```typescript
const calculateResult = (): ResultData => {
  const scores: ScoreMap = { tiger: 0, peacock: 0, koala: 0, owl: 0, chameleon: 0 };

  for (const [qIdStr, score] of Object.entries(answers.value)) {
    const qId = parseInt(qIdStr, 10);
    const animal = SCORING_MAP[qId];
    if (animal && score) {
      scores[animal] += score;
    }
  }

  let maxScore = 0;
  let primaryType: AnimalType = 'tiger';
  for (const animal of ANIMAL_ORDER) {
    if (scores[animal] > maxScore) {
      maxScore = scores[animal];
      primaryType = animal;
    }
  }

  state.value = 'completed';
  localStorage.setItem(STORAGE_KEY_STATE, 'completed');

  // 静默写入飞书（失败不影响用户体验）
  const anonId = getAnonymousId();
  submitResultToFeishu(anonId, primaryType, scores).catch(console.error);

  return { primaryType, scores, totalCompleted: Object.keys(answers.value).length };
};
```

---

## 4. 环境变量配置

**创建 `.env.example`**:

```bash
# 飞书开放平台应用配置
VITE_FEISHU_APP_ID=cli_xxxxxxxxxxxxxx
VITE_FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

**修改 `vite.config.ts`** 确保环境变量可被访问（Vite 默认支持 VITE_ 前缀的 env）。

---

## 5. 更新 index.html 添加说明注释

在 `index.html` 的 `<title>` 标签后添加说明，让开发者知道如何配置飞书：

```html
<!--
  飞书写入配置：
  1. 复制 .env.example 为 .env
  2. 填写 VITE_FEISHU_APP_ID 和 VITE_FEISHU_APP_SECRET
  3. 应用需要开通「多维表格」权限（bitable:app:readonly 或 bitable:app）
-->
```

---

## 验收标准

- [ ] `src/config/feishu.ts` 创建，包含 App ID/Secret/AppToken/TableId 配置
- [ ] `src/services/feishuApi.ts` 创建，包含获取 token + 写入记录逻辑
- [ ] `useAssessment.ts` 修改，`calculateResult()` 后调用 `submitResultToFeishu`
- [ ]anonymousId 生成和持久化（localStorage）
- [ ] `.env.example` 创建，包含两个环境变量说明
- [ ] 写入失败容错处理（不弹窗、不报错，只 console.error）
- [ ] `npm run build` 通过

---

## 执行选择

Plan complete and saved. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks

**2. Inline Execution** — Execute tasks in this session using executing-plans

Which approach?