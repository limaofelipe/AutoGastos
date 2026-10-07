import React from 'react';
import { Fuel, Wrench, BarChart3, ShieldCheck, Car, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, error } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Auto<span className="text-amber-400">Gastos</span>
              </span>
              <p className="text-xs text-slate-400">Gestão Inteligente do seu Veículo</p>
            </div>
          </div>
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all duration-200 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Entrar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20 flex-1 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Controle Mensal & Anual Completo
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Nunca mais perca as contas de quanto gasta no seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">carro</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Registre abastecimentos, serviços de mecânica, reparos, revisões, IPVA, seguro e visualize tudo em um dashboard anual interativo mês a mês.
          </p>

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={signInWithGoogle}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Entrar com Google</span>
            </button>
            <span className="text-xs text-slate-400">Armazenamento em nuvem seguro com Firebase</span>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-left">
              <Fuel className="w-5 h-5 text-amber-400 mb-1" />
              <div className="text-xs font-semibold text-slate-200">Combustível</div>
              <div className="text-[11px] text-slate-400">Preço/L e litros</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-left">
              <Wrench className="w-5 h-5 text-blue-400 mb-1" />
              <div className="text-xs font-semibold text-slate-200">Mecânica & Reparos</div>
              <div className="text-[11px] text-slate-400">Histórico de peças e KM</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-left col-span-2 sm:col-span-1">
              <BarChart3 className="w-5 h-5 text-emerald-400 mb-1" />
              <div className="text-xs font-semibold text-slate-200">Dashboard Anual</div>
              <div className="text-[11px] text-slate-400">Filtre por ano e mês</div>
            </div>
          </div>
        </div>

        {/* Preview Card Mockup */}
        <div className="flex-1 w-full max-w-lg">
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden p-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Chevrolet Onix 1.0</div>
                  <div className="text-xs text-slate-400">Placa ABC-1D23 • 48.500 km</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Ano 2026
              </span>
            </div>

            {/* Quick stats mockup */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block">Total Gasto no Ano</span>
                <span className="text-xl font-bold text-white">R$ 4.780,50</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Média: R$ 531/mês</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block">Combustível Total</span>
                <span className="text-xl font-bold text-amber-400">R$ 1.705,50</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">288,5 Litros</span>
              </div>
            </div>

            {/* Sample month bars */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Evolução Mensal</span>
                <span className="text-amber-400 font-medium">12 meses</span>
              </div>
              <div className="flex items-end gap-1.5 h-20 pt-4 px-1">
                {[65, 40, 85, 45, 90, 55, 30, 45, 35, 60, 50, 40].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t ${
                        i === 4 ? 'bg-amber-400' : i === 2 ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                      style={{ height: `${h}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dez</span>
              </div>
            </div>

            {/* Recent records preview */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>Mecânica: Pastilhas de Freio</span>
                </div>
                <span className="font-semibold text-white">R$ 380,00</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Gasolina Comum (Posto Shell)</span>
                </div>
                <span className="font-semibold text-white">R$ 240,00</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-400">
        <p>AutoGastos • Gerencie despesas automotivas com precisão e segurança no Firebase.</p>
      </footer>
    </div>
  );
};
