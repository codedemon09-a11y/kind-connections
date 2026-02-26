
# Fix Issues and Create Setup Guide

## Issues Found

1. **RazorpayPayment.tsx references `/favicon.ico`** (deleted) -- should use `/favicon.png`
2. **`distributePrizes` is not atomic** -- uses sequential `getDoc`/`updateDoc` per user instead of transactions, risking race conditions on `winningCredits`
3. **`addTournamentResult` is also not atomic** -- same sequential read-then-write pattern
4. **Leaderboard "wins" tab shows wrong data** -- both tabs render `currentData` which changes based on `activeTab`, but the "wins" `TabsContent` still uses `currentData` from the parent scope which is correct; however the podium always uses `sortedByEarnings` which is fine. No actual bug here.
5. **Composite index required for Firestore** -- `transactions` query uses `where('userId', '==', ...)` + `orderBy('createdAt', 'desc')` which needs a composite index (users may see console errors about missing indexes)
6. **Missing Footer on LeaderboardPage** -- no `<Footer />` component rendered
7. **No `setup.txt` file** exists for new developers

## Plan

### 1. Fix favicon reference in RazorpayPayment.tsx
- Change `image: '/favicon.ico'` to `image: '/favicon.png'` on line 50

### 2. Make `distributePrizes` atomic with `runTransaction`
- Refactor the loop in `distributePrizes` to use `runTransaction` per user (or batch) so `winningCredits` updates are atomic (read-then-write inside transaction)
- Same fix for `addTournamentResult`

### 3. Add Footer to LeaderboardPage
- Import and render `<Footer />` at the bottom

### 4. Create `setup.txt`
A comprehensive plain-text setup guide covering:
- Prerequisites (Node.js, npm/bun)
- Firebase project creation and configuration
- Firestore collections needed: `users`, `tournaments`, `registrations`, `transactions`, `matchResults`, `withdrawals`, `paymentTransactions`
- Required Firestore composite indexes (userId + createdAt for transactions, matchResults, etc.)
- Firestore security rules (copy from existing docs)
- Firebase Auth setup (Email/Password)
- Razorpay integration steps
- How to make a user admin
- Environment/config files to update (`src/lib/firebase.ts`, `src/lib/payment.ts`)
- How to run the project locally
- Production deployment checklist

## Technical Details

### Files to modify:
- `src/components/RazorpayPayment.tsx` -- fix favicon path (line 50)
- `src/contexts/DataContext.tsx` -- make `addTournamentResult` and `distributePrizes` use `runTransaction` for atomic credit updates
- `src/pages/LeaderboardPage.tsx` -- add Footer import and render

### Files to create:
- `setup.txt` -- comprehensive setup guide with all Firebase, Razorpay, and project configuration instructions
