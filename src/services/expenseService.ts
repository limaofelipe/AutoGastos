import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  orderBy,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Expense, Vehicle } from '../types';

export const subscribeToExpenses = (
  userId: string,
  onUpdate: (expenses: Expense[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  const collectionPath = 'expenses';
  const q = query(
    collection(db, collectionPath),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Expense);
      });
      // Sort client-side by date descending
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(list);
    },
    (error) => {
      console.error('Error onSnapshot expenses:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
};

export const subscribeToVehicles = (
  userId: string,
  onUpdate: (vehicles: Vehicle[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  const collectionPath = 'vehicles';
  const q = query(
    collection(db, collectionPath),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Vehicle[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Vehicle);
      });
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      onUpdate(list);
    },
    (error) => {
      console.error('Error onSnapshot vehicles:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
};

function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

export const saveVehicle = async (vehicle: Vehicle): Promise<void> => {
  const path = `vehicles/${vehicle.id}`;
  try {
    const docRef = doc(db, 'vehicles', vehicle.id);
    const cleanVehicle = sanitizeForFirestore(vehicle);
    await setDoc(docRef, cleanVehicle, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  const path = `vehicles/${vehicleId}`;
  try {
    const docRef = doc(db, 'vehicles', vehicleId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveExpense = async (expense: Expense): Promise<void> => {
  const path = `expenses/${expense.id}`;
  try {
    const docRef = doc(db, 'expenses', expense.id);
    const cleanExpense = sanitizeForFirestore(expense);
    await setDoc(docRef, cleanExpense, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  const path = `expenses/${expenseId}`;
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const seedSampleData = async (userId: string, currentYear: number): Promise<void> => {
  const vehicleId = `veh_${Date.now()}`;
  const now = new Date().toISOString();
  
  const sampleVehicle: Vehicle = {
    id: vehicleId,
    userId,
    name: 'Chevrolet Onix 1.0 Turbo',
    plate: 'ABC-1D23',
    year: currentYear - 2,
    initialKm: 32000,
    currentKm: 46600,
    fuelType: 'Flex (Gasolina / Etanol)',
    createdAt: now,
    updatedAt: now,
  };

  const sampleExpensesData: Omit<Expense, 'id' | 'userId' | 'vehicleId' | 'createdAt' | 'updatedAt'>[] = [
    {
      date: `${currentYear}-01-15`,
      year: currentYear,
      month: 1,
      category: 'ipva_taxas',
      title: 'IPVA 2026 - Parcela Única com desconto',
      amount: 1450.00,
      paymentMethod: 'pix',
      location: 'Detran Online',
      notes: 'Pago com 3% de desconto em cota única'
    },
    {
      date: `${currentYear}-01-20`,
      year: currentYear,
      month: 1,
      category: 'gasolina',
      title: 'Gasolina Comum (Tanque Cheio)',
      amount: 245.50,
      odometerKm: 43200,
      liters: 42.5,
      pricePerLiter: 5.77,
      paymentMethod: 'cartao_credito',
      location: 'Posto Shell Radial'
    },
    {
      date: `${currentYear}-02-10`,
      year: currentYear,
      month: 2,
      category: 'gasolina',
      title: 'Gasolina Aditivada V-Power',
      amount: 236.00,
      odometerKm: 43720,
      liters: 40.0,
      pricePerLiter: 5.90,
      paymentMethod: 'cartao_credito',
      location: 'Posto Shell Centro'
    },
    {
      date: `${currentYear}-02-28`,
      year: currentYear,
      month: 2,
      category: 'lavagem',
      title: 'Ducha Completa + Aspiração e Cera',
      amount: 80.00,
      paymentMethod: 'pix',
      location: 'Lava-Rápido Brilho Car'
    },
    {
      date: `${currentYear}-03-05`,
      year: currentYear,
      month: 3,
      category: 'gasolina',
      title: 'Gasolina Comum',
      amount: 240.70,
      odometerKm: 44250,
      liters: 41.5,
      pricePerLiter: 5.80,
      paymentMethod: 'cartao_debito',
      location: 'Posto Ipiranga'
    },
    {
      date: `${currentYear}-03-18`,
      year: currentYear,
      month: 3,
      category: 'mecanico',
      title: 'Troca de Óleo Sintético 5W30 + Filtros (Óleo, Ar e Combustível)',
      amount: 420.00,
      odometerKm: 44400,
      paymentMethod: 'cartao_credito',
      location: 'Oficina Mecânica Precision Auto',
      notes: 'Óleo recomendado pelo manual. Próxima troca em 54.400 km'
    },
    {
      date: `${currentYear}-04-02`,
      year: currentYear,
      month: 4,
      category: 'gasolina',
      title: 'Gasolina Comum',
      amount: 232.00,
      odometerKm: 44770,
      liters: 40.0,
      pricePerLiter: 5.80,
      paymentMethod: 'pix',
      location: 'Posto Petrobras'
    },
    {
      date: `${currentYear}-04-14`,
      year: currentYear,
      month: 4,
      category: 'seguro',
      title: 'Seguro Auto Anual - Parcela 1/4',
      amount: 520.00,
      paymentMethod: 'cartao_credito',
      location: 'Porto Seguro'
    },
    {
      date: `${currentYear}-05-08`,
      year: currentYear,
      month: 5,
      category: 'reparo',
      title: 'Substituição das Pastilhas de Freio Dianteiras e Sangria',
      amount: 380.00,
      odometerKm: 45100,
      paymentMethod: 'cartao_credito',
      location: 'Centro Automotivo Freios & Cia',
      notes: 'Disco em bom estado, trocadas apenas as pastilhas Fras-le'
    },
    {
      date: `${currentYear}-05-22`,
      year: currentYear,
      month: 5,
      category: 'gasolina',
      title: 'Gasolina Comum',
      amount: 245.70,
      odometerKm: 45310,
      liters: 42.0,
      pricePerLiter: 5.85,
      paymentMethod: 'cartao_credito',
      location: 'Posto Shell'
    },
    {
      date: `${currentYear}-06-12`,
      year: currentYear,
      month: 6,
      category: 'pneus',
      title: 'Alinhamento 3D + Balanceamento 4 Rodas + Rodízio de Pneus',
      amount: 160.00,
      odometerKm: 45700,
      paymentMethod: 'pix',
      location: 'Dpaschoal Centro'
    },
    {
      date: `${currentYear}-06-25`,
      year: currentYear,
      month: 6,
      category: 'gasolina',
      title: 'Gasolina Aditivada',
      amount: 240.00,
      odometerKm: 45830,
      liters: 40.0,
      pricePerLiter: 6.00,
      paymentMethod: 'cartao_credito',
      location: 'Posto Ipiranga'
    },
    {
      date: `${currentYear}-07-10`,
      year: currentYear,
      month: 7,
      category: 'estacionamento',
      title: 'Estacionamento Aeroporto (3 diárias) + Pedágios',
      amount: 195.00,
      paymentMethod: 'cartao_credito',
      location: 'Estapar Aeroporto'
    },
    {
      date: `${currentYear}-08-15`,
      year: currentYear,
      month: 8,
      category: 'gasolina',
      title: 'Gasolina Comum',
      amount: 246.00,
      odometerKm: 46340,
      liters: 41.0,
      pricePerLiter: 6.00,
      paymentMethod: 'pix',
      location: 'Posto Shell'
    },
    {
      date: `${currentYear}-09-04`,
      year: currentYear,
      month: 9,
      category: 'revisao',
      title: 'Revisão de Ar-Condicionado (Higienização + Filtro de Cabine)',
      amount: 140.00,
      odometerKm: 46600,
      paymentMethod: 'pix',
      location: 'Climatização AutoFrio'
    }
  ];

  // Save vehicle
  await saveVehicle(sampleVehicle);

  // Save sample expenses using writeBatch or sequential saves
  const batch = writeBatch(db);
  sampleExpensesData.forEach((exp, index) => {
    const expenseId = `exp_sample_${Date.now()}_${index}`;
    const docRef = doc(db, 'expenses', expenseId);
    const fullExpense: Expense = {
      ...exp,
      id: expenseId,
      userId,
      vehicleId,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(docRef, fullExpense);
  });

  await batch.commit();
};
