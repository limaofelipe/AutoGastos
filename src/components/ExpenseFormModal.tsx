import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  AlertTriangle
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

interface FieldErrors {
  title?: string;
  amount?: string;
  date?: string;
  category?: string;
  odometerKm?: string;
  liters?: string;
  pricePerLiter?: string;
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
  
  // Validation States
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const formContainerRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

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
    setErrors({});
    setFormError(null);
  }, [editingExpense, isOpen, defaultVehicleId, vehicles]);

  if (!isOpen) return null;

  // Clear specific field error when typing
  const clearFieldError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (formError) setFormError(null);
  };

  // Auto calculate total or price per liter when fuel inputs change
  const handleLitersChange = (newLit: string) => {
    setLiters(newLit);
    clearFieldError('liters');
    const litNum = parseFloat(newLit);
    const priceNum = parseFloat(pricePerLiter);
    if (!isNaN(litNum) && !isNaN(priceNum) && litNum > 0 && priceNum > 0) {
      setAmount((litNum * priceNum).toFixed(2));
      clearFieldError('amount');
    }
  };

  const handlePricePerLiterChange = (newP: string) => {
    setPricePerLiter(newP);
    clearFieldError('pricePerLiter');
    const litNum = parseFloat(liters);
    const priceNum = parseFloat(newP);
    if (!isNaN(litNum) && !isNaN(priceNum) && litNum > 0 && priceNum > 0) {
      setAmount((litNum * priceNum).toFixed(2));
      clearFieldError('amount');
    }
  };

  const handleAmountChange = (newVal: string) => {
    setAmount(newVal);
    clearFieldError('amount');
    const valNum = parseFloat(newVal);
    const priceNum = parseFloat(pricePerLiter);
    if (category === 'gasolina' && !isNaN(valNum) && !isNaN(priceNum) && priceNum > 0 && !liters) {
      setLiters((valNum / priceNum).toFixed(2));
      clearFieldError('liters');
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    // 1. Title validation
    if (!title.trim()) {
      newErrors.title = 'Campo obrigatório: informe a descrição do gasto (ex: Troca de óleo, Gasolina).';
    }

    // 2. Amount validation
    if (!amount.trim()) {
      newErrors.amount = 'Campo obrigatório: informe o valor total em reais (R$).';
    } else {
      const parsedAmount = parseFloat(amount.replace(',', '.'));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        newErrors.amount = 'O valor deve ser maior que zero (ex: R$ 50,00).';
      }
    }

    // 3. Date validation
    if (!date.trim()) {
      newErrors.date = 'Campo obrigatório: selecione a data em que o gasto ocorreu.';
    }

    // 4. Category validation
    if (!category) {
      newErrors.category = 'Selecione uma categoria para a despesa.';
    }

    // 5. Odometer validation (if informed)
    if (odometerKm.trim()) {
      const parsedKm = parseInt(odometerKm, 10);
      if (isNaN(parsedKm) || parsedKm < 0) {
        newErrors.odometerKm = 'A quilometragem não pode ser negativa.';
      }
    }

    // 6. Fuel specifics validation
    if (category === 'gasolina') {
      if (liters.trim()) {
        const parsedLiters = parseFloat(liters.replace(',', '.'));
        if (isNaN(parsedLiters) || parsedLiters <= 0) {
          newErrors.liters = 'A quantidade de litros deve ser maior que zero.';
        }
      }
      if (pricePerLiter.trim()) {
        const parsedPrice = parseFloat(pricePerLiter.replace(',', '.'));
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
          newErrors.pricePerLiter = 'O preço por litro deve ser maior que zero.';
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Create readable summary of missing required fields
      const missingFields: string[] = [];
      if (newErrors.title) missingFields.push('Descrição');
      if (newErrors.amount) missingFields.push('Valor');
      if (newErrors.date) missingFields.push('Data');
      if (newErrors.category) missingFields.push('Categoria');

      setFormError(
        `Atenção: existem campos obrigatórios pendentes ou incorretos (${missingFields.join(', ')}). Verifique os campos sinalizados em vermelho abaixo.`
      );

      // Scroll to top of form container
      if (formContainerRef.current) {
        formContainerRef.current.scrollTop = 0;
      }

      // Focus first error field
      if (newErrors.title && titleInputRef.current) {
        titleInputRef.current.focus();
      } else if (newErrors.amount && amountInputRef.current) {
        amountInputRef.current.focus();
      }

      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    const parsedAmount = parseFloat(amount.replace(',', '.'));
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
        vehicleId: vehicleId && vehicleId !== 'all' ? vehicleId : undefined,
        odometerKm: odometerKm.trim() ? parseInt(odometerKm, 10) : undefined,
        paymentMethod: paymentMethod || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        liters: liters.trim() ? parseFloat(liters.replace(',', '.')) : undefined,
        pricePerLiter: pricePerLiter.trim() ? parseFloat(pricePerLiter.replace(',', '.')) : undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving expense:', err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
        setFormError('Erro de permissão no Firebase. Certifique-se de que está autenticado com sua conta Google.');
      } else {
        setFormError(`Erro ao salvar no banco de dados: ${errMsg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDateToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
    clearFieldError('date');
  };

  const setDateYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
    clearFieldError('date');
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
                Os campos marcados com <span className="text-rose-400 font-bold">*</span> são obrigatórios
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
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5 max-h-[80vh] overflow-y-auto" ref={formContainerRef}>
          
          {/* General Error Banner */}
          {formError && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-rose-300 block text-sm">Atenção no preenchimento</span>
                <span className="leading-relaxed">{formError}</span>
              </div>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Categoria da Despesa</span>
                <span className="text-rose-400 font-bold">*</span>
              </label>
              {errors.category && (
                <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.category}
                </span>
              )}
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-xl transition-all ${
              errors.category ? 'ring-2 ring-rose-500/50 bg-rose-500/5' : ''
            }`}>
              {Object.values(CATEGORIES).map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      clearFieldError('category');
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

          {/* 2. Title & Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>O que foi gasto? (Descrição)</span>
                <span className="text-rose-400 font-bold">*</span>
                {errors.title && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Obrigatório em branco
                  </span>
                )}
              </label>
              <span className="text-[11px] text-slate-400">Ex: Pastilha de freio, Gasolina, IPVA</span>
            </div>

            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearFieldError('title');
              }}
              placeholder="Ex: Troca de óleo sintético 5W30 + Filtro"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 text-white placeholder-slate-500 text-sm transition-all focus:outline-none ${
                errors.title
                  ? 'border-2 border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/5'
                  : 'border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
              }`}
            />

            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.title}</span>
              </p>
            )}

            {/* Quick Suggestions based on Category */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Sugestões rápidas:
              </span>
              {CATEGORY_SUGGESTIONS[category]?.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTitle(sug);
                    clearFieldError('title');
                  }}
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Valor Total (R$)</span>
                  <span className="text-rose-400 font-bold">*</span>
                  {errors.amount && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Obrigatório em branco
                    </span>
                  )}
                </label>
              </div>

              <div className="relative">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold ${
                  errors.amount ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  R$
                </span>
                <input
                  ref={amountInputRef}
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0,00"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-base placeholder-slate-500 transition-all focus:outline-none ${
                    errors.amount
                      ? 'border-2 border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/5'
                      : 'border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                  }`}
                />
              </div>

              {errors.amount && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.amount}</span>
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Data do Gasto</span>
                  <span className="text-rose-400 font-bold">*</span>
                  {errors.date && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Obrigatório
                    </span>
                  )}
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
                onChange={(e) => {
                  setDate(e.target.value);
                  clearFieldError('date');
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 text-white text-sm transition-all focus:outline-none ${
                  errors.date
                    ? 'border-2 border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/5'
                    : 'border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />

              {errors.date && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.date}</span>
                </p>
              )}
            </div>

          </div>

          {/* 4. Fuel Specific Fields if category is Gasolina */}
          {category === 'gasolina' && (
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Fuel className="w-4 h-4" />
                <span>Detalhes do Abastecimento (Opcional - calcula média KM/L)</span>
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
                    className={`w-full px-3 py-2 rounded-lg bg-slate-950 text-white text-xs focus:outline-none ${
                      errors.liters ? 'border border-rose-500 ring-1 ring-rose-500' : 'border border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.liters && (
                    <span className="text-[10px] text-rose-400 mt-1 block">{errors.liters}</span>
                  )}
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
                    className={`w-full px-3 py-2 rounded-lg bg-slate-950 text-white text-xs focus:outline-none ${
                      errors.pricePerLiter ? 'border border-rose-500 ring-1 ring-rose-500' : 'border border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {errors.pricePerLiter && (
                    <span className="text-[10px] text-rose-400 mt-1 block">{errors.pricePerLiter}</span>
                  )}
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {vehicles.length === 0 ? (
                  <option value="">Nenhum carro cadastrado</option>
                ) : (
                  <>
                    <option value="">Não vincular a veículo</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.plate ? `(${v.plate})` : ''}
                      </option>
                    ))}
                  </>
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
                  onChange={(e) => {
                    setOdometerKm(e.target.value);
                    clearFieldError('odometerKm');
                  }}
                  placeholder="Ex: 48500"
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 text-white text-sm focus:outline-none ${
                    errors.odometerKm
                      ? 'border border-rose-500 ring-1 ring-rose-500'
                      : 'border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                  KM
                </span>
              </div>
              {errors.odometerKm && (
                <span className="text-[11px] text-rose-400 mt-1 block">{errors.odometerKm}</span>
              )}
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
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
                Local / Estabelecimento (Opcional)
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
              Observações / Garantia / Próxima Troca (Opcional)
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
