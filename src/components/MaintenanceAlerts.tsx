import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Disc, 
  Sparkles, 
  Plus, 
  Car,
  Calendar
} from 'lucide-react';
import { Expense, Vehicle } from '../types';

interface MaintenanceAlertsProps {
  expenses: Expense[];
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onOpenExpenseModalWithDefaults: (defaults: { category: string; title: string }) => void;
}

interface MaintenanceItem {
  id: string;
  title: string;
  category: string;
  intervalKm: number;
  intervalMonths: number;
  description: string;
  importance: 'alta' | 'media' | 'baixa';
}

const RECOMMENDED_MAINTENANCES: MaintenanceItem[] = [
  {
    id: 'oil_filter',
    title: 'Troca de Óleo Sintético e Filtro',
    category: 'mecanico',
    intervalKm: 10000,
    intervalMonths: 6,
    description: 'Vital para a vida útil do motor. Evita formação de borra e superaquecimento.',
    importance: 'alta',
  },
  {
    id: 'tires_rotation',
    title: 'Rodízio de Pneus + Alinhamento 3D',
    category: 'pneus',
    intervalKm: 10000,
    intervalMonths: 6,
    description: 'Garante desgaste homogêneo dos 4 pneus, melhora a frenagem e economia de gasolina.',
    importance: 'media',
  },
  {
    id: 'brake_pads',
    title: 'Checagem de Pastilhas e Fluido de Freio',
    category: 'mecanico',
    intervalKm: 20000,
    intervalMonths: 12,
    description: 'Segurança essencial. Fluidos perdem eficiência com a umidade e pastilhas desgastam.',
    importance: 'alta',
  },
  {
    id: 'cabin_air_filter',
    title: 'Higienização e Filtro de Ar-Condicionado (Cabine)',
    category: 'revisao',
    intervalKm: 15000,
    intervalMonths: 12,
    description: 'Evita odores, fungos, bactérias no ar e mantém o fluxo de ventilação forte.',
    importance: 'media',
  },
  {
    id: 'timing_belt',
    title: 'Correia Dentada / Kit de Distribuição',
    category: 'mecanico',
    intervalKm: 50000,
    intervalMonths: 48,
    description: 'Crucial! O rompimento da correia pode fundir válvulas e pistões do motor.',
    importance: 'alta',
  },
  {
    id: 'spark_plugs',
    title: 'Velas de Ignição e Cabos',
    category: 'revisao',
    intervalKm: 30000,
    intervalMonths: 24,
    description: 'Velas desgastadas causam falhas na aceleração e aumento drástico no consumo de combustível.',
    importance: 'media',
  },
];

export const MaintenanceAlerts: React.FC<MaintenanceAlertsProps> = ({
  expenses,
  vehicles,
  selectedVehicleId,
  onOpenExpenseModalWithDefaults,
}) => {
  const currentVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const currentKm = currentVehicle?.currentKm || 0;

  // Find last expense related to each maintenance
  const maintenanceStatus = RECOMMENDED_MAINTENANCES.map((item) => {
    // Find expenses matching title or category
    const matchingExpenses = expenses
      .filter((e) => {
        if (selectedVehicleId !== 'all' && e.vehicleId !== selectedVehicleId) return false;
        const text = (e.title + ' ' + (e.notes || '')).toLowerCase();
        if (item.id === 'oil_filter' && (text.includes('óleo') || text.includes('oleo'))) return true;
        if (item.id === 'tires_rotation' && (text.includes('pneu') || text.includes('alinhamento') || text.includes('balanceamento'))) return true;
        if (item.id === 'brake_pads' && (text.includes('freio') || text.includes('pastilha'))) return true;
        if (item.id === 'cabin_air_filter' && (text.includes('cabine') || text.includes('ar-condicionado') || text.includes('filtro de ar'))) return true;
        if (item.id === 'timing_belt' && (text.includes('correia') || text.includes('distribuição'))) return true;
        if (item.id === 'spark_plugs' && text.includes('vela')) return true;
        return false;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const last = matchingExpenses[0];
    let kmSinceLast = last?.odometerKm && currentKm > last.odometerKm ? currentKm - last.odometerKm : null;
    let daysSinceLast = last?.date
      ? Math.round((new Date().getTime() - new Date(last.date + 'T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24))
      : null;

    let status: 'ok' | 'warning' | 'urgent' = 'ok';
    let statusText = 'Em dia';

    if (!last) {
      status = 'warning';
      statusText = 'Sem registro recente';
    } else if (kmSinceLast !== null && kmSinceLast >= item.intervalKm) {
      status = 'urgent';
      statusText = `Venceu há ${kmSinceLast - item.intervalKm} km`;
    } else if (daysSinceLast !== null && daysSinceLast > item.intervalMonths * 30) {
      status = 'urgent';
      statusText = `Venceu por tempo (${Math.round(daysSinceLast / 30)} meses)`;
    } else if (kmSinceLast !== null && kmSinceLast >= item.intervalKm * 0.8) {
      status = 'warning';
      statusText = `Próximo da troca (${item.intervalKm - kmSinceLast} km restantes)`;
    } else {
      status = 'ok';
      statusText = last.odometerKm
        ? `Última aos ${last.odometerKm.toLocaleString('pt-BR')} km`
        : `Feito em ${new Date(last.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}`;
    }

    return {
      ...item,
      lastExpense: last,
      status,
      statusText,
      kmSinceLast,
      daysSinceLast,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Manutenção Preventiva Inteligente
          </div>
          <h2 className="text-xl font-bold text-white">
            Saúde & Próximas Revisões do Veículo
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentVehicle
              ? `Acompanhando ${currentVehicle.name} com ${currentKm.toLocaleString('pt-BR')} km registrados.`
              : 'Selecione um veículo ou confira os intervalos padrão recomendados por montadoras.'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-right flex-shrink-0">
          <span className="text-[11px] text-slate-400 block">Odômetro Referência</span>
          <span className="text-lg font-extrabold text-amber-400">
            {currentKm > 0 ? `${currentKm.toLocaleString('pt-BR')} km` : 'KM não informado'}
          </span>
        </div>
      </div>

      {/* Grid of Maintenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenanceStatus.map((item) => {
          const isUrgent = item.status === 'urgent';
          const isWarning = item.status === 'warning';
          const isOk = item.status === 'ok';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isUrgent
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/20 shadow-lg'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isUrgent
                          ? 'bg-rose-500/20 text-rose-400'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isWarning ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <span className="text-[11px] text-slate-400">
                        A cada {item.intervalKm.toLocaleString('pt-BR')} km ou {item.intervalMonths} meses
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isUrgent
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.statusText}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {item.lastExpense ? (
                    <>
                      Último gasto: <strong>R$ {item.lastExpense.amount.toFixed(2)}</strong>
                    </>
                  ) : (
                    'Nenhum registro anterior'
                  )}
                </span>

                <button
                  onClick={() =>
                    onOpenExpenseModalWithDefaults({
                      category: item.category,
                      title: item.title,
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Registrar Serviço</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
