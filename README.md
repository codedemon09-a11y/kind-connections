# BattleArena - Gaming Tournament Platform

A competitive esports tournament platform for BGMI and Free Fire games where players can join tournaments and win real cash prizes.

## Features

- **Tournament Management**: Create and manage gaming tournaments
- **Real-time Leaderboards**: Track player rankings and stats
- **Wallet System**: Manage deposits, withdrawals, and winnings
- **Payment Integration**: Razorpay integration for secure payments
- **Admin Dashboard**: Full admin panel for tournament and user management

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore)
- **Payments**: Razorpay

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd battlearena

# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Update `src/lib/firebase.ts` with your config
5. Set up Firestore security rules (see `docs/FIREBASE_SETUP.md`)

### Razorpay Setup

1. Create a Razorpay account at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get your API keys (test mode for development)
3. Update `src/lib/payment.ts` with your Key ID
4. See `docs/RAZORPAY_SETUP.md` for detailed instructions

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and configs
├── pages/          # Page components
│   └── admin/      # Admin dashboard pages
└── types/          # TypeScript type definitions
```

## Deployment

Build the production version:

```sh
npm run build
```

The output will be in the `dist` folder, ready for deployment to any static hosting service.

## License

MIT License
