import type { AnimalType } from '../types';

export interface ResultInfo {
  type: AnimalType;
  title: string;
  emoji: string;
  description: string;
  suggestions: string[];
  careers: string[];
  color: string;
}

export const resultData: Record<AnimalType, ResultInfo> = {
  tiger: {
    type: 'tiger',
    title: '支配型',
    emoji: '🐯',
    description: '目标明确，行动迅速，喜欢挑战和权力，做决策快，喜欢主导。适合担任领导者、开拓者、危机解决者角色。',
    suggestions: ['建议从事需要快速决策、掌控全局的工作，如企业管理层、创业者、销售团队负责人等。', '注意避免过于强势，学团队协作。'],
    careers: ['创业者', '销售总监', '项目经理', '企业管理层'],
    color: '#F97316',
  },
  peacock: {
    type: 'peacock',
    title: '表达型',
    emoji: '🦚',
    description: '热情、善于社交、乐观，喜欢与人交往，能活跃气氛，善于激励和说服，注重表面和体验。',
    suggestions: ['建议从事销售、公关、团队凝聚者、发言人等需要人际交往的工作。', '注意扬长避短，在擅长的领域发挥优势。'],
    careers: ['销售', '公关', '市场推广', '团队管理者'],
    color: '#EC4899',
  },
  koala: {
    type: 'koala',
    title: '耐心型',
    emoji: '🐨',
    description: '平和、沉稳、有耐心，喜欢稳定的工作环境，善于倾听和支持他人。',
    suggestions: ['建议从事协调者、后勤支持、客户服务、团队稳定器等工作。', '注意在稳定中寻求突破，避免安于现状。'],
    careers: ['客服', 'HR', '行政', '协调者'],
    color: '#92400E',
  },
  owl: {
    type: 'owl',
    title: '精确型',
    emoji: '🦉',
    description: '注重逻辑、数据和流程，遵守规则，做事有条理，追求完美和准确。',
    suggestions: ['建议从事质量控制、财务、数据分析、流程管理者等工作。', '注意避免过度追求完美而影响效率。'],
    careers: ['财务', '数据分析', '质量控制', '流程管理者'],
    color: '#1E40AF',
  },
  chameleon: {
    type: 'chameleon',
    title: '整合型',
    emoji: '🦎',
    description: '能根据环境和需要调整自己的行为，善于处理复杂局面和协调不同意见。',
    suggestions: ['建议从事谈判者、项目经理、组织变革推动者等工作。', '发挥灵活适应的优势，在复杂环境中游刃有余。'],
    careers: ['项目经理', '谈判者', '变革管理', '咨询顾问'],
    color: '#7C3AED',
  },
};