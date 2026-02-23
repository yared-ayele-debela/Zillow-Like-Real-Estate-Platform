import { useEffect, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import paymentService from '../services/paymentService';
import PaymentForm from '../components/payment/PaymentForm';

const Subscription = () => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSubscription();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await paymentService.getSubscriptionPlans();
      setPlans(data || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  };

  const checkSubscription = async () => {
    try {
      setChecking(true);
      const data = await paymentService.checkSubscription();
      setCurrentSubscription(data.subscription);
    } catch (err) {
      console.error('Failed to check subscription:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleSubscribe = async (plan) => {
    setSelectedPlan(plan);
    setLoading(true);
    try {
      const data = await paymentService.createSubscription(plan);
      
      // If subscription requires payment, show payment form
      if (data.client_secret) {
        const selected = plans.find((p) => p.slug === plan);
        setPaymentData({
          clientSecret: data.client_secret,
          amount: data.amount || Number(selected?.price || 0),
          currency: 'USD',
        });
        setShowPaymentForm(true);
      } else {
        // Subscription created successfully
        alert('Subscription activated successfully!');
        checkSubscription();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await paymentService.cancelSubscription(currentSubscription.id);
      alert('Subscription cancelled successfully');
      checkSubscription();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription Plans</h1>

        {/* Current Subscription */}
        {currentSubscription && currentSubscription.status === 'active' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Current Subscription: {currentSubscription.plan.charAt(0).toUpperCase() + currentSubscription.plan.slice(1)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Expires: {new Date(currentSubscription.ends_at).toLocaleDateString()}
                </p>
                {currentSubscription.ends_at && (
                  <p className="text-sm text-gray-600">
                    {Math.max(0, Math.ceil((new Date(currentSubscription.ends_at) - new Date()) / (1000 * 60 * 60 * 24)))} days remaining
                  </p>
                )}
              </div>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan === plan.slug && currentSubscription?.status === 'active';
            const isSelected = selectedPlan === plan.slug;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg p-6 relative ${
                  plan.sort_order === 2 ? 'ring-2 ring-indigo-600' : ''
                } ${isCurrentPlan ? 'bg-indigo-50' : ''}`}
              >
                {plan.sort_order === 2 && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                )}
                {isCurrentPlan && (
                  <span className="absolute top-4 right-4 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Current Plan
                  </span>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {(plan.features || []).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.slug)}
                    disabled={loading}
                    className={`w-full px-4 py-2 rounded-md font-medium transition ${
                      plan.sort_order === 2
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading && isSelected ? 'Processing...' : 'Subscribe'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment Form Modal */}
        {paymentData && (
          <PaymentForm
            isOpen={showPaymentForm}
            onClose={() => {
              setShowPaymentForm(false);
              setPaymentData(null);
            }}
            clientSecret={paymentData.clientSecret}
            amount={paymentData.amount}
            currency={paymentData.currency}
            onSuccess={() => {
              setShowPaymentForm(false);
              setPaymentData(null);
              alert('Subscription activated successfully!');
              checkSubscription();
            }}
            onError={(err) => {
              console.error('Payment error:', err);
              alert('Payment failed. Please try again.');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Subscription;
