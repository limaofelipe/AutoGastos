import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar, 
  Fuel, 
  Wrench, 
  Car, 
  ArrowUpDown, 
  Plus, 
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { Expense, Vehicle, ExpenseCategory } from '../types';
import { CATEGORIES, MONTH_NAMES } from '../constants/categories';

interface ExpenseListProps {
  expenses: Expense[];
  vehicles: Vehicle[];
  selectedVehicleId: string;
  selectedYear: number;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onOpenExpenseModal: () => void;
  initialCategoryFilter?: ExpenseCategory | null;
  initialMonthFilter?: number | null;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  vehicles,
  selectedVehicleId,
  selectedYear,
  onEditExpense,
  onDeleteExpense,
  onOpenExpenseModal,
  initialCategoryFilter,
  initialMonthFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter || 'all');
  const [monthFilter, setMonthFilter] = useState<string>(
    initialMonthFilter !== null && initialMonthFilter !== undefined ? String(initialMonthFilter) : 'all'
  );
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Vehicle filter
      if (selectedVehicleId !== 'all' && e.vehicleId !== selectedVehicleId) {
        return false;
      }
      // Year filter
      if (e.year !== selectedYear) {
        return false;
      }
      // Month filter
      if (monthFilter !== 'all' && e.month !== parseInt(monthFilter, 10)) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && e.category !== categoryFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(query);
        const matchLocation = e.location?.toLowerCase().includes(query);
        const matchNotes = e.notes?.toLowerCase().includes(query);
        const matchCat = CATEGORIES[e.category]?.label.toLowerCase().includes(query);
        if (!matchTitle && !matchLocation && !matchNotes && !matchCat) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount-desc') {
        return (b.amount || 0) - (a.amount || 0);
      }
      if (sortBy === 'amount-asc') {
        return (a.amount || 0) - (b.amount || 0);
      }
      return 0;
    });
  }, [expenses, selectedVehicleId, selectedYear, monthFilter, categoryFilter, searchTerm, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [filteredExpenses]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de gasto?')) {
      try {
        setDeletingId(id);
        await onDeleteExpense(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, oficina, posto ou peça..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Month Filter */}
          <div className="w-full md:w-auto">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              aria-label="Filtrar por mês"
              className="w-full md:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Todos os Meses</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filtrar por categoria"
              className="w-full md:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {Object.values(CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Ordenar lançamentos"
              className="w-full md:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="date-desc">Mais Recentes</option>
              <option value="date-asc">Mais Antigos</option>
              <option value="amount-desc">Maior Valor</option>
              <option value="amount-asc">Menor Valor</option>
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={onOpenExpenseModal}
            className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar Gasto</span>
          </button>
        </div>

        {/* Filter Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div>
            Mostrando <strong>{filteredExpenses.length}</strong> lançamentos no ano <strong>{selectedYear}</strong>
            {monthFilter !== 'all' && (
              <span> em <strong>{MONTH_NAMES[parseInt(monthFilter, 10) - 1]}</strong></span>
            )}
            {categoryFilter !== 'all' && (
              <span> na categoria <strong>{CATEGORIES[categoryFilter as ExpenseCategory]?.label}</strong></span>
            )}
          </div>
          <div className="font-bold text-slate-200">
            Total filtrado: <span className="text-amber-400">{formatCurrency(totalFilteredAmount)}</span>
          </div>
        </div>
      </div>

      {/* Expenses List Cards */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          <Car className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h4 className="text-base font-semibold text-white mb-1">Nenhum gasto encontrado</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Não foram localizadas despesas com os filtros selecionados para o ano de {selectedYear}.
          </p>
          <button
            onClick={onOpenExpenseModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Gasto
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp) => {
            const cat = CATEGORIES[exp.category] || CATEGORIES.outros;
            const vehicle = exp.vehicleId ? vehicleMap.get(exp.vehicleId) : null;
            const dateFormatted = new Date(exp.date + 'T12:00:00Z').toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div
                key={exp.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-md group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${cat.badgeColor}`}>
                      {cat.label}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {dateFormatted}
                    </span>
                    {vehicle && (
                      <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Car className="w-3 h-3 text-slate-400" />
                        {vehicle.name} {vehicle.plate ? `(${vehicle.plate})` : ''}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                    {exp.title}
                  </h4>

                  {/* Sub-details: fuel, odometer, location, notes */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    {exp.category === 'gasolina' && exp.liters && (
                      <span className="text-amber-300/90 font-medium">
                        ⛽ {exp.liters} L {exp.pricePerLiter ? `(R$ ${exp.pricePerLiter.toFixed(2)}/L)` : ''}
                      </span>
                    )}
                    {exp.odometerKm && (
                      <span className="text-slate-300">
                        🚗 {exp.odometerKm.toLocaleString('pt-BR')} km
                      </span>
                    )}
                    {exp.location && (
                      <span className="text-slate-400 truncate max-w-xs">
                        📍 {exp.location}
                      </span>
                    )}
                    {exp.paymentMethod && (
                      <span className="text-slate-400 uppercase text-[10px] font-semibold bg-slate-800/80 px-1.5 py-0.5 rounded">
                        {exp.paymentMethod.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {exp.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 mt-1">
                      {exp.notes}
                    </p>
                  )}
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-extrabold text-white block">
                      {formatCurrency(exp.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Editar gasto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                      title="Excluir gasto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
