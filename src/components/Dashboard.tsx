import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Fuel, 
  Wrench, 
  Hammer, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Filter, 
  Download, 
  Plus, 
  ChevronRight, 
  Car, 
  Sparkles,
  Info,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Expense, Vehicle, ExpenseCategory } from '../types';
import { CATEGORIES, MONTH_NAMES, MONTH_SHORT_NAMES } from '../constants/categories';
import { FuelAutonomyWidget } from './FuelAutonomyWidget';

interface DashboardProps {
  expenses: Expense[];
  vehicles: Vehicle[];
  selectedVehicleId: string;
  selectedYear: number;
  onChangeYear: (year: number) => void;
  onOpenExpenseModal: () => void;
  onOpenFuelExpenseModal?: () => void;
  onSelectCategoryFilter?: (cat: ExpenseCategory | null) => void;
  onSelectMonthFilter?: (month: number | null) => void;
  onNavigateToHistory: () => void;
  onOpenExportModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  vehicles,
  selectedVehicleId,
  selectedYear,
  onChangeYear,
  onOpenExpenseModal,
  onOpenFuelExpenseModal,
  onSelectCategoryFilter,
  onSelectMonthFilter,
  onNavigateToHistory,
  onOpenExportModal,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Available years from expenses + current year
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    const currentCalendarYear = new Date().getFullYear();
    yearsSet.add(currentCalendarYear);
    yearsSet.add(currentCalendarYear - 1);
    expenses.forEach((e) => {
      if (e.year) yearsSet.add(e.year);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [expenses]);

  // Filter expenses by selected vehicle and year
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchVehicle = selectedVehicleId === 'all' || e.vehicleId === selectedVehicleId;
      const matchYear = e.year === selectedYear;
      const matchMonth = selectedMonth === null || e.month === selectedMonth;
      return matchVehicle && matchYear && matchMonth;
    });
  }, [expenses, selectedVehicleId, selectedYear, selectedMonth]);

  // Expenses for the entire selected year (ignoring single month filter) for the 12-month evolution
  const fullYearExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchVehicle = selectedVehicleId === 'all' || e.vehicleId === selectedVehicleId;
      const matchYear = e.year === selectedYear;
      return matchVehicle && matchYear;
    });
  }, [expenses, selectedVehicleId, selectedYear]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const fullYearTotal = fullYearExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    // Monthly totals for the 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const monthExpenses = fullYearExpenses.filter((e) => e.month === monthNum);
      const total = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const fuel = monthExpenses
        .filter((e) => e.category === 'gasolina')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const mechanic = monthExpenses
        .filter((e) => e.category === 'mecanico' || e.category === 'revisao')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const repair = monthExpenses
        .filter((e) => e.category === 'reparo' || e.category === 'pneus')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const other = total - fuel - mechanic - repair;

      return {
        month: monthNum,
        name: MONTH_NAMES[i],
        shortName: MONTH_SHORT_NAMES[i],
        total,
        fuel,
        mechanic,
        repair,
        other,
        count: monthExpenses.length,
      };
    });

    // Max month value for scaling charts
    const maxMonthlyTotal = Math.max(...monthlyData.map((m) => m.total), 1);

    // Category breakdown
    const categoryTotals: Record<string, { total: number; count: number }> = {};
    filteredExpenses.forEach((e) => {
      if (!categoryTotals[e.category]) {
        categoryTotals[e.category] = { total: 0, count: 0 };
      }
      categoryTotals[e.category].total += e.amount || 0;
      categoryTotals[e.category].count += 1;
    });

    const sortedCategories = Object.entries(categoryTotals)
      .map(([catKey, data]) => ({
        category: catKey as ExpenseCategory,
        total: data.total,
        count: data.count,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Fuel specifics
    const fuelExpenses = filteredExpenses.filter((e) => e.category === 'gasolina');
    const totalFuelAmount = fuelExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalLiters = fuelExpenses.reduce((sum, e) => sum + (e.liters || 0), 0);
    const avgPricePerLiter = totalLiters > 0 ? totalFuelAmount / totalLiters : 0;

    // Maintenance specifics (mecanico + reparo + revisao + pneus)
    const maintenanceExpenses = filteredExpenses.filter((e) =>
      ['mecanico', 'reparo', 'revisao', 'pneus'].includes(e.category)
    );
    const totalMaintenance = maintenanceExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Taxes & recurring (ipva_taxas, seguro)
    const taxesExpenses = filteredExpenses.filter((e) => ['ipva_taxas', 'seguro'].includes(e.category));
    const totalTaxes = taxesExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Average per month
    const activeMonthsCount = monthlyData.filter((m) => m.total > 0).length || 1;
    const monthlyAverage = fullYearTotal / (selectedMonth !== null ? 1 : Math.max(activeMonthsCount, 1));

    // Highest expense month
    const peakMonth = [...monthlyData].sort((a, b) => b.total - a.total)[0];

    return {
      totalAmount,
      fullYearTotal,
      monthlyAverage,
      monthlyData,
      maxMonthlyTotal,
      sortedCategories,
      totalFuelAmount,
      totalLiters,
      avgPricePerLiter,
      totalMaintenance,
      totalTaxes,
      peakMonth,
      expenseCount: filteredExpenses.length,
    };
  }, [filteredExpenses, fullYearExpenses, selectedMonth]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleMonthClick = (monthNum: number) => {
    if (selectedMonth === monthNum) {
      setSelectedMonth(null);
      if (onSelectMonthFilter) onSelectMonthFilter(null);
    } else {
      setSelectedMonth(monthNum);
      if (onSelectMonthFilter) onSelectMonthFilter(monthNum);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Filter Bar: Year & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Ano Selecionado</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <select
              value={selectedYear}
              onChange={(e) => onChangeYear(Number(e.target.value))}
              aria-label="Filtrar por ano"
              className="bg-slate-950 text-white font-bold text-lg px-3 py-1.5 rounded-xl border border-slate-700 hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Ano {yr}
                </option>
              ))}
            </select>
            {selectedMonth !== null && (
              <span className="text-sm font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                <span>{MONTH_NAMES[selectedMonth - 1]}</span>
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="hover:text-amber-200 text-xs font-black cursor-pointer"
                  title="Ver ano todo"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Exportar dados ou relatório"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar Relatório</span>
          </button>
          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar Gasto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Year / Filtered */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{selectedMonth ? `Total em ${MONTH_NAMES[selectedMonth - 1]}` : `Total Gasto em ${selectedYear}`}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(stats.totalAmount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{stats.expenseCount} lançamentos</span>
            {selectedMonth === null && (
              <span className="text-amber-400 font-medium">
                Média: {formatCurrency(stats.monthlyAverage)}/mês
              </span>
            )}
          </div>
        </div>

        {/* Fuel Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Combustível / Gasolina</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
              {formatCurrency(stats.totalFuelAmount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>
              {stats.totalLiters > 0 ? `${stats.totalLiters.toFixed(1)} L abastecidos` : 'Combustível'}
            </span>
            {stats.avgPricePerLiter > 0 && (
              <span className="text-slate-300 font-medium">
                ~R$ {stats.avgPricePerLiter.toFixed(2)}/L
              </span>
            )}
          </div>
        </div>

        {/* Mechanics & Maintenance Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Mecânica & Manutenções</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 tracking-tight">
              {formatCurrency(stats.totalMaintenance)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Serviços & revisões</span>
            <span className="text-slate-300 font-medium">
              {stats.totalAmount > 0
                ? `${((stats.totalMaintenance / stats.totalAmount) * 100).toFixed(0)}% do total`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Taxes, Insurance & Fixed */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>IPVA, Taxas & Seguro</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 tracking-tight">
              {formatCurrency(stats.totalTaxes)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Tributos anuais & apólices</span>
            <span className="text-slate-300 font-medium">
              {stats.totalAmount > 0
                ? `${((stats.totalTaxes / stats.totalAmount) * 100).toFixed(0)}% do total`
                : '0%'}
            </span>
          </div>
        </div>

      </div>

      {/* Fuel Autonomy Widget (KM/L) */}
      <FuelAutonomyWidget
        expenses={expenses}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        selectedYear={selectedYear}
        onOpenFuelExpenseModal={onOpenFuelExpenseModal || onOpenExpenseModal}
      />

      {/* 12-Month Evolution Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Evolução dos Gastos Mês a Mês ({selectedYear})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Clique em qualquer mês para filtrar os detalhes ou ver o resumo anual completo.
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center flex-wrap gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span>Gasolina</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500"></span>
              <span>Mecânica/Revisão</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500"></span>
              <span>Reparo/Pneus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-600"></span>
              <span>Outros/Taxas</span>
            </div>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="pt-8">
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-3 items-end h-56 px-1">
            {stats.monthlyData.map((m) => {
              const isSelected = selectedMonth === m.month;
              const hasData = m.total > 0;
              const heightPercent = hasData
                ? Math.max(Math.round((m.total / stats.maxMonthlyTotal) * 100), 8)
                : 4;

              // Proportions for stacked segments
              const fuelPct = m.total > 0 ? (m.fuel / m.total) * 100 : 0;
              const mechPct = m.total > 0 ? (m.mechanic / m.total) * 100 : 0;
              const repPct = m.total > 0 ? (m.repair / m.total) * 100 : 0;
              const otherPct = m.total > 0 ? (m.other / m.total) * 100 : 0;

              return (
                <div
                  key={m.month}
                  onClick={() => handleMonthClick(m.month)}
                  className={`group flex flex-col items-center justify-end h-full cursor-pointer transition-transform ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-44 bg-slate-950 text-white border border-slate-700 text-[11px] p-2 rounded-lg shadow-xl pointer-events-none z-20 whitespace-nowrap">
                    <p className="font-bold text-amber-400">{m.name}</p>
                    <p className="text-white font-semibold">{formatCurrency(m.total)}</p>
                    {m.fuel > 0 && <p className="text-slate-300">⛽ Combustível: {formatCurrency(m.fuel)}</p>}
                    {m.mechanic > 0 && <p className="text-slate-300">🔧 Mecânica: {formatCurrency(m.mechanic)}</p>}
                    {m.repair > 0 && <p className="text-slate-300">🔨 Reparo: {formatCurrency(m.repair)}</p>}
                    <p className="text-slate-400 text-[10px] mt-1">Clique para filtrar</p>
                  </div>

                  {/* Value on top of bar */}
                  <div className="mb-1.5 text-[10px] font-semibold text-slate-400 group-hover:text-amber-300 transition-colors truncate">
                    {hasData ? (
                      m.total >= 1000 ? `${(m.total / 1000).toFixed(1)}k` : Math.round(m.total)
                    ) : (
                      ''
                    )}
                  </div>

                  {/* Stacked Bar Container */}
                  <div
                    className={`w-full rounded-lg overflow-hidden flex flex-col-reverse transition-all relative ${
                      isSelected
                        ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20'
                        : hasData
                        ? 'hover:brightness-110'
                        : 'bg-slate-800/40'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {hasData ? (
                      <>
                        <div style={{ height: `${fuelPct}%` }} className="bg-amber-500 w-full" />
                        <div style={{ height: `${mechPct}%` }} className="bg-blue-500 w-full" />
                        <div style={{ height: `${repPct}%` }} className="bg-red-500 w-full" />
                        <div style={{ height: `${otherPct}%` }} className="bg-slate-600 w-full" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-slate-800/40 rounded" />
                    )}
                  </div>

                  {/* Month Label */}
                  <div
                    className={`mt-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isSelected
                        ? 'text-amber-400 font-bold'
                        : hasData
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {m.shortName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Month Indicator & Clear Filter */}
        {selectedMonth !== null && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Exibindo somente gastos de <strong className="text-amber-400">{MONTH_NAMES[selectedMonth - 1]} de {selectedYear}</strong>.
            </span>
            <button
              onClick={() => setSelectedMonth(null)}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Ver todos os 12 meses do ano
            </button>
          </div>
        )}
      </div>

      {/* Grid: Category Breakdown & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Categories Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Gastos por Categoria</h3>
              <p className="text-xs text-slate-400">Distribuição percentual do orçamento veicular</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
              {stats.sortedCategories.length} categorias com gastos
            </span>
          </div>

          {stats.sortedCategories.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Car className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              Nenhum gasto registrado para o período selecionado.
            </div>
          ) : (
            <div className="space-y-3.5">
              {stats.sortedCategories.map((item) => {
                const catInfo = CATEGORIES[item.category] || CATEGORIES.outros;
                return (
                  <div
                    key={item.category}
                    onClick={() => {
                      if (onSelectCategoryFilter) {
                        onSelectCategoryFilter(item.category);
                        onNavigateToHistory();
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${catInfo.badgeColor}`}>
                          {catInfo.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {item.count} {item.count === 1 ? 'lançamento' : 'lançamentos'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          {formatCurrency(item.total)}
                        </span>
                        <span className="text-xs text-slate-400 ml-2 font-medium">
                          ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fast Insights & Recent List */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Últimos Registros
              </h3>
              <button
                onClick={onNavigateToHistory}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Ver todos
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhum lançamento no período.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.slice(0, 5).map((exp) => {
                  const catInfo = CATEGORIES[exp.category] || CATEGORIES.outros;
                  return (
                    <div
                      key={exp.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {exp.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${catInfo.badgeColor}`}>
                            {catInfo.label.split('/')[0]}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(exp.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {formatCurrency(exp.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Summary Tip */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 mt-4">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dica Financeira</span>
            </div>
            {stats.peakMonth && stats.peakMonth.total > 0 ? (
              <p>
                O mês de maior custo em {selectedYear} foi <strong>{stats.peakMonth.name}</strong> ({formatCurrency(stats.peakMonth.total)}).
                Manter manutenções preventivas em dia reduz reparos emergenciais em até 40%.
              </p>
            ) : (
              <p>
                Adicione suas notas fiscais de abastecimento e serviços mecânicos para gerar histórico e valorizar o seu carro em uma futura revenda!
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
