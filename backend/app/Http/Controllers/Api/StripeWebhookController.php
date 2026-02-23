<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    protected StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Handle Stripe webhooks.
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Invalid signature',
            ], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event->data->object);
                break;

            case 'customer.subscription.created':
                $this->handleSubscriptionCreated($event->data->object);
                break;

            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event->data->object);
                break;

            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;

            case 'invoice.payment_succeeded':
                $this->handleInvoicePaymentSucceeded($event->data->object);
                break;

            case 'invoice.payment_failed':
                $this->handleInvoicePaymentFailed($event->data->object);
                break;

            default:
                Log::info('Unhandled Stripe webhook event', [
                    'type' => $event->type,
                ]);
        }

        return response()->json(['received' => true]);
    }

    /**
     * Handle payment intent succeeded.
     */
    protected function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($payment) {
            $payment->update([
                'status' => 'completed',
                'transaction_id' => $paymentIntent->id,
            ]);

            // Process featured listing if applicable
            if ($payment->type === 'featured_listing' && $payment->property_id) {
                $property = Property::find($payment->property_id);
                if ($property) {
                    $durationDays = $payment->metadata['duration_days'] ?? 30;
                    $property->update(['is_featured' => true]);
                    // Store featured expiration in metadata if you have that column
                }
            }

            Log::info('Payment completed via webhook', [
                'payment_id' => $payment->id,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        }
    }

    /**
     * Handle payment intent failed.
     */
    protected function handlePaymentIntentFailed($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($payment) {
            $payment->update([
                'status' => 'failed',
            ]);

            Log::info('Payment failed via webhook', [
                'payment_id' => $payment->id,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        }
    }

    /**
     * Handle subscription created.
     */
    protected function handleSubscriptionCreated($subscription): void
    {
        $subscriptionModel = Subscription::where('stripe_subscription_id', $subscription->id)->first();

        if (!$subscriptionModel) {
            // Subscription might be created via webhook before our record exists
            Log::info('Subscription created via webhook but not found in database', [
                'stripe_subscription_id' => $subscription->id,
            ]);
        } else {
            $subscriptionModel->update([
                'status' => 'active',
                'ends_at' => \Carbon\Carbon::createFromTimestamp($subscription->current_period_end),
            ]);
        }
    }

    /**
     * Handle subscription updated.
     */
    protected function handleSubscriptionUpdated($subscription): void
    {
        $subscriptionModel = Subscription::where('stripe_subscription_id', $subscription->id)->first();

        if ($subscriptionModel) {
            $status = match ($subscription->status) {
                'active' => 'active',
                'canceled', 'unpaid', 'past_due' => 'cancelled',
                default => 'expired',
            };

            $subscriptionModel->update([
                'status' => $status,
                'ends_at' => \Carbon\Carbon::createFromTimestamp($subscription->current_period_end),
                'auto_renew' => !$subscription->cancel_at_period_end,
            ]);
        }
    }

    /**
     * Handle subscription deleted.
     */
    protected function handleSubscriptionDeleted($subscription): void
    {
        $subscriptionModel = Subscription::where('stripe_subscription_id', $subscription->id)->first();

        if ($subscriptionModel) {
            $subscriptionModel->update([
                'status' => 'cancelled',
                'auto_renew' => false,
            ]);
        }
    }

    /**
     * Handle invoice payment succeeded.
     */
    protected function handleInvoicePaymentSucceeded($invoice): void
    {
        // Handle recurring subscription payment
        if (isset($invoice->subscription)) {
            $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();

            if ($subscription) {
                // Extend subscription period
                $subscription->update([
                    'ends_at' => \Carbon\Carbon::createFromTimestamp($invoice->period_end),
                ]);

                // Create payment record for recurring payment
                Payment::create([
                    'user_id' => $subscription->user_id,
                    'type' => 'subscription',
                    'amount' => $invoice->amount_paid / 100,
                    'currency' => strtoupper($invoice->currency),
                    'status' => 'completed',
                    'transaction_id' => $invoice->id,
                    'stripe_payment_intent_id' => $invoice->payment_intent ?? null,
                    'metadata' => [
                        'subscription_id' => $subscription->id,
                        'invoice_id' => $invoice->id,
                    ],
                ]);
            }
        }
    }

    /**
     * Handle invoice payment failed.
     */
    protected function handleInvoicePaymentFailed($invoice): void
    {
        if (isset($invoice->subscription)) {
            $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();

            if ($subscription) {
                Log::warning('Subscription payment failed', [
                    'subscription_id' => $subscription->id,
                    'invoice_id' => $invoice->id,
                ]);

                // You might want to send a notification to the user here
            }
        }
    }
}
