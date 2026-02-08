// Mock Data for Church Dashboard

export const kpiData = {
  membrosAtivos: 1240,
  entradasMes: 42500,
  novosVisitantes: 18,
  celulas: 32,
};

export const frequenciaCultos = [
  { mes: "Set", presentes: 820 },
  { mes: "Out", presentes: 890 },
  { mes: "Nov", presentes: 950 },
  { mes: "Dez", presentes: 1100 },
  { mes: "Jan", presentes: 980 },
  { mes: "Fev", presentes: 1050 },
];

export const aniversariantes = [
  { id: 1, nome: "Maria Silva", dia: 3, avatar: "MS" },
  { id: 2, nome: "João Santos", dia: 7, avatar: "JS" },
  { id: 3, nome: "Ana Oliveira", dia: 12, avatar: "AO" },
  { id: 4, nome: "Pedro Costa", dia: 15, avatar: "PC" },
  { id: 5, nome: "Carla Souza", dia: 18, avatar: "CS" },
  { id: 6, nome: "Lucas Ferreira", dia: 22, avatar: "LF" },
];

export const faixaEtaria = [
  { faixa: "0-12", quantidade: 180, fill: "hsl(43, 96%, 56%)" },
  { faixa: "13-25", quantidade: 320, fill: "hsl(217, 91%, 60%)" },
  { faixa: "26-40", quantidade: 450, fill: "hsl(142, 76%, 36%)" },
  { faixa: "41-60", quantidade: 210, fill: "hsl(270, 60%, 60%)" },
  { faixa: "60+", quantidade: 80, fill: "hsl(0, 84%, 60%)" },
];

export const membros = [];

export const transacoes = [
  { id: 1, tipo: "entrada", categoria: "Dízimo", descricao: "Dízimos do mês", valor: 28500, data: "2024-02-01" },
  { id: 2, tipo: "entrada", categoria: "Oferta", descricao: "Oferta do culto dominical", valor: 8200, data: "2024-02-04" },
  { id: 3, tipo: "saida", categoria: "Aluguel", descricao: "Aluguel do templo", valor: 4500, data: "2024-02-05" },
  { id: 4, tipo: "entrada", categoria: "Oferta", descricao: "Oferta especial missões", valor: 5800, data: "2024-02-08" },
  { id: 5, tipo: "saida", categoria: "Manutenção", descricao: "Reparo do ar condicionado", valor: 1200, data: "2024-02-10" },
  { id: 6, tipo: "saida", categoria: "Utilidades", descricao: "Conta de energia", valor: 850, data: "2024-02-12" },
  { id: 7, tipo: "entrada", categoria: "Dízimo", descricao: "Dízimos extra", valor: 12000, data: "2024-02-15" },
  { id: 8, tipo: "saida", categoria: "Eventos", descricao: "Decoração conferência", valor: 2300, data: "2024-02-18" },
];

export const celulas = [];

export const eventos = [
  { id: 1, titulo: "Culto de Celebração", data: "2024-02-04", horario: "19:00", local: "Templo Principal" },
  { id: 2, titulo: "Reunião de Oração", data: "2024-02-06", horario: "06:00", local: "Sala de Oração" },
  { id: 3, titulo: "Ensaio do Louvor", data: "2024-02-08", horario: "19:30", local: "Auditório" },
  { id: 4, titulo: "EBD - Escola Bíblica", data: "2024-02-11", horario: "09:00", local: "Salas de Aula" },
  { id: 5, titulo: "Conferência de Jovens", data: "2024-02-15", horario: "19:00", local: "Templo Principal" },
  { id: 6, titulo: "Batismo", data: "2024-02-18", horario: "10:00", local: "Batistério" },
  { id: 7, titulo: "Santa Ceia", data: "2024-02-25", horario: "19:00", local: "Templo Principal" },
];

