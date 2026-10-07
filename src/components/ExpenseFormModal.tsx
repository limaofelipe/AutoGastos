import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Tag, 
  Car, 
  MapPin, 
  CreditCard, 
  FileText, 
  Gauge, 
  Fuel, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Expense, ExpenseCategory, Vehicle, PaymentMethod } from '../types';
import { CATEGORIES } from '../constants/categories';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingExpense?: Expense | null;
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  defaultYear?: number;
}

const CATEGORY_SUGGESTIONS: Record<ExpenseCategory, string[]> = {
  gasolina: ['Gasolina Comum (Tanque Cheio)', 'Gasolina Aditivada', 'Etanol', 'Diesel S10', 'GNV'],
  mecanico: ['Troca de Óleo e Filtro', 'Substituição Pastilhas de Freio', 'Troca de Correia Dentada', 'Embreagem', 'Suspensão e Amortecedores'],
  reparo: ['Reparo de Pára-choque', 'Funilaria e Pintura', 'Reparo no Vidro / Parabrisa', 'Conserto de Ar-Condicionado', 'Conserto do Alternador'],
  revisao: ['Revisão Periódica dos 10.000 km', 'Revisão Preventiva Pré-Viagem', 'Troca de Velas e Cabos', 'Troca de Filtro de Combustível', 'Troca de Fluido de Freio'],
  pneus: ['Jogo de Pneus Novos', 'Alinhamento e Balanceamento', 'Rodízio de Pneus', 'Conserto de Pneu Furado', 'Cambagem e Cáster'],
  ipva_taxas: ['IPVA Cota Única (com desconto)', 'IPVA Parcela', 'Licenciamento Anual', 'Taxa de Transferência', 'Placa Mercosul'],
  seguro: ['Renovação do Seguro Auto', 'Franquia do Seguro', 'Mensalidade Proteção Veicular', 'Rastreador Veicular'],
  lavagem: ['Lavagem Simples com Cera', 'Higienização Interna dos Bancos', 'Polimento e Cristalização', 'Lavagem Técnica de Motor'],
  estacionamento: ['Mensalidade Garagem / Estacionamento', 'Diária Estacionamento Aeroporto', 'Pedágios da Viagem', 'Valet'],
  multas: ['Multa por Excesso de Velocidade', 'Multa de Estacionamento Rotativo', 'Infração de Rodízio'],
  acessorios: ['Película Solar (Insulfilm)', 'Central Multimídia', 'Tapetes Originais', 'Câmera de Ré / Sensor', 'Lâmpadas de LED'],
  outros: ['Troca de Palhetas do Parabrisa', 'Aromatizador / Odorizador', 'Cabo de Chupeta', 'Bateria Nova 60Ah']
};

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  vehicles,
  defaultVehicleId,
  defaultYear = new Date().getFullYear(),
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('gasolina');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vehicleId, setVehicleId] = useState<string>('');
  const [odometerKm, setOdometerKm] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cartao_credito');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [liters, setLiters] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title || '');
      setCategory(editingExpense.category || 'gasolina');
      setAmount(editingExpense.amount ? editingExpense.amount.toString() : '');
      setDate(editingExpense.date || new Date().toISOString().split('T')[0]);
      setVehicleId(editingExpense.vehicleId || '');
      setOdometerKm(editingExpense.odometerKm ? editingExpense.odometerKm.toString() : '');
      setPaymentMethod((editingExpense.paymentMethod as PaymentMethod) || 'cartao_credito');
      setLocation(editingExpense.location || '');
      setNotes(editingExpense.notes || '');
      setLiters(editingExpense.liters ? editingExpense.liters.toString() : '');
      setPricePerLiter(editingExpense.pricePerLiter ? editingExpense.pricePerLiter.toString() : '');
    } else {
      setTitle('');
      setCategory('gasolina');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setVehicleId(defaultVehicleId && defaultVehicleId !== 'all' ? defaultVehicleId : (vehicles[0]?.id || ''));
      setOdometerKm('');
      setPaymentMethod('cartao_credito');
      setLocation('');
      setNotes('');
      setLiters('');
      setPricePerLiter('');
    }
    setFormError(null);
  }, [editingExpense, isOpen, defaultVehicleId, vehicles]);

  if (!isOpen) return null;

  // Auto calculate total or price per liter when fuel inputs change
  const handleLitersChange = (newLit: string) => {
    setLiters(newLit);
    const litNum = parseFloat(newLit);
    const priceNum = parseFloat(pricePerLiter);
    if (!isNaN(litNum) && !isNaN(priceNum) && litNum > 0 && priceNum > 0) {
      setAmount((litNum * priceNum).toFixed(2));
    }
  };

  const handlePricePerLiterChange = (newP: string) => {
    setPricePerLiter(newP);
    const litNum = parseFloat(liters);
    const priceNum = parseFloat(newP);
    if (!isNaN(litNum) && !isNaN(priceNum) && litNum > 0 && priceNum > 0) {
      setAmount((litNum * priceNum).toFixed(2));
    }
  };

  const handleAmountChange = (newVal: string) => {
    setAmount(newVal);
    const valNum = parseFloat(newVal);
    const priceNum = parseFloat(pricePerLiter);
    if (category === 'gasolina' && !isNaN(valNum) && !isNaN(priceNum) && priceNum > 0 && !liters) {
      setLiters((valNum / priceNum).toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!title.trim()) {
      setFormError('Por favor informe a descrição do gasto.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Por favor informe um valor válido maior que zero.');
      return;
    }
    if (!date) {
      setFormError('Por favor selecione a data do gasto.');
      return;
    }

    const dateObj = new Date(date + 'T12:00:00Z');
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // 1 to 12

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        category,
        amount: parsedAmount,
        date,
        year,
        month,
        vehicleId: vehicleId || undefined,
        odometerKm: odometerKm ? parseInt(odometerKm, 10) : undefined,
        paymentMethod,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        liters: liters ? parseFloat(liters) : undefined,
        pricePerLiter: pricePerLiter ? parseFloat(pricePerLiter) : undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving expense:', err);
      setFormError('Erro ao salvar gasto. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDateToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const setDateYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingExpense ? 'Editar Gasto do Carro' : 'Novo Gasto do Carro'}
              </h3>
              <p className="text-xs text-slate-400">
                Preencha os dados da despesa para atualizar o histórico e dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Categoria da Despesa <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(CATEGORIES).map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      // Clear suggestions selection
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{cat.label.split('/')[0]}</span>
                    {isSelected && <span className="text-[10px] text-amber-400 font-bold">Selecionado ✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Title & Description with Quick Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                O que foi gasto? (Descrição) <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Ex: Pastilha de freio, Gasolina, IPVA</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Troca de óleo sintético 5W30 + Filtro"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              required
            />

            {/* Quick Suggestions based on Category */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Sugestões:
              </span>
              {CATEGORY_SUGGESTIONS[category]?.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTitle(sug)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Valor Total (R$) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Data do Gasto <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={setDateToday}
                    className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    Hoje
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={setDateYesterday}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Ontem
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

          </div>

          {/* 4. Fuel Specific Fields if category is Gasolina */}
          {category === 'gasolina' && (
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Fuel className="w-4 h-4" />
                <span>Detalhes do Abastecimento (Opcional mas recomendado)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Litros Abastecidos</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={liters}
                    onChange={(e) => handleLitersChange(e.target.value)}
                    placeholder="Ex: 42.5"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Preço por Litro (R$)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={pricePerLiter}
                    onChange={(e) => handlePricePerLiterChange(e.target.value)}
                    placeholder="Ex: 5.89"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Vehicle & Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Vehicle selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Veículo
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                {vehicles.length === 0 ? (
                  <option value="">Nenhum carro cadastrado</option>
                ) : (
                  vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.plate ? `(${v.plate})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Odometer (KM) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Quilometragem (KM do Odômetro)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  placeholder="Ex: 48500"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                  KM
                </span>
              </div>
            </div>

          </div>

          {/* 6. Payment & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="pix">PIX</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Local / Estabelecimento
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Posto Shell Av. Paulista, Oficina AutoCar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

          </div>

          {/* 7. Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações / Garantia / Próxima Troca
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Garantia de 6 meses das peças. Mecânico orientou checar correia na próxima visita."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingExpense ? 'Atualizar Gasto' : 'Salvar Gasto'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
