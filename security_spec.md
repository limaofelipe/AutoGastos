# Security Specification & Threat Model for AutoGastos

## 1. Data Invariants
1. **User Identity Invariant**: A user can only read, create, update, or delete their own vehicles and expenses (`userId == request.auth.uid`).
2. **User Profile Invariant**: The user document `/users/{userId}` can only be written by the authenticated user with matching `request.auth.uid`.
3. **Data Boundary Invariant**: Expense amounts must be positive numbers (`amount > 0`). Titles and categories must be non-empty strings within reasonable bounds.
4. **Temporal Invariant**: The `year` and `month` fields must correspond to valid calendar ranges (`month >= 1 && month <= 12`, `year >= 1990 && year <= 2100`).
5. **No Cross-User Access**: Unauthenticated users or third-party authenticated users cannot list or read other users' records.
6. **Immutable Fields**: `id` and `userId` cannot be mutated on update.

## 2. The "Dirty Dozen" Payloads (Must be rejected with PERMISSION_DENIED)
1. **Unauthenticated Read**: Attempting to list `/expenses` without `request.auth`.
2. **Spoofed User ID on Expense Creation**: Payload with `userId: "victim_user_123"` sent by `request.auth.uid = "attacker_456"`.
3. **Ghost Field Injection (Shadow Update)**: Updating expense with `{ isSystemAdmin: true, amount: 150 }`.
4. **Cross-Tenant Vehicle Modification**: User A attempting to update or delete User B's `/vehicles/{vehicleId}`.
5. **Cross-Tenant Expense Deletion**: User A attempting to delete User B's `/expenses/{expenseId}`.
6. **Negative Expense Amount**: Sending `{ amount: -500, title: "Fraude de Combustível" }`.
7. **Invalid Month Boundary**: Sending `{ month: 13, year: 2026 }` or `{ month: 0 }`.
8. **ID Poisoning Attack**: Submitting an expense or vehicle ID containing injection payload `../../malicious`.
9. **Oversized String Payload (Denial of Wallet)**: Submitting a `notes` field of 500,000 characters.
10. **Immutable Owner Tampering**: Trying to change `userId` on existing expense during an update.
11. **Profile Hijacking**: User A attempting to write `/users/victim_user_id`.
12. **Blanket Query Scraping**: Attempting an unscoped collection query without matching `userId == request.auth.uid`.

## 3. Test Runner Specification
The test file `firestore.rules.test.ts` outlines security validations covering user segregation, type integrity, and field immutability.
