import React, { useState, useMemo } from 'react';
import { 
  Gauge, 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Calendar, 
  Sparkles, 
  Car, 
  Route, 
  HelpCircle 
} from 'lucide-react';
import { Expense, Vehicle } from '../types';

interface FuelAutonomyWidgetProps {
  expenses: Expense[];
  vehicles: Vehicle[];
  selectedVehicleId: string;
  selectedYear: number;
  onOpenFuelExpenseModal: () => void;
}

interface FuelInterval {
  id: string;
  date: string;
  title: string;
  location?: string;
  odometerKm: number;
  prevOdometerKm: number;
  deltaKm: number;
  liters: number;
  amount: number;
  kml: number;
  costPerKm: number;
  pricePerLiter?: number;
}

export const FuelAutonomyWidget: React.FC<FuelAutonomyWidgetProps> = ({
  expenses,
  vehicles,
  selectedVehicleId,
  selectedYear,
  onOpenFuelExpenseModal,
}) => {
  const [scope, setScope] = useState<'year' | 'all'>('year');
  const [showHistory, setShowHistory] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Determine which vehicle to focus on if 'all' is selected
  const activeVehicle = useMemo(() => {
    if (selectedVehicleId !== 'all') {
      return vehicles.find((v) => v.id === selectedVehicleId) || null;
    }
    return vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  // Extract fuel expenses with valid odometer & liters
  const autonomyData = useMemo(() => {
    // Filter to fuel category with valid numbers
    const validFuel = expenses.filter((e) => {
      const isFuel = e.category === 'gasolina';
      const hasOdometer = typeof e.odometerKm === 'number' && e.odometerKm > 0;
      const hasLiters = typeof e.liters === 'number' && e.liters > 0;
      
      // Match vehicle
      const targetVehicleId = selectedVehicleId !== 'all' ? selectedVehicleId : activeVehicle?.id;
      const matchVehicle = targetVehicleId ? e.vehicleId === targetVehicleId : true;

      // Match year if scope is year
      const matchScope = scope === 'all' || e.year === selectedYear;

      return isFuel && hasOdometer && hasLiters && matchVehicle && matchScope;
    });

    // Sort chronologically ascending
    const sorted = [...validFuel].sort((a, b) => {
      const timeDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      return (a.odometerKm || 0) - (b.odometerKm || 0);
    });

    const intervals: FuelInterval[] = [];
    let totalDeltaKm = 0;
    let totalConsumedLiters = 0;
    let totalFuelSpend = 0;

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      const prevKm = prev.odometerKm!;
      const currKm = curr.odometerKm!;
      const deltaKm = currKm - prevKm;
      const liters = curr.liters!;

      // Realistic interval check: positive delta, realistic autonomy range (between 3 km/l and 40 km/l)
      if (deltaKm > 0 && liters > 0) {
        const kml = deltaKm / liters;
        const costPerKm = curr.amount > 0 ? curr.amount / deltaKm : 0;

        intervals.push({
          id: curr.id,
          date: curr.date,
          title: curr.title,
          location: curr.location,
          odometerKm: currKm,
          prevOdometerKm: prevKm,
          deltaKm,
          liters,
          amount: curr.amount,
          kml,
          costPerKm,
          pricePerLiter: curr.pricePerLiter || (liters > 0 ? curr.amount / liters : undefined),
        });

        totalDeltaKm += deltaKm;
        totalConsumedLiters += liters;
        totalFuelSpend += curr.amount;
      }
    }

    const avgKmL = totalConsumedLiters > 0 ? totalDeltaKm / totalConsumedLiters : 0;
    const avgCostPerKm = totalDeltaKm > 0 ? totalFuelSpend / totalDeltaKm : 0;
    const lastInterval = intervals.length > 0 ? intervals[intervals.length - 1] : null;

    let bestKmL = 0;
    let worstKmL = Infinity;

    intervals.forEach((item) => {
      if (item.kml > bestKmL) bestKmL = item.kml;
      if (item.kml < worstKmL) worstKmL = item.kml;
    });

    if (worstKmL === Infinity) worstKmL = 0;

    return {
      rawCount: sorted.length,
      firstEntry: sorted[0] || null,
      latestEntry: sorted[sorted.length - 1] || null,
      intervals,
      totalDeltaKm,
      totalConsumedLiters,
      totalFuelSpend,
      avgKmL,
      avgCostPerKm,
      lastInterval,
      bestKmL,
      worstKmL,
    };
  }, [expenses, selectedVehicleId, activeVehicle, scope, selectedYear]);

  // Rating badge based on average KM/L
  const getEfficiencyRating = (kml: number) => {
    if (kml >= 14) {
      return {
        label: 'Excelente Autonomia',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        colorClass: 'text-emerald-400',
        description: 'Seu veículo está operando com rendimento muito econômico!',
      };
    }
    if (kml >= 11) {
      return {
        label: 'Bom Consumo',
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        colorClass: 'text-amber-400',
        description: 'Consumo dentro do padrão de eficiência urbana e mista.',
      };
    }
    if (kml >= 8) {
      return {
        label: 'Consumo Moderado',
        badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        colorClass: 'text-blue-400',
        description: 'Típico de trajetos urbanos pesados ou trânsito intenso.',
      };
    }
    return {
      label: 'Consumo Elevado',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      colorClass: 'text-rose-400',
      description: 'Verifique pressão dos pneus, velas e filtro de ar para melhorar o consumo.',
    };
  };

  const rating = getEfficiencyRating(autonomyData.avgKmL);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl overflow-hidden transition-all">
      
      {/* Widget Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Autonomia & Consumo Médio (KM/L)
              </h3>
              <button
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="Como é feito o cálculo?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeVehicle
                ? `Calculado para ${activeVehicle.name} ${activeVehicle.plate ? `(${activeVehicle.plate})` : ''}`
                : 'Cálculo entre abastecimentos consecutivos com odômetro e litros'}
            </p>
          </div>
        </div>

        {/* Scope and Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Scope Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setScope('year')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                scope === 'year'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ano {selectedYear}
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Histórico Total
            </button>
          </div>

          <button
            onClick={onOpenFuelExpenseModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Abastecer</span>
          </button>
        </div>
      </div>

      {/* Explanatory "How it works" banner if toggled */}
      {showHowItWorks && (
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Como a Autonomia (KM/L) é calculada com precisão:
            </span>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">
            A cada abastecimento registrado, o sistema calcula a diferença entre o odômetro atual e o odômetro anterior (<strong>Δ KM</strong>). Em seguida, divide a distância percorrida pela quantidade de litros colocados no tanque:
          </p>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300">
            Fórmula: KM/L = (Odômetro Atual - Odômetro Anterior) ÷ Litros Abastecidos
          </div>
          <p className="text-[11px] text-slate-400">
            💡 Dica: Para obter o cálculo exato, abasteça até o automático ("tanque cheio") e anote a quilometragem do painel no app.
          </p>
        </div>
      )}

      {/* Case 1: Less than 2 fuel fill-ups registered */}
      {autonomyData.intervals.length === 0 ? (
        <div className="p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Fuel className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-base font-bold text-white">
              {autonomyData.rawCount === 1
                ? 'Primeiro abastecimento registrado! Falta apenas 1.'
                : 'Aguardando abastecimentos com KM e Litros'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {autonomyData.rawCount === 1 ? (
                <>
                  Você já cadastrou 1 abastecimento aos{' '}
                  <strong className="text-amber-400">
                    {autonomyData.firstEntry?.odometerKm?.toLocaleString('pt-BR')} km
                  </strong>{' '}
                  com{' '}
                  <strong className="text-amber-400">
                    {autonomyData.firstEntry?.liters} litros
                  </strong>
                  . Quando fizer o próximo abastecimento, preencha o novo KM e os litros para calcular a autonomia média exata!
                </>
              ) : (
                'Cadastre seus abastecimentos preenchendo a quilometragem (KM do odômetro) e a quantidade de litros para calcular a autonomia média do veículo (KM/L) e custo por km.'
              )}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenFuelExpenseModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{autonomyData.rawCount === 1 ? 'Registrar 2º Abastecimento' : 'Cadastrar Abastecimento'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Case 2: We have 1 or more calculated intervals */
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Hero Numbers & Rating */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Primary KM/L Big Gauge Display */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Média Geral Calculada
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${rating.badgeClass}`}>
                  {rating.label}
                </span>
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span className={`text-4xl sm:text-5xl font-black tracking-tight ${rating.colorClass}`}>
                  {autonomyData.avgKmL.toFixed(1)}
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-400">
                  KM / L
                </span>
              </div>

              <p className="text-xs text-slate-300">
                {rating.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>{autonomyData.intervals.length} abastecimentos comparados</span>
                <span className="text-amber-400 font-semibold">
                  {autonomyData.totalDeltaKm.toLocaleString('pt-BR')} km monitorados
                </span>
              </div>
            </div>

            {/* 4 Secondary Quick Metric Cards */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Cost per KM */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Custo por KM</span>
                <div className="my-1">
                  <span className="text-lg font-bold text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(autonomyData.avgCostPerKm)}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">por km rodado</span>
                </div>
                <span className="text-[10px] text-slate-500">Gasto combustível</span>
              </div>

              {/* Last Fill-up */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Último Tanque</span>
                <div className="my-1">
                  <span className="text-lg font-bold text-amber-400">
                    {autonomyData.lastInterval ? autonomyData.lastInterval.kml.toFixed(1) : '--'}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">km / l</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {autonomyData.lastInterval
                    ? `${autonomyData.lastInterval.deltaKm} km rodados`
                    : '--'}
                </span>
              </div>

              {/* Record / Best */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Melhor Consumo</span>
                <div className="my-1">
                  <span className="text-lg font-bold text-emerald-400">
                    {autonomyData.bestKmL.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">km / l</span>
                </div>
                <span className="text-[10px] text-emerald-500/80">Recorde de economia</span>
              </div>

              {/* Total Liters */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Total Litros</span>
                <div className="my-1">
                  <span className="text-lg font-bold text-cyan-400">
                    {autonomyData.totalConsumedLiters.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">litros</span>
                </div>
                <span className="text-[10px] text-slate-500">Consumidos no cálculo</span>
              </div>

            </div>

          </div>

          {/* Sparkline / Evolution Bars of recent fuel intervals */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-amber-400" />
                Histórico de Eficiência por Abastecimento (KM/L)
              </span>
              <span className="text-slate-400 text-[11px]">
                Linha de referência média: <strong className="text-amber-400">{autonomyData.avgKmL.toFixed(1)} km/l</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 items-end pt-2">
              {autonomyData.intervals.map((inv, idx) => {
                const heightPct = Math.min(Math.max((inv.kml / 20) * 100, 20), 100);
                const isAboveAvg = inv.kml >= autonomyData.avgKmL;

                return (
                  <div
                    key={inv.id}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition-all flex flex-col justify-between group"
                    title={`${new Date(inv.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}: ${inv.kml.toFixed(1)} KM/L (${inv.deltaKm} km com ${inv.liters} L)`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>#{idx + 1}</span>
                      <span className="text-[9px]">
                        {new Date(inv.date + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>

                    <div className="my-1.5 flex items-baseline justify-between">
                      <span className={`text-sm font-bold ${isAboveAvg ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {inv.kml.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400">km/l</span>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      {inv.deltaKm} km rodados
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toggle Table Details */}
          <div className="pt-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{showHistory ? 'Ocultar Tabela de Abastecimentos' : 'Ver Detalhes de Cada Abastecimento'}</span>
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showHistory && (
              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800 animate-in fade-in duration-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Data</th>
                      <th className="py-2.5 px-3 font-semibold">Odômetro</th>
                      <th className="py-2.5 px-3 font-semibold">Δ KM Rodados</th>
                      <th className="py-2.5 px-3 font-semibold">Litros</th>
                      <th className="py-2.5 px-3 font-semibold">Autonomia (KM/L)</th>
                      <th className="py-2.5 px-3 font-semibold">Custo / KM</th>
                      <th className="py-2.5 px-3 font-semibold">Preço/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    {autonomyData.intervals.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-200 font-medium">
                          {new Date(inv.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-mono">
                          {inv.odometerKm.toLocaleString('pt-BR')} km
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-semibold">
                          +{inv.deltaKm} km
                        </td>
                        <td className="py-2.5 px-3 text-cyan-400 font-medium">
                          {inv.liters} L
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-400">
                          {inv.kml.toFixed(2)} km/l
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.costPerKm)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {inv.pricePerLiter ? `R$ ${inv.pricePerLiter.toFixed(2)}` : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
