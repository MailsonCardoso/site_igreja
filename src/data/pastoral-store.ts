// Pastoral Data Store - Simula um banco de dados usando LocalStorage
// Isso permite que os dados sejam "reais" (persistentes) e compartilhados entre telas.

export interface Sermon {
    id: number;
    title: string;
    series: string; // Nome da série ou "Avulso"
    verse: string;
    date: string;
    status: "Planejado" | "Pregado" | "Rascunho";
    color: string;
    content: {
        intro: string;
        topics: string[];
        conclusion: string;
    };
}

export interface Series {
    id: number;
    title: string;
    description: string;
    total: number;
    completed: number;
    color: string;
    coverColor: string;
    startDate: string;
}

export interface Insight {
    id: number;
    type: string;
    content: string;
    title?: string;
    reference?: string;
    tags: string[];
}

const STORAGE_KEYS = {
    SERMONS: "pastor_sermons",
    SERIES: "pastor_series",
    INSIGHTS: "pastor_insights"
};

// Dados Iniciais (Mock) caso o storage esteja vazio
const defaultSermons: Sermon[] = [
    {
        id: 1,
        title: "Justificados pela Fé",
        series: "Estudos em Romanos",
        verse: "Romanos 5:1",
        date: "2026-02-15",
        status: "Planejado",
        color: "bg-amber-400",
        content: {
            intro: "A paz com Deus é o fundamento da nossa alegria...",
            topics: ["A natureza da justificação", "Paz com Deus vs Sentimento de Paz", "Acesso à Graça"],
            conclusion: "Portanto, alegremo-nos na esperança da glória de Deus."
        }
    },
    {
        id: 2,
        title: "O Senhor é meu Pastor",
        series: "Salmos de Confiança",
        verse: "Salmos 23:1",
        date: "2026-02-08",
        status: "Pregado",
        color: "bg-green-500",
        content: {
            intro: "Neste salmo tão conhecido, Davi expressa...",
            topics: ["A provisão do Pastor", "O cuidado constante"],
            conclusion: "Bondade e misericórdia me seguirão todos os dias."
        }
    }
];

const defaultSeries: Series[] = [
    {
        id: 1,
        title: "Estudos em Romanos",
        description: "Uma jornada expositiva pela epístola de Paulo.",
        total: 12,
        completed: 4,
        color: "bg-blue-500",
        coverColor: "from-blue-500/20 to-blue-500/5",
        startDate: "2024-01-15"
    },
    {
        id: 2,
        title: "Salmos de Confiança",
        description: "Encontrando paz em meio às tormentas da vida.",
        total: 5,
        completed: 5,
        color: "bg-green-500",
        coverColor: "from-green-500/20 to-green-500/5",
        startDate: "2023-12-01"
    }
];

// Funções de Acesso
export const PastoralStore = {
    // Sermões
    getSermons: (): Sermon[] => {
        const data = localStorage.getItem(STORAGE_KEYS.SERMONS);
        return data ? JSON.parse(data) : defaultSermons;
    },
    saveSermons: (sermons: Sermon[]) => {
        localStorage.setItem(STORAGE_KEYS.SERMONS, JSON.stringify(sermons));
    },

    // Séries
    getSeries: (): Series[] => {
        const data = localStorage.getItem(STORAGE_KEYS.SERIES);
        return data ? JSON.parse(data) : defaultSeries;
    },
    saveSeries: (series: Series[]) => {
        localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(series));
    },

    // Insights
    getInsights: (): Insight[] => {
        const data = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
        return data ? JSON.parse(data) : [];
    },
    saveInsights: (insights: Insight[]) => {
        localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(insights));
    }
};
