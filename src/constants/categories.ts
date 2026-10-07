import { CategoryInfo, ExpenseCategory } from '../types';

export const CATEGORIES: Record<ExpenseCategory, CategoryInfo> = {
  gasolina: {
    id: 'gasolina',
    label: 'Combustível / Gasolina',
    iconName: 'Fuel',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    badgeColor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    description: 'Abastecimento com gasolina, etanol, diesel ou GNV'
  },
  mecanico: {
    id: 'mecanico',
    label: 'Mecânico & Serviços',
    iconName: 'Wrench',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    badgeColor: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    description: 'Mão de obra da oficina, troca de peças, motor e câmbio'
  },
  reparo: {
    id: 'reparo',
    label: 'Reparo & Funilaria',
    iconName: 'Hammer',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/20 text-red-400',
    badgeColor: 'bg-red-500/15 text-red-400 border border-red-500/30',
    description: 'Consertos emergenciais, batidas, pintura, martelinho e vidros'
  },
  revisao: {
    id: 'revisao',
    label: 'Revisão & Preventiva',
    iconName: 'ClipboardCheck',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    description: 'Troca de óleo, filtros, fluidos e checagens periódicas'
  },
  pneus: {
    id: 'pneus',
    label: 'Pneus & Geometria',
    iconName: 'Disc',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    badgeColor: 'bg-teal-500/15 text-teal-400 border border-teal-500/30',
    description: 'Troca de pneus, alinhamento, balanceamento e cambagem'
  },
  ipva_taxas: {
    id: 'ipva_taxas',
    label: 'IPVA, Licenciamento & Taxas',
    iconName: 'Receipt',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    badgeColor: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    description: 'Tributos anuais, emplacamento e despachante'
  },
  seguro: {
    id: 'seguro',
    label: 'Seguro & Proteção',
    iconName: 'ShieldCheck',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    description: 'Apólice de seguro auto, proteção veicular e rastreador'
  },
  lavagem: {
    id: 'lavagem',
    label: 'Lavagem & Estética',
    iconName: 'Sparkles',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    description: 'Ducha, higienização interna, polimento e cristalização'
  },
  estacionamento: {
    id: 'estacionamento',
    label: 'Estacionamento & Pedágio',
    iconName: 'ParkingSquare',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    badgeColor: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    description: 'Mensalista, valets, rotativo e tarifas de pedágio'
  },
  multas: {
    id: 'multas',
    label: 'Multas de Trânsito',
    iconName: 'AlertTriangle',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    badgeColor: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    description: 'Infrações e autuações municipais/estaduais'
  },
  acessorios: {
    id: 'acessorios',
    label: 'Acessórios & Upgrades',
    iconName: 'Car',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    badgeColor: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
    description: 'Insulfilm, som, multimídia, tapetes, lâmpadas LED'
  },
  outros: {
    id: 'outros',
    label: 'Outras Despesas',
    iconName: 'Coins',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
    badgeColor: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
    description: 'Despesas diversas não classificadas acima'
  }
};

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

export const MONTH_SHORT_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez'
];
