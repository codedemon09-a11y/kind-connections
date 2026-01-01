# Razorpay Payment Gateway Setup Guide

This guide provides step-by-step instructions to set up Razorpay payment gateway for the BattleArena tournament platform.

## Table of Contents

1. [Create Razorpay Account](#1-create-razorpay-account)
2. [Get API Keys](#2-get-api-keys)
3. [Update Application Code](#3-update-application-code)
4. [Set Up Webhook (Optional)](#4-set-up-webhook-optional)
5. [Payment Flow](#5-payment-flow)
6. [Testing Payments](#6-testing-payments)
7. [Going Live](#7-going-live)

---

## 1. Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Click **"Sign Up"**
3. Enter your details:
   - Email address
   - Phone number
   - Business name
   - Password
4. Verify your email and phone
5. Complete KYC verification (required for live mode)

### Account Types

- **Test Mode**: For development and testing (no real money)
- **Live Mode**: For production (real money transactions)

---

## 2. Get API Keys

### For Test Mode (Development)

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Ensure you're in **Test Mode** (toggle at top-left)
3. Go to **Settings** → **API Keys**
4. Click **"Generate Key"** (or view existing)
5. Copy both keys:
   - **Key ID**: `rzp_test_XXXXXXXXXXXX` (public - can be in frontend)
   - **Key Secret**: `XXXXXXXXXXXXXXXXXX` (private - NEVER in frontend)

### For Live Mode (Production)

1. Complete KYC verification
2. Switch to **Live Mode**
3. Go to **Settings** → **API Keys**
4. Generate Live API keys
5. Keys will look like:
   - **Key ID**: `rzp_live_XXXXXXXXXXXX`
   - **Key Secret**: `XXXXXXXXXXXXXXXXXX`

---

## 3. Update Application Code

### Step 1: Update Payment Configuration

Open file: `src/lib/payment.ts`

Update the Razorpay Key ID:

```typescript
// Razorpay Configuration
export const razorpayConfig = {
  keyId: "rzp_test_XXXXXXXXXXXX", // Replace with your Key ID
  // Secret key should NEVER be in frontend - use server-side only
};
```

### Step 2: Add Razorpay Script to HTML

Open file: `index.html`

Add this script tag in the `<head>` section:

```html
<head>
  <!-- Existing head content -->
  
  <!-- Razorpay Checkout Script -->
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
```

### Step 3: Create Payment Component

Create file: `src/components/RazorpayPayment.tsx`

```tsx
import { razorpayConfig } from '@/lib/payment';

interface RazorpayPaymentProps {
  amount: number; // Amount in INR
  tournamentId: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  userDisplayName: string;
  tournamentName: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onFailure: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const initiateRazorpayPayment = ({
  amount,
  tournamentId,
  userId,
  userEmail,
  userPhone,
  userDisplayName,
  tournamentName,
  onSuccess,
  onFailure,
}: RazorpayPaymentProps) => {
  // Check if Razorpay script is loaded
  if (typeof window.Razorpay === 'undefined') {
    onFailure('Payment gateway not loaded. Please refresh the page.');
    return;
  }

  // Validate amount
  if (amount <= 0) {
    onFailure('Invalid payment amount');
    return;
  }

  const options = {
    key: razorpayConfig.keyId,
    amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
    currency: 'INR',
    name: 'BattleArena',
    description: `Tournament Entry: ${tournamentName}`,
    image: '/favicon.ico', // Your logo
    // order_id: 'ORDER_ID_FROM_BACKEND', // Required in production - get from backend
    prefill: {
      name: userDisplayName,
      email: userEmail,
      contact: userPhone,
    },
    notes: {
      tournamentId,
      userId,
      purpose: 'Tournament Entry Fee',
    },
    theme: {
      color: '#00FFE5', // Primary brand color
      backdrop_color: 'rgba(0, 0, 0, 0.8)',
    },
    handler: function (response: {
      razorpay_payment_id: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }) {
      // Payment successful
      console.log('Payment Success:', response);
      
      // In production, you should verify the signature on backend
      // const verified = await verifyPaymentOnBackend(response);
      
      onSuccess(
        response.razorpay_payment_id, 
        response.razorpay_order_id || `order_${Date.now()}`
      );
    },
    modal: {
      ondismiss: function () {
        console.log('Payment modal closed by user');
        onFailure('Payment cancelled by user');
      },
      confirm_close: true, // Ask for confirmation before closing
      escape: true, // Allow closing with ESC key
      animation: true,
    },
    retry: {
      enabled: true,
      max_count: 3,
    },
  };

  try {
    const razorpay = new window.Razorpay(options);
    
    // Handle payment failures
    razorpay.on('payment.failed', function (response: {
      error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
          order_id?: string;
          payment_id?: string;
        };
      };
    }) {
      console.error('Payment Failed:', response.error);
      onFailure(response.error.description || 'Payment failed. Please try again.');
    });
    
    // Open Razorpay modal
    razorpay.open();
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    onFailure('Failed to initialize payment gateway. Please try again.');
  }
};

// Utility function to format amount for display
export const formatPaymentAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Check if Razorpay is available
export const isRazorpayAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined';
};

export default initiateRazorpayPayment;
```

### Step 4: Use Payment in Tournament Join

Example usage in your tournament join flow:

```tsx
import { initiateRazorpayPayment } from '@/components/RazorpayPayment';

const handleJoinTournament = () => {
  initiateRazorpayPayment({
    amount: tournament.entryFee,
    tournamentId: tournament.id,
    userId: user.id,
    userEmail: user.email,
    userPhone: user.phone,
    userDisplayName: user.displayName,
    tournamentName: tournament.name,
    onSuccess: async (paymentId, orderId) => {
      // Payment successful - register user for tournament
      await joinTournament(tournament.id, user.id);
      toast.success('Successfully joined tournament!');
    },
    onFailure: (error) => {
      toast.error(`Payment failed: ${error}`);
    },
  });
};
```

---

## 4. Set Up Webhook (Optional)

Webhooks allow Razorpay to notify your backend about payment events.

### Why Use Webhooks?

- Handle cases where user closes browser after payment
- Verify payment on server-side
- Prevent fraud

### Webhook Setup Steps

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Click **"Add New Webhook"**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/webhooks/razorpay
   ```
4. Select events to subscribe:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. Copy the **Webhook Secret**
6. Click **"Create Webhook"**

### Backend Webhook Handler (Node.js Example)

```javascript
const crypto = require('crypto');

app.post('/api/webhooks/razorpay', (req, res) => {
  const webhookSecret = 'YOUR_WEBHOOK_SECRET';
  
  const signature = req.headers['x-razorpay-signature'];
  const payload = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  
  if (signature === expectedSignature) {
    const event = req.body;
    
    switch (event.event) {
      case 'payment.captured':
        // Payment successful - update database
        const paymentId = event.payload.payment.entity.id;
        const orderId = event.payload.payment.entity.order_id;
        // Update tournament registration status
        break;
        
      case 'payment.failed':
        // Handle failed payment
        break;
    }
    
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

---

## 5. Payment Flow

### Basic Flow (Client-Side Only)

```
User clicks "Join Tournament"
         ↓
Frontend opens Razorpay modal
         ↓
User completes payment
         ↓
Frontend receives success callback
         ↓
Frontend registers user for tournament
```

### Production Flow (Recommended)

```
User clicks "Join Tournament"
         ↓
Frontend calls Backend to create order
         ↓
Backend creates Razorpay order with secret key
         ↓
Backend returns order_id to Frontend
         ↓
Frontend opens Razorpay modal with order_id
         ↓
User completes payment
         ↓
Razorpay sends webhook to Backend
         ↓
Backend verifies payment signature
         ↓
Backend updates database
         ↓
Frontend shows success message
```

---

## 6. Testing Payments

### Test Card Details

Use these test cards in **Test Mode**:

| Card Type | Card Number | CVV | Expiry |
|-----------|-------------|-----|--------|
| Mastercard | 5267 3181 8797 5449 | Any | Any future date |
| Visa | 4111 1111 1111 1111 | Any | Any future date |

### Test UPI

In test mode, use any UPI ID like: `success@razorpay`

### Test Netbanking

Select any bank - it will simulate success in test mode.

### Simulate Failures

In test mode, you can simulate failures:
- Card: Use `4000 0000 0000 0002` for declined payment
- UPI: Use `failure@razorpay`

---

## 7. Going Live

### Pre-Launch Checklist

- [ ] Complete KYC verification on Razorpay
- [ ] Get Live API keys from Razorpay dashboard
- [ ] Update `razorpayConfig.keyId` to live key
- [ ] Store secret key securely on backend
- [ ] Set up webhooks with production URL
- [ ] Test with real payment (small amount)
- [ ] Set up refund process

### Update Payment Config for Production

```typescript
export const razorpayConfig = {
  keyId: "rzp_live_XXXXXXXXXXXX", // Your LIVE Key ID
};
```

### Important Production Notes

1. **Never expose secret key** in frontend code
2. **Always verify payments** on backend before confirming registration
3. **Implement refund logic** for cancelled tournaments
4. **Log all transactions** for accounting
5. **Handle webhook failures** with retry logic

---

## Troubleshooting

### "Script not loaded" Error

Ensure Razorpay script is added to `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### "Invalid Key" Error

- Verify you're using the correct key for the mode (test/live)
- Check for typos in the key
- Ensure key is not revoked in dashboard

### "Order ID Invalid" Error

- Order ID must be created via Razorpay API
- Order ID expires after 30 minutes
- Order ID can only be used once

### Payment Stuck in "Pending"

- Check webhook is configured correctly
- Verify webhook URL is accessible
- Check backend logs for errors

---

## Configuration Summary

### Files to Update

| File | What to Change |
|------|----------------|
| `src/lib/payment.ts` | Replace `keyId` with your Razorpay Key ID |
| `index.html` | Add Razorpay checkout script |
| Backend (if any) | Add webhook handler and secret key |

### Razorpay Keys (Keep These Safe!)

```
TEST MODE:
Key ID: rzp_test_XXXXXXXXXXXX
Key Secret: XXXXXXXXXXXXXXXXXX (NEVER put in frontend!)

LIVE MODE:
Key ID: rzp_live_XXXXXXXXXXXX  
Key Secret: XXXXXXXXXXXXXXXXXX (NEVER put in frontend!)
```

---

## Support

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Support](https://razorpay.com/support/)
- [Integration Guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
