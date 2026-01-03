export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji or Lucide Icon Name
    criteria: 'time' | 'streak' | 'goals';
    threshold: number;
    tier: 'bronze' | 'silver' | 'gold' | 'special';
    xpReward: number;
}

export interface UserBadge {
    badgeId: string;
    unlockedAt: string; // ISO
}

export const BADGES: Badge[] = [
    {
        id: 'veteran',
        name: 'Pioneiro',
        description: 'Cadastrado no mês de lançamento.',
        icon: '🚀',
        criteria: 'time',
        threshold: 1,
        tier: 'special',
        xpReward: 500
    },
    {
        id: 'streak_7',
        name: 'Aquecimento',
        description: '7 dias seguidos de uso.',
        icon: '🔥',
        criteria: 'streak',
        threshold: 7,
        tier: 'bronze',
        xpReward: 100
    },
    {
        id: 'streak_30',
        name: 'Consistência',
        description: '30 dias seguidos de uso.',
        icon: '🔥',
        criteria: 'streak',
        threshold: 30,
        tier: 'silver',
        xpReward: 300
    },
    {
        id: 'streak_90',
        name: 'Lenda',
        description: '90 dias seguidos de uso.',
        icon: '💎',
        criteria: 'streak',
        threshold: 90,
        tier: 'gold',
        xpReward: 1000
    },
    {
        id: 'goals_2',
        name: 'Batedor de Metas',
        description: 'Concluiu 2 metas financeiras.',
        icon: '🎯',
        criteria: 'goals',
        threshold: 2,
        tier: 'bronze',
        xpReward: 150
    },
    {
        id: 'goals_10',
        name: 'Mestre das Finanças',
        description: 'Concluiu 10 metas financeiras.',
        icon: '🏆',
        criteria: 'goals',
        threshold: 10,
        tier: 'gold',
        xpReward: 1000
    }
];

export const FAQ_DATA = [
    { q: "Como resetar minha senha?", a: "Vá em Configurações > Segurança e solicite a troca." },
    { q: "O app funciona offline?", a: "Sim! Seus dados são salvos localmente e sincronizados quando houver conexão." },
    { q: "Como exportar meus dados?", a: "Em breve teremos a função de exportar PDF/CSV na aba Perfil." },
    { q: "Posso mudar a moeda?", a: "Sim, nas configurações do aplicativo você pode alterar para USD, EUR ou BRL." },
];

// Storage Logic (Simulation)
const USER_BADGES_KEY = 'ascend_user_badges';

export function getUserBadges(): UserBadge[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(USER_BADGES_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveUserBadge(badgeId: string) {
    const badges = getUserBadges();
    if (badges.find(b => b.badgeId === badgeId)) return; // Already unlocked

    const newBadge = { badgeId, unlockedAt: new Date().toISOString() };
    localStorage.setItem(USER_BADGES_KEY, JSON.stringify([...badges, newBadge]));
    return newBadge;
}
