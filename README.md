# BattleArena - Esports Tournament Platform

BattleArena is a competitive esports tournament platform for **BGMI**, **Free Fire**, and **COD Mobile**. Players can join Solo, Duo, and Squad tournaments, compete for real prizes, and withdraw winnings via UPI.

## Features

- **Tournament System** – Create and manage Solo/Duo/Squad tournaments with customizable prize tiers
- **Live Countdown Timers** – Real-time countdown on tournament cards and detail pages
- **Wallet System** – Deposit via Razorpay, earn winnings, withdraw to UPI
- **Leaderboard** – Real-time rankings based on earnings and wins from Firebase match data
- **Referral System** – Unique referral codes for each user with tracking
- **Admin Dashboard** – Full tournament management, user management, withdrawal processing, results entry & prize distribution
- **Atomic Transactions** – All balance operations use Firestore `runTransaction` for data integrity
- **Real-time Updates** – Firestore `onSnapshot` listeners for tournaments, registrations, transactions, and withdrawals
- **Push Notifications** – Browser notification support for room releases
- **Mobile Responsive** – Fully responsive design for all screen sizes

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **UI**: shadcn/ui components, Lucide icons
- **Backend**: Firebase (Auth + Firestore)
- **Payments**: Razorpay
- **Fonts**: Orbitron (display), Inter (body)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Setup

See [`setup.txt`](./setup.txt) for complete setup instructions including:
- Firebase project creation & configuration
- Firestore collections, indexes, and security rules
- Razorpay payment gateway setup
- Making a user admin
- Production deployment checklist

## Project Structure

```
src/
├── assets/          # Game images & hero banners
├── components/      # Reusable UI components
│   ├── ui/          # shadcn/ui base components
│   ├── Header.tsx   # Navigation header
│   ├── Footer.tsx   # Site footer
│   ├── TournamentCard.tsx
│   ├── CountdownTimer.tsx
│   ├── PaymentDialog.tsx
│   └── RazorpayPayment.tsx
├── contexts/        # React contexts
│   ├── AuthContext.tsx    # Firebase Auth + user profile
│   ├── DataContext.tsx    # All Firestore operations
│   └── NotificationContext.tsx
├── pages/           # Route pages
│   ├── Index.tsx
│   ├── LoginPage.tsx
│   ├── TournamentsPage.tsx
│   ├── TournamentDetailPage.tsx
│   ├── ProfilePage.tsx
│   ├── WalletPage.tsx
│   ├── LeaderboardPage.tsx
│   ├── MatchHistoryPage.tsx
│   └── admin/       # Admin panel pages
├── types/           # TypeScript interfaces
└── lib/             # Firebase & payment config
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/login` | Login / Register |
| `/tournaments` | All tournaments (filterable) |
| `/tournaments/:id` | Tournament detail & join |
| `/leaderboard` | Player rankings |
| `/profile` | User profile & stats |
| `/wallet` | Wallet & transactions |
| `/match-history` | Match history |
| `/admin` | Admin dashboard |
| `/admin/tournaments` | Manage tournaments |
| `/admin/users` | Manage users |
| `/admin/withdrawals` | Process withdrawals |

## License

Private project. All rights reserved.
