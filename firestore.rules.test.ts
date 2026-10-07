/**
 * Security Rule Test Specification for AutoGastos
 * Validates Dirty Dozen rejection and ABAC enforcement
 */
export const DIRTY_DOZEN_PAYLOADS = [
  {
    name: "1. Unauthenticated Read",
    auth: null,
    operation: "get",
    path: "/expenses/exp_1",
    expected: "PERMISSION_DENIED"
  },
  {
    name: "2. Spoofed User ID on Expense Creation",
    auth: { uid: "attacker_456" },
    operation: "create",
    path: "/expenses/exp_2",
    data: {
      id: "exp_2",
      userId: "victim_user_123",
      title: "Gasolina",
      amount: 100,
      date: "2026-10-07",
      year: 2026,
      month: 10,
      category: "gasolina",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "3. Ghost Field Injection (Shadow Update)",
    auth: { uid: "user_1" },
    operation: "update",
    path: "/expenses/exp_1",
    data: { isSystemAdmin: true, amount: 200 },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "4. Cross-Tenant Vehicle Modification",
    auth: { uid: "user_attacker" },
    operation: "update",
    path: "/vehicles/veh_user_victim",
    data: { name: "Hacked" },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "5. Cross-Tenant Expense Deletion",
    auth: { uid: "user_attacker" },
    operation: "delete",
    path: "/expenses/exp_user_victim",
    expected: "PERMISSION_DENIED"
  },
  {
    name: "6. Negative Expense Amount",
    auth: { uid: "user_1" },
    operation: "create",
    path: "/expenses/exp_3",
    data: {
      id: "exp_3",
      userId: "user_1",
      title: "Fraude",
      amount: -100,
      date: "2026-10-07",
      year: 2026,
      month: 10,
      category: "gasolina",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "7. Invalid Month Boundary",
    auth: { uid: "user_1" },
    operation: "create",
    path: "/expenses/exp_4",
    data: {
      id: "exp_4",
      userId: "user_1",
      title: "Revisão",
      amount: 300,
      date: "2026-13-01",
      year: 2026,
      month: 13,
      category: "revisao",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "8. ID Poisoning Attack",
    auth: { uid: "user_1" },
    operation: "create",
    path: "/expenses/../../malicious",
    expected: "PERMISSION_DENIED"
  },
  {
    name: "9. Oversized String Payload",
    auth: { uid: "user_1" },
    operation: "create",
    path: "/expenses/exp_5",
    data: {
      id: "exp_5",
      userId: "user_1",
      title: "Gasolina",
      amount: 100,
      date: "2026-10-07",
      year: 2026,
      month: 10,
      category: "gasolina",
      notes: "A".repeat(2000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "10. Immutable Owner Tampering",
    auth: { uid: "user_1" },
    operation: "update",
    path: "/expenses/exp_1",
    data: { userId: "user_new_owner" },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "11. Profile Hijacking",
    auth: { uid: "attacker_1" },
    operation: "create",
    path: "/users/victim_1",
    data: { id: "victim_1", email: "victim@test.com" },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "12. Blanket Query Scraping",
    auth: { uid: "attacker_1" },
    operation: "list",
    path: "/expenses",
    query: { where: ["userId", "==", "victim_1"] },
    expected: "PERMISSION_DENIED"
  }
];
