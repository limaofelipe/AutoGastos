import React from 'react';
import { X, Download, Printer, FileSpreadsheet, Check } from 'lucide-react';
import { Expense, Vehicle } from '../types';
import { CATEGORIES, MONTH_NAMES } from '../constants/categories';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  vehicles: Vehicle[];
  selectedYear: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  vehicles,
  selectedYear,
}) => {
  if (!isOpen) return null;

  const yearExpenses = expenses.filter((e) => e.year === selectedYear);
  const totalAmount = yearExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const vehicleMap = new Map<string, Vehicle>();
  vehicles.forEach((v) => vehicleMap.set(v.id, v));

  const handleDownloadCSV = () => {
    const headers = [
      'Data',
      'Ano',
      'Mês',
      'Descrição',
      'Categoria',
      'Valor (R$)',
      'Veículo',
      'KM Odômetro',
      'Litros',
      'Preço/L',
      'Forma Pagamento',
      'Local',
      'Observações',
    ];

    const rows = yearExpenses.map((e) => {
      const v = e.vehicleId ? vehicleMap.get(e.vehicleId) : null;
      const cat = CATEGORIES[e.category]?.label || e.category;
      return [
        `"${e.date}"`,
        e.year,
        e.month,
        `"${(e.title || '').replace(/"/g, '""')}"`,
        `"${cat}"`,
        (e.amount || 0).toFixed(2),
        `"${v ? v.name : ''}"`,
        e.odometerKm || '',
        e.liters || '',
        e.pricePerLiter || '',
        `"${e.paymentMethod || ''}"`,
        `"${(e.location || '').replace(/"/g, '""')}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gastos_veiculo_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Exportar Relatório</h3>
              <p className="text-xs text-slate-400">Ano {selectedYear} • {yearExpenses.length} lançamentos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Período:</span>
              <strong className="text-white">Ano de {selectedYear} (12 meses)</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Total de Gastos:</span>
              <strong className="text-amber-400 font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
              </strong>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Quantidade de lançamentos:</span>
              <strong className="text-white">{yearExpenses.length} registros</strong>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDownloadCSV}
              className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Planilha Excel / CSV</h4>
                  <p className="text-xs text-slate-400">Baixar arquivo .CSV compatível com Excel e Google Sheets</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
            </button>

            <button
              onClick={handlePrint}
              className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Imprimir / Salvar em PDF</h4>
                  <p className="text-xs text-slate-400">Gera visualização pronta para impressão ou PDF no navegador</p>
                </div>
              </div>
              <Printer className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
