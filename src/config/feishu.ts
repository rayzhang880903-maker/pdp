/// <reference types="vite/client" />

// 飞书多维表格配置
// 目标表：https://gqcouivq19u.feishu.cn/base/ZUrHbn56qabWqisBRSCctbt2nqe?table=tblUpUmfqsFGN1IB
export const FEISHU_CONFIG = {
  appId: import.meta.env.VITE_FEISHU_APP_ID || '',
  appSecret: import.meta.env.VITE_FEISHU_APP_SECRET || '',
  appToken: 'ZUrHbn56qabWqisBRSCctbt2nqe',   // 飞书应用 Token
  tableId: 'tblUpUmfqsFGN1IB',                // 目标数据表 ID
};