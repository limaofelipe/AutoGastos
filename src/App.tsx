import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { MaintenanceAlerts } from './components/MaintenanceAlerts';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { VehicleModal } from './components/VehicleModal';
import { ExportModal } from './components/ExportModal';
import { Expense, Vehicle, ExpenseCategory } from './types';
import { 
  subscribeToExpenses, 
  subscribeToVehicles, 
  saveExpense, 
  deleteExpense, 
  saveVehicle, 
  deleteVehicle,
  seedSampleData
} from './services/expenseService';
import { Car, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'alerts'>('dashboard');

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filters passed to ExpenseList when navigated from Dashboard
  const [initialCategoryFilter, setInitialCategoryFilter] = useState<ExpenseCategory | null>(null);
  const [initialMonthFilter, setInitialMonthFilter] = useState<number | null>(null);

  // Toast / feedback message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setVehicles([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    const unsubExpenses = subscribeToExpenses(
      user.uid,
      (list) => {
        setExpenses(list);
        setDataLoading(false);
      },
      (err) => {
        console.error('Error in expenses subscription:', err);
        setDataLoading(false);
      }
    );

    const unsubVehicles = subscribeToVehicles(
      user.uid,
      (list) => {
        setVehicles(list);
        // Default select first vehicle if none selected or if single
        if (selectedVehicleId === 'all' && list.length === 1) {
          setSelectedVehicleId(list[0].id);
        }
      },
      (err) => {
        console.error('Error in vehicles subscription:', err);
      }
    );

    return () => {
      unsubExpenses();
      unsubVehicles();
    };
  }, [user]);

  // Handle saving an expense (create or update)
  const handleSaveExpense = async (
    expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;
    const now = new Date().toISOString();
    const id = editingExpense ? editingExpense.id : `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const fullExpense: Expense = {
      ...expenseData,
      id,
      userId: user.uid,
      createdAt: editingExpense ? editingExpense.createdAt : now,
      updatedAt: now,
    };

    await saveExpense(fullExpense);

    // If odometer informed and matches a vehicle, update vehicle currentKm if higher
    if (fullExpense.odometerKm && fullExpense.vehicleId) {
      const v = vehicles.find((item) => item.id === fullExpense.vehicleId);
      if (v && (!v.currentKm || fullExpense.odometerKm > v.currentKm)) {
        await saveVehicle({
          ...v,
          currentKm: fullExpense.odometerKm,
          updatedAt: now,
        });
      }
    }

    showToast(editingExpense ? 'Gasto atualizado com sucesso!' : 'Gasto cadastrado com sucesso!');
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId);
    showToast('Gasto excluído com sucesso!');
  };

  // Handle saving vehicle
  const handleSaveVehicle = async (
    vehicleData: Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    vehicleId?: string
  ) => {
    if (!user) return;
    const now = new Date().toISOString();
    const id = vehicleId || `veh_${Date.now()}`;
    const existing = vehicles.find((v) => v.id === id);

    const fullVehicle: Vehicle = {
      ...vehicleData,
      id,
      userId: user.uid,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    await saveVehicle(fullVehicle);
    showToast(vehicleId ? 'Veículo atualizado!' : 'Veículo adicionado com sucesso!');
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    await deleteVehicle(vehicleId);
    if (selectedVehicleId === vehicleId) {
      setSelectedVehicleId('all');
    }
    showToast('Veículo removido!');
  };

  // Seed sample data for demonstration
  const handleSeedData = async () => {
    if (!user) return;
    try {
      showToast('Carregando dados de exemplo...');
      await seedSampleData(user.uid, selectedYear);
      showToast('Dados de exemplo carregados com sucesso! Veja o gráfico e lançamentos.');
    } catch (err) {
      console.error('Seed error:', err);
      showToast('Falha ao carregar dados de exemplo.', 'error');
    }
  };

  const handleOpenMaintenanceWithDefaults = (defaults: { category: string; title: string }) => {
    setEditingExpense({
      id: '',
      userId: user?.uid || '',
      category: defaults.category as ExpenseCategory,
      title: defaults.title,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      createdAt: '',
      updatedAt: '',
    });
    setIsExpenseModalOpen(true);
  };

  const handleOpenFuelExpenseModal = () => {
    setEditingExpense({
      id: '',
      userId: user?.uid || '',
      category: 'gasolina',
      title: 'Gasolina Comum (Tanque Cheio)',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      year: selectedYear,
      month: new Date().getMonth() + 1,
      createdAt: '',
      updatedAt: '',
    });
    setIsExpenseModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
          <Car className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Iniciando AutoGastos...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900 border-rose-500/30 text-rose-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
        onOpenExpenseModal={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
        onOpenSeedData={expenses.length === 0 ? handleSeedData : undefined}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* If user has no vehicles yet and no expenses, show welcome onboarding card */}
        {vehicles.length === 0 && expenses.length === 0 && !dataLoading && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-slate-900 border border-amber-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Bem-vindo ao AutoGastos!
              </div>
              <h2 className="text-xl font-bold text-white">
                Comece cadastrando seu primeiro veículo ou experimente dados de exemplo.
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Você pode registrar seu carro para acompanhar odômetro e manutenções, ou carregar um ano de exemplo com abastecimentos, revisões de freio, óleo e IPVA.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleSeedData}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Carregar Exemplo 2026</span>
              </button>
              <button
                onClick={() => setIsVehicleModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Cadastrar Carro</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <Dashboard
            expenses={expenses}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            selectedYear={selectedYear}
            onChangeYear={setSelectedYear}
            onOpenExpenseModal={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onOpenFuelExpenseModal={handleOpenFuelExpenseModal}
            onSelectCategoryFilter={(cat) => setInitialCategoryFilter(cat)}
            onSelectMonthFilter={(m) => setInitialMonthFilter(m)}
            onNavigateToHistory={() => setActiveTab('history')}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {/* Tab 2: History & List */}
        {activeTab === 'history' && (
          <ExpenseList
            expenses={expenses}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            selectedYear={selectedYear}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onOpenExpenseModal={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            initialCategoryFilter={initialCategoryFilter}
            initialMonthFilter={initialMonthFilter}
          />
        )}

        {/* Tab 3: Alerts & Maintenance */}
        {activeTab === 'alerts' && (
          <MaintenanceAlerts
            expenses={expenses}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onOpenExpenseModalWithDefaults={handleOpenMaintenanceWithDefaults}
          />
        )}

      </main>

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        vehicles={vehicles}
        defaultVehicleId={selectedVehicleId}
        defaultYear={selectedYear}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicles={vehicles}
        onSaveVehicle={handleSaveVehicle}
        onDeleteVehicle={handleDeleteVehicle}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        expenses={expenses}
        vehicles={vehicles}
        selectedYear={selectedYear}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-6 text-center text-xs text-slate-500">
        <p>AutoGastos • Controle Inteligente de Despesas Automotivas, Combustível e Manutenção.</p>
      </footer>
    </div>
  );
}
