import React, { useState } from 'react';
import { X, Car, Plus, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onSaveVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>;
  onDeleteVehicle: (vehicleId: string) => Promise<void>;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onSaveVehicle,
  onDeleteVehicle,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [currentKm, setCurrentKm] = useState<string>('');
  const [fuelType, setFuelType] = useState('Flex (Gasolina / Etanol)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; year?: string; currentKm?: string }>({});

  if (!isOpen) return null;

  const handleStartEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setName(v.name);
    setPlate(v.plate || '');
    setYear(v.year ? v.year.toString() : '');
    setCurrentKm(v.currentKm ? v.currentKm.toString() : '');
    setFuelType(v.fuelType || 'Flex (Gasolina / Etanol)');
    setError(null);
    setFieldErrors({});
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setPlate('');
    setYear(new Date().getFullYear().toString());
    setCurrentKm('');
    setFuelType('Flex (Gasolina / Etanol)');
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const newFieldErrors: { name?: string; year?: string; currentKm?: string } = {};

    if (!name.trim()) {
      newFieldErrors.name = 'Campo obrigatório: informe o modelo ou nome do carro (ex: Honda Civic, Fiat Argo).';
    }

    if (year.trim()) {
      const parsedYear = parseInt(year, 10);
      if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
        newFieldErrors.year = 'Informe um ano de fabricação válido (1900 a 2100).';
      }
    }

    if (currentKm.trim()) {
      const parsedKm = parseInt(currentKm, 10);
      if (isNaN(parsedKm) || parsedKm < 0) {
        newFieldErrors.currentKm = 'A quilometragem não pode ser negativa.';
      }
    }

    setFieldErrors(newFieldErrors);

    if (Object.keys(newFieldErrors).length > 0) {
      setError('Por favor, corrija os campos sinalizados em vermelho abaixo.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveVehicle(
        {
          name: name.trim(),
          plate: plate.trim() || undefined,
          year: year.trim() ? parseInt(year, 10) : undefined,
          currentKm: currentKm.trim() ? parseInt(currentKm, 10) : undefined,
          fuelType,
        },
        editingId || undefined
      );
      handleResetForm();
    } catch (err: any) {
      console.error('Error saving vehicle:', err);
      setError(`Falha ao salvar veículo: ${err?.message || 'Verifique os dados.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este veículo? As despesas associadas não serão apagadas.')) {
      try {
        await onDeleteVehicle(id);
        if (editingId === id) handleResetForm();
      } catch (err) {
        console.error('Error deleting vehicle:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Meus Veículos</h3>
              <p className="text-xs text-slate-400">Cadastre e gerencie seus carros para associar gastos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Existing vehicles list */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Veículos Cadastrados ({vehicles.length})
            </h4>

            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-800">
                Nenhum veículo cadastrado ainda. Cadastre seu primeiro carro abaixo!
              </p>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      editingId === v.id
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white truncate">{v.name}</span>
                        {v.plate && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[10px] text-amber-400 font-semibold">
                            {v.plate}
                          </span>
                        )}
                        {v.year && <span className="text-[11px] text-slate-400">{v.year}</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                        {v.currentKm && <span>{v.currentKm.toLocaleString('pt-BR')} km</span>}
                        {v.fuelType && <span>{v.fuelType}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(v)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Editar veículo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Excluir veículo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to Add or Edit */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                {editingId ? 'Editar Veículo Selecionado' : 'Cadastrar Novo Carro'}
              </h5>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Modelo / Nome do Carro</span>
                  <span className="text-rose-400 font-bold">*</span>
                  {fieldErrors.name && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Obrigatório em branco
                    </span>
                  )}
                </label>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Ex: Honda Civic 2.0 EXL ou Fiat Argo 1.0"
                className={`w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-xs transition-all focus:outline-none ${
                  fieldErrors.name
                    ? 'border-2 border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/5'
                    : 'border border-slate-700 focus:border-amber-500'
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Placa (Opcional)
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Ex: BRA-2E19"
                  maxLength={10}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ano de Fabricação
                </label>
                <input
                  type="number"
                  min="1950"
                  max="2035"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    if (fieldErrors.year) setFieldErrors((prev) => ({ ...prev, year: undefined }));
                  }}
                  placeholder="Ex: 2022"
                  className={`w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-xs focus:outline-none ${
                    fieldErrors.year ? 'border-2 border-rose-500 ring-1 ring-rose-500' : 'border border-slate-700 focus:border-amber-500'
                  }`}
                />
                {fieldErrors.year && (
                  <p className="mt-1 text-[10px] text-rose-400">{fieldErrors.year}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quilometragem Atual (KM)
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentKm}
                  onChange={(e) => {
                    setCurrentKm(e.target.value);
                    if (fieldErrors.currentKm) setFieldErrors((prev) => ({ ...prev, currentKm: undefined }));
                  }}
                  placeholder="Ex: 45000"
                  className={`w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-xs focus:outline-none ${
                    fieldErrors.currentKm ? 'border-2 border-rose-500 ring-1 ring-rose-500' : 'border border-slate-700 focus:border-amber-500'
                  }`}
                />
                {fieldErrors.currentKm && (
                  <p className="mt-1 text-[10px] text-rose-400">{fieldErrors.currentKm}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Combustível Principal
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Flex (Gasolina / Etanol)">Flex (Gasolina / Etanol)</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Etanol">Etanol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Elétrico">Elétrico</option>
                  <option value="GNV">GNV</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{editingId ? 'Salvar Alterações' : 'Adicionar Carro'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
