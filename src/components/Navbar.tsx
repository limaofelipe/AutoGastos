import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Gauge, 
  LayoutDashboard, 
  ListOrdered, 
  Wrench, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Vehicle } from '../types';

interface NavbarProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onOpenExpenseModal: () => void;
  onOpenVehicleModal: () => void;
  onOpenSeedData?: () => void;
  activeTab: 'dashboard' | 'history' | 'alerts';
  onChangeTab: (tab: 'dashboard' | 'history' | 'alerts') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onOpenExpenseModal,
  onOpenVehicleModal,
  onOpenSeedData,
  activeTab,
  onChangeTab,
}) => {
  const { user, profile, signOutUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  const currentVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
                <Car className="w-5 h-5 text-slate-950" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                  Auto<span className="text-amber-400">Gastos</span>
                </span>
                <p className="text-[10px] text-slate-400 -mt-1 font-medium">Controle Veicular</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onChangeTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard Anual
              </button>
              <button
                onClick={() => onChangeTab('history')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                Lançamentos
              </button>
              <button
                onClick={() => onChangeTab('alerts')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'alerts'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Manutenções & Alertas
              </button>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Vehicle Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
              >
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[110px] sm:max-w-[150px] truncate font-medium">
                  {currentVehicle ? currentVehicle.name : 'Todos os Veículos'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showVehicleDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowVehicleDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/50 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Selecione o Veículo
                    </div>

                    <button
                      onClick={() => {
                        onSelectVehicle('all');
                        setShowVehicleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer ${
                        selectedVehicleId === 'all' ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5" />
                        Todos os veículos
                      </span>
                    </button>

                    {vehicles.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          onSelectVehicle(v.id);
                          setShowVehicleDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-800/80 transition-colors cursor-pointer ${
                          selectedVehicleId === v.id ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{v.name}</span>
                          {v.plate && <span className="text-[10px] text-slate-400 font-mono">{v.plate}</span>}
                        </div>
                        {v.currentKm && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            {v.currentKm.toLocaleString('pt-BR')} km
                          </span>
                        )}
                      </button>
                    ))}

                    <div className="border-t border-slate-800 my-1 pt-1">
                      <button
                        onClick={() => {
                          setShowVehicleDropdown(false);
                          onOpenVehicleModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Gerenciar / Adicionar Carro
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Add Expense Button */}
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Novo Gasto</span>
              <span className="sm:hidden">Gasto</span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                title={user?.email || 'Usuário'}
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-amber-500/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/50 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">
                        {user?.displayName || 'Proprietário'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenVehicleModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Car className="w-3.5 h-3.5 text-amber-400" />
                      Meus Veículos ({vehicles.length})
                    </button>

                    {onOpenSeedData && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenSeedData();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Carregar Dados de Exemplo
                      </button>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOutUser();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sair da Conta
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60">
          <button
            onClick={() => onChangeTab('dashboard')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => onChangeTab('history')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'history' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            Lançamentos
          </button>
          <button
            onClick={() => onChangeTab('alerts')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'alerts' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Manutenções
          </button>
        </div>
      </div>
    </header>
  );
};
