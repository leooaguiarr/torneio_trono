# Security Specification: Torneio do Trono

## 1. Data Invariants
- Participants must have non-empty name (max 60 chars), valid emoji avatar (max 10 chars), color token, and valid creation timestamp.
- Poop entries must belong to a valid participant ID, have an effortLevel between 1 and 5, a valid ISO timestamp, optional duration <= 300 minutes, optional location tag, and notes under 200 characters.
- System denies access to unspecified paths.

## 2. The Dirty Dozen Payloads (Target Test Payloads)
1. Write to unknown collection `/superadmin/hack` -> DENIED
2. Create participant with empty name or name > 60 chars -> DENIED
3. Create participant with missing required fields -> DENIED
4. Create entry with effortLevel = 99 -> DENIED
5. Create entry with effortLevel = -1 or non-integer -> DENIED
6. Create entry with 10KB junk text in notes -> DENIED
7. Modify immutable fields (`id`, `createdAt`) on participant -> DENIED
8. Delete entry with malformed path variable -> DENIED
9. Entry with duration > 300 minutes -> DENIED
10. Entry missing participantId -> DENIED
11. Injection payload into participant ID -> DENIED
12. Bulk unauthenticated document destruction -> DENIED