export const escalasLouvor = [
  {
    data: "04/02",
    diaSemana: "Domingo",
    equipe: [
      { nome: "Carlos Eduardo", funcao: "Guitarra", avatar: "CE" },
      { nome: "Mariana Costa", funcao: "Vocal", avatar: "MC" },
      { nome: "Felipe Santos", funcao: "Teclado", avatar: "FS" },
      { nome: "Juliana Lima", funcao: "Baixo", avatar: "JL" },
      { nome: "Bruno Alves", funcao: "Bateria", avatar: "BA" },
    ],
  },
  {
    data: "11/02",
    diaSemana: "Domingo",
    equipe: [
      { nome: "Amanda Rocha", funcao: "Vocal", avatar: "AR" },
      { nome: "Thiago Mendes", funcao: "Guitarra", avatar: "TM" },
      { nome: "Priscila Souza", funcao: "Teclado", avatar: "PS" },
      { nome: "Daniel Ferreira", funcao: "Baixo", avatar: "DF" },
      { nome: "Rafael Gomes", funcao: "Bateria", avatar: "RG" },
    ],
  },
];

export const escalasInfantil = [
  {
    data: "04/02",
    diaSemana: "Domingo",
    equipe: [
      { nome: "Patricia Nunes", funcao: "Coordenadora", avatar: "PN" },
      { nome: "Lucia Martins", funcao: "Auxiliar", avatar: "LM" },
      { nome: "Sandra Oliveira", funcao: "Berçário", avatar: "SO" },
    ],
  },
  {
    data: "11/02",
    diaSemana: "Domingo",
    equipe: [
      { nome: "Renata Campos", funcao: "Coordenadora", avatar: "RC" },
      { nome: "Camila Dias", funcao: "Auxiliar", avatar: "CD" },
      { nome: "Beatriz Lopes", funcao: "Berçário", avatar: "BL" },
    ],
  },
];

export const escalasRecepcao = [
  {
    data: "04/02",
    diaSemana: "Domingo",
    equipe: [
      { nome: "Roberto Vieira", funcao: "Líder", avatar: "RV" },
      { nome: "Marcos Paulo", funcao: "Entrada", avatar: "MP" },
      { nome: "Adriana Costa", funcao: "Informações", avatar: "AC" },
    ],
  },
  {
    data: "11/02",
    diaSemana: "Domingo",
    equipe: [
      { nome: "Guilherme Alves", funcao: "Líder", avatar: "GA" },
      { nome: "Tatiana Reis", funcao: "Entrada", avatar: "TR" },
      { nome: "Eduardo Neves", funcao: "Informações", avatar: "EN" },
    ],
  },
];

export const cursos = [
  { id: 1, nome: "Curso de Batismo", turma: "Turma A", aulasTotal: 12, aulasConcluidas: 8, alunos: 24, professor: "Pr. Carlos" },
  { id: 2, nome: "Discipulado Básico", turma: "Turma B", aulasTotal: 16, aulasConcluidas: 16, alunos: 18, professor: "Dc. Maria" },
  { id: 3, nome: "Liderança Cristã", turma: "Turma Única", aulasTotal: 8, aulasConcluidas: 3, alunos: 32, professor: "Pr. João" },
  { id: 4, nome: "Escola Bíblica Dominical", turma: "Adultos", aulasTotal: 52, aulasConcluidas: 6, alunos: 85, professor: "Vários" },
  { id: 5, nome: "Casais", turma: "Turma 2024", aulasTotal: 10, aulasConcluidas: 4, alunos: 28, professor: "Pr. Pedro e Esposa" },
];

export const configuracoesIgreja = {
  nome: "IPR Jaguarema",
  endereco: "Rua das Flores, 123 - Centro",
  cidade: "São Paulo - SP",
  telefone: "(11) 3333-4444",
  email: "contato@igrejacentral.com.br",
  cnpj: "12.345.678/0001-90",
};

export const usuarios = [
  { id: 1, nome: "Pastor Carlos Silva", email: "pastor@igreja.com", papel: "Administrador", status: "Ativo" },
  { id: 2, nome: "Maria Secretária", email: "secretaria@igreja.com", papel: "Secretaria", status: "Ativo" },
  { id: 3, nome: "João Tesoureiro", email: "tesoureiro@igreja.com", papel: "Financeiro", status: "Ativo" },
  { id: 4, nome: "Ana Líder", email: "ana@igreja.com", papel: "Líder de Célula", status: "Inativo" },
];
