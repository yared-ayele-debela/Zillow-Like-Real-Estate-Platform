<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\SubscriptionPlan;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Create a subscription.
     */
    public function createSubscription(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan' => 'required|string|exists:subscription_plans,slug',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Check if user already has an active subscription
        $existingSubscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->first();

        if ($existingSubscription) {
            return response()->json([
                'message' => 'You already have an active subscription',
                'subscription' => $existingSubscription,
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Get or create Stripe customer
            $customerResult = $this->paymentService->getOrCreateCustomer(
                $user->id,
                $user->email,
                $user->name
            );

            if (!$customerResult['success']) {
                throw new \Exception('Failed to create customer: ' . $customerResult['error']);
            }

            $customerId = $customerResult['customer_id'];

            // Get plan price ID
            $plan = SubscriptionPlan::where('slug', $request->plan)
                ->where('is_active', true)
                ->first();

            if (!$plan) {
                throw new \Exception('Selected plan is not active');
            }

            $priceId = $plan->stripe_price_id ?: $this->paymentService->getPlanPriceId($request->plan);

            if (!$priceId) {
                throw new \Exception('Plan price ID not configured');
            }

            // Create Stripe subscription
            $subscriptionResult = $this->paymentService->createSubscription(
                $customerId,
                $priceId,
                [
                    'user_id' => $user->id,
                    'plan' => $request->plan,
                ]
            );

            if (!$subscriptionResult['success']) {
                throw new \Exception('Failed to create subscription: ' . $subscriptionResult['error']);
            }

            $stripeSubscription = $subscriptionResult['subscription'];

            // Create subscription record
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan' => $request->plan,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => Carbon::createFromTimestamp($stripeSubscription->current_period_end),
                'auto_renew' => true,
                'stripe_subscription_id' => $stripeSubscription->id,
                'stripe_customer_id' => $customerId,
            ]);

            // Create payment record
            $amount = $this->paymentService->getPlanAmount($request->plan);
            Payment::create([
                'user_id' => $user->id,
                'type' => 'subscription',
                'amount' => $amount,
                'currency' => 'USD',
                'status' => 'completed',
                'stripe_payment_intent_id' => $stripeSubscription->latest_invoice->payment_intent ?? null,
                'transaction_id' => $stripeSubscription->id,
                'metadata' => [
                    'subscription_id' => $subscription->id,
                    'plan' => $request->plan,
                ],
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Subscription created successfully',
                'subscription' => $subscription,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Subscription creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'message' => 'Failed to create subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel a subscription.
     */
    public function cancelSubscription(Request $request, string $id)
    {
        $user = $request->user();
        $subscription = Subscription::findOrFail($id);

        // Check ownership
        if ($subscription->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            if ($subscription->stripe_subscription_id) {
                $cancelResult = $this->paymentService->cancelSubscription(
                    $subscription->stripe_subscription_id,
                    false // Cancel at period end
                );

                if (!$cancelResult['success']) {
                    throw new \Exception('Failed to cancel subscription: ' . $cancelResult['error']);
                }
            }

            $subscription->update([
                'status' => 'cancelled',
                'auto_renew' => false,
            ]);

            return response()->json([
                'message' => 'Subscription cancelled successfully',
                'subscription' => $subscription->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Subscription cancellation failed', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscription->id,
            ]);

            return response()->json([
                'message' => 'Failed to cancel subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current subscription.
     */
    public function getCurrentSubscription(Request $request)
    {
        $user = $request->user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->latest()
            ->first();

        return response()->json([
            'subscription' => $subscription,
            'has_active_subscription' => $subscription !== null,
        ]);
    }

    /**
     * Check subscription status.
     */
    public function checkSubscription(Request $request)
    {
        $user = $request->user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'has_subscription' => false,
                'is_active' => false,
            ]);
        }

        // Check if expired
        if ($subscription->ends_at->isPast()) {
            $subscription->update(['status' => 'expired']);
            return response()->json([
                'has_subscription' => true,
                'is_active' => false,
                'subscription' => $subscription->fresh(),
            ]);
        }

        return response()->json([
            'has_subscription' => true,
            'is_active' => true,
            'subscription' => $subscription,
            'days_remaining' => $subscription->ends_at->diffInDays(now()),
        ]);
    }
}
