import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Zap } from 'lucide-react';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const calculatePrice = (monthlyPrice: number) => {
    if (isAnnual) {
      const annualPrice = monthlyPrice * 12 * 0.8; // 20% discount for annual
      return Math.round(annualPrice / 12);
    }
    return monthlyPrice;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Interview Preparation Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get unlimited access to AI-powered interview practice and real-time feedback
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative mx-4 flex h-6 w-12 items-center rounded-full bg-purple-600 focus:outline-none"
            >
              <div
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Annual
              <span className="ml-2 inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Plan</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <ul className="space-y-4">
                <PricingFeature text="1 AI interview session" />
                <PricingFeature text="Basic question bank" />
                <PricingFeature text="Standard feedback" />
                <PricingFeature text="Email support" />
              </ul>
            </div>
            <div className="px-8 pb-8">
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 rounded-bl-lg flex items-center space-x-1">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Popular</span>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro Plan</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-bold text-gray-900">${calculatePrice(59)}</span>
                <span className="text-gray-500 ml-2">/month</span>
                {isAnnual && (
                  <span className="ml-2 text-sm text-green-600">
                    Save ${Math.round(59 * 12 * 0.2)} yearly
                  </span>
                )}
              </div>
              <ul className="space-y-4">
                <PricingFeature text="Unlimited AI interview sessions" />
                <PricingFeature text="Advanced question bank" />
                <PricingFeature text="Detailed performance analytics" />
                <PricingFeature text="Real-time feedback" />
                <PricingFeature text="Custom interview scenarios" />
                <PricingFeature text="Priority support" />
              </ul>
            </div>
            <div className="px-8 pb-8">
              <Link
                to="/signup?plan=pro"
                className="block w-full text-center px-6 py-3 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-700 transition-colors"
              >
                Start Pro Trial
              </Link>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-bold text-gray-900">${calculatePrice(99)}</span>
                <span className="text-gray-500 ml-2">/month</span>
                {isAnnual && (
                  <span className="ml-2 text-sm text-green-600">
                    Save ${Math.round(99 * 12 * 0.2)} yearly
                  </span>
                )}
              </div>
              <ul className="space-y-4">
                <PricingFeature text="Everything in Pro" />
                <PricingFeature text="Custom AI model training" />
                <PricingFeature text="Team management" />
                <PricingFeature text="API access" />
                <PricingFeature text="SSO integration" />
                <PricingFeature text="24/7 dedicated support" />
                <PricingFeature text="Custom branding" />
              </ul>
            </div>
            <div className="px-8 pb-8">
              <Link
                to="/contact-sales"
                className="block w-full text-center px-6 py-3 bg-gray-900 rounded-lg text-white font-medium hover:bg-gray-800 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-4 px-4 font-medium text-gray-500">Features</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-500">Free</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-500">Pro</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-500">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  feature="AI Interview Sessions"
                  free="1 session"
                  pro="Unlimited"
                  enterprise="Unlimited"
                />
                <ComparisonRow
                  feature="Question Bank"
                  free="Basic"
                  pro="Advanced"
                  enterprise="Custom"
                />
                <ComparisonRow
                  feature="Real-time Feedback"
                  free="Basic"
                  pro="Advanced"
                  enterprise="Custom AI"
                />
                <ComparisonRow
                  feature="Analytics"
                  free="Basic"
                  pro="Advanced"
                  enterprise="Custom"
                />
                <ComparisonRow
                  feature="Support"
                  free="Email"
                  pro="Priority"
                  enterprise="24/7 Dedicated"
                />
                <ComparisonRow
                  feature="Team Management"
                  free="—"
                  pro="—"
                  enterprise={<Check className="h-5 w-5 text-green-500 mx-auto" />}
                />
                <ComparisonRow
                  feature="API Access"
                  free="—"
                  pro="—"
                  enterprise={<Check className="h-5 w-5 text-green-500 mx-auto" />}
                />
                <ComparisonRow
                  feature="Custom Branding"
                  free="—"
                  pro="—"
                  enterprise={<Check className="h-5 w-5 text-green-500 mx-auto" />}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FaqItem
              question="How does the free trial work?"
              answer="Start with our 14-day free trial of the Pro plan. You'll get full access to all Pro features and can cancel anytime before the trial ends."
            />
            <FaqItem
              question="Can I switch plans later?"
              answer="Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
            />
            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, PayPal, and offer invoice payment for Enterprise customers."
            />
            <FaqItem
              question="Is there a long-term commitment?"
              answer="No, all plans are month-to-month with no long-term commitment required. You can cancel anytime."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PricingFeature: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-center space-x-3">
    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
    <span className="text-gray-600">{text}</span>
  </li>
);

const ComparisonRow: React.FC<{
  feature: string;
  free: React.ReactNode;
  pro: React.ReactNode;
  enterprise: React.ReactNode;
}> = ({ feature, free, pro, enterprise }) => (
  <tr className="border-b border-gray-100">
    <td className="py-4 px-4 text-gray-900">{feature}</td>
    <td className="py-4 px-4 text-center text-gray-600">{free}</td>
    <td className="py-4 px-4 text-center text-gray-600">{pro}</td>
    <td className="py-4 px-4 text-center text-gray-600">{enterprise}</td>
  </tr>
);

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{question}</h3>
    <p className="text-gray-600">{answer}</p>
  </div>
);

export default Pricing;