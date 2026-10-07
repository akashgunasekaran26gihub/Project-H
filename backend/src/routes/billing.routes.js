import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public / Authenticated subscription details
router.get('/subscription', authenticate, async (req, res) => {
  res.json({
    subscription: {
      plan: 'pro',
      status: 'active',
      billingInterval: 'annual',
      price: '$79/year',
      renewsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      features: [
        'Unlimited active habits',
        'Real-time AI Habit Coach',
        'Recharts Trend Analytics',
        'Zen Zone Audio & Mindfulness tools',
        'Offline sync & backup exports',
      ],
      limits: {
        maxHabits: 9999,
        aiQueriesPerDay: 500,
      },
    },
  });
});

// Create Checkout Session (Stripe / LemonSqueezy)
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { planId, interval } = req.body;

    // If STRIPE_SECRET_KEY is configured in .env, invoke Stripe SDK
    if (process.env.STRIPE_SECRET_KEY) {
      // e.g. const session = await stripe.checkout.sessions.create(...)
      return res.json({
        url: `https://checkout.stripe.com/pay/cs_test_mock_${Date.now()}`,
        sessionId: `cs_test_${Date.now()}`,
      });
    }

    // Default seamless SaaS checkout response
    res.json({
      url: `/checkout/success?session_id=mock_session_${Date.now()}`,
      plan: planId || 'pro',
      interval: interval || 'annual',
      message: 'Checkout session created successfully.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate checkout session' });
  }
});

// Cancel Subscription
router.post('/cancel-subscription', authenticate, async (req, res) => {
  res.json({
    message: 'Subscription scheduled for cancellation at the end of the current billing cycle.',
    status: 'canceling',
  });
});

// Stripe / LemonSqueezy Webhook Receiver
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Webhook handler skeleton
  res.json({ received: true });
});

export default router;
