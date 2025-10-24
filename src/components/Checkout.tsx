import React, { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useReferrals } from '../hooks/useReferrals';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
  referralInfo?: {
    referralCode: string;
    affiliateName: string;
    affiliateId: string;
  } | null;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack, referralInfo }) => {
  const { paymentMethods } = usePaymentMethods();
  const { addOrder } = useReferrals();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('dine-in');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  // Dine-in specific state
  const [partySize, setPartySize] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    
    const timeInfo = serviceType === 'pickup' 
      ? (pickupTime === 'custom' ? customTime : `${pickupTime} minutes`)
      : '';
    
    const dineInInfo = serviceType === 'dine-in' 
      ? `👥 Party Size: ${partySize} person${partySize !== 1 ? 's' : ''}`
      : '';
    
    const orderDetails = `
🛒 Sweet Quest ORDER

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}
📍 Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `🏠 Address: ${address}${landmark ? `\n🗺️ Landmark: ${landmark}` : ''}` : ''}
${serviceType === 'pickup' ? `⏰ Pickup Time: ${timeInfo}` : ''}
${serviceType === 'dine-in' ? dineInInfo : ''}


📋 ORDER DETAILS:
${cartItems.map(item => {
  let itemDetails = `• ${item.name}`;
  if (item.selectedVariation) {
    itemDetails += ` (${item.selectedVariation.name})`;
  }
  if (item.selectedAddOns && item.selectedAddOns.length > 0) {
    itemDetails += ` + ${item.selectedAddOns.map(addOn => 
      addOn.quantity && addOn.quantity > 1 
        ? `${addOn.name} x${addOn.quantity}`
        : addOn.name
    ).join(', ')}`;
  }
  itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
  return itemDetails;
}).join('\n')}

💰 TOTAL: ₱${totalPrice}
${serviceType === 'delivery' ? `🛵 DELIVERY FEE:` : ''}

${referralInfo ? `👥 Referred by: ${referralInfo.affiliateName} (${referralInfo.referralCode})` : ''}

💳 Payment: ${selectedPaymentMethod?.name || paymentMethod}
📸 Payment Screenshot: Please attach your payment receipt screenshot

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this order to proceed. Thank you for choosing Sweet Quest! 🍯
    `.trim();

    try {
      // Save order to database (matching existing table structure)
      const orderData = {
        customer_name: customerName,
        contact_number: contactNumber,
        service_type: serviceType,
        total: totalPrice,
        payment_method: selectedPaymentMethod?.name || paymentMethod,
        reference_number: undefined,
        notes: notes || undefined,
        delivery_address: serviceType === 'delivery' ? address : undefined,
        pickup_time: serviceType === 'pickup' ? timeInfo : undefined,
        party_size: serviceType === 'dine-in' ? partySize : undefined,
        status: 'pending' as const,
        // Add referral tracking fields
        referred_by: referralInfo?.affiliateName || undefined,
        referral_code: referralInfo?.referralCode || undefined,
        affiliate_id: referralInfo?.affiliateId || undefined
      };

      console.log('Attempting to save order:', orderData);
      await addOrder(orderData);
      console.log('Order saved to database successfully!');
    } catch (error) {
      console.error('Failed to save order to database:', error);
      console.error('Error details:', error);
      alert(`Failed to save order to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Continue with Messenger anyway
    }

    // Send to Messenger
    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/61578058454940?text=${encodedMessage}`;
    
    window.open(messengerUrl, '_blank');
    setIsSubmitting(false);
  };

  const isDetailsValid = customerName && contactNumber && 
    (serviceType !== 'delivery' || address) && 
    (serviceType !== 'pickup' || (pickupTime !== 'custom' || customTime)) &&
    (serviceType !== 'dine-in' || partySize > 0);

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sweet-text-light hover:text-sweet-green transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl font-sweet font-bold text-sweet-dark ml-8">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-sweet font-bold text-sweet-dark mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-sweet-green-light">
                  <div>
                    <h4 className="font-sweet font-bold text-sweet-dark">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-sweet-text-light">Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-sweet-text-light">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-sweet-text-light">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-sweet font-bold text-sweet-green">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-sweet-green-light pt-4">
              <div className="flex items-center justify-between text-2xl font-sweet font-bold text-sweet-dark">
                <span>Total:</span>
                <span>₱{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-sweet font-bold text-sweet-dark mb-6">Customer Information</h2>
            
            {/* Referral Info Display */}
            {referralInfo && (
              <div className="bg-gradient-to-r from-sweet-green-light to-sweet-green rounded-lg p-4 mb-6 border border-sweet-green">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="font-sweet font-bold text-sweet-dark">Referred by: {referralInfo.affiliateName}</p>
                    <p className="text-sm text-sweet-text-light">Code: {referralInfo.referralCode}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form className="space-y-6">
              {/* Customer Information */}
              <div>
                <label className="block text-sm font-medium text-sweet-dark mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sweet-dark mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent transition-all duration-200"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-sweet-dark mb-3">Service Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dine-in', label: 'Dine In', icon: '🪑' },
                    { value: 'pickup', label: 'Pickup', icon: '🚶' },
                    { value: 'delivery', label: 'Delivery', icon: '🛵' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        serviceType === option.value
                          ? 'border-sweet-green bg-sweet-green text-white'
                          : 'border-sweet-green bg-white text-sweet-dark hover:border-sweet-green-dark'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dine-in Details */}
              {serviceType === 'dine-in' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-sweet-dark mb-2">Party Size *</label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => setPartySize(Math.max(1, partySize - 1))}
                        className="w-10 h-10 rounded-lg border-2 border-sweet-green flex items-center justify-center text-sweet-green hover:border-sweet-green-dark hover:bg-sweet-green-light transition-all duration-200"
                      >
                        -
                      </button>
                      <span className="text-2xl font-sweet font-bold text-sweet-dark min-w-[3rem] text-center">{partySize}</span>
                      <button
                        type="button"
                        onClick={() => setPartySize(Math.min(20, partySize + 1))}
                        className="w-10 h-10 rounded-lg border-2 border-sweet-green flex items-center justify-center text-sweet-green hover:border-sweet-green-dark hover:bg-sweet-green-light transition-all duration-200"
                      >
                        +
                      </button>
                      <span className="text-sm text-sweet-text-light ml-2">person{partySize !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Pickup Time Selection */}
              {serviceType === 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-sweet-dark mb-3">Pickup Time *</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '5-10', label: '5-10 minutes' },
                        { value: '15-20', label: '15-20 minutes' },
                        { value: '25-30', label: '25-30 minutes' },
                        { value: 'custom', label: 'Custom Time' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPickupTime(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${
                            pickupTime === option.value
                              ? 'border-sweet-green bg-sweet-green text-white'
                              : 'border-sweet-green bg-white text-sweet-dark hover:border-sweet-green-dark'
                          }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                    
                    {pickupTime === 'custom' && (
                      <input
                        type="text"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-3 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent transition-all duration-200"
                        placeholder="e.g., 45 minutes, 1 hour, 2:30 PM"
                        required
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {serviceType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-sweet-dark mb-2">Delivery Address *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent transition-all duration-200"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-sweet-dark mb-2">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-3 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Near McDonald's, Beside 7-Eleven, In front of school"
                    />
                  </div>
                </>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-medium text-sweet-dark mb-2">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent transition-all duration-200"
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-4 rounded-xl font-sweet font-bold text-lg transition-all duration-200 transform ${
                  isDetailsValid
                    ? 'bg-sweet-green text-white hover:bg-sweet-green-dark hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-sweet-text-light hover:text-sweet-green transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-3xl font-sweet font-bold text-sweet-dark ml-8">Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-sweet font-bold text-sweet-dark mb-6">Choose Payment Method</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                  paymentMethod === method.id
                    ? 'border-sweet-green bg-sweet-green text-white'
                    : 'border-sweet-green bg-white text-sweet-dark hover:border-sweet-green-dark'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className="font-sweet font-bold">{method.name}</span>
              </button>
            ))}
          </div>

          {/* Payment Details with QR Code */}
          {selectedPaymentMethod && (
            <div className="bg-sweet-green-light rounded-lg p-6 mb-6">
              <h3 className="font-sweet font-bold text-sweet-dark mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-sweet-text-light mb-1">{selectedPaymentMethod.name}</p>
                  <p className="font-mono text-sweet-dark font-sweet font-bold">{selectedPaymentMethod.account_number}</p>
                  <p className="text-sm text-sweet-text-light mb-3">Account Name: {selectedPaymentMethod.account_name}</p>
                  <p className="text-xl font-sweet font-bold text-sweet-green">Amount: ₱{totalPrice}</p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={selectedPaymentMethod.qr_code_url} 
                    alt={`${selectedPaymentMethod.name} QR Code`}
                    className="w-32 h-32 rounded-lg border-2 border-sweet-green shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.jpg';
                    }}
                  />
                  <p className="text-xs text-sweet-text-light text-center mt-2">Scan to pay</p>
                </div>
              </div>
            </div>
          )}

          {/* Reference Number */}
          <div className="bg-sweet-yellow-light border border-sweet-yellow rounded-lg p-4">
            <h4 className="font-sweet font-bold text-sweet-dark mb-2">📸 Payment Proof Required</h4>
            <p className="text-sm text-sweet-text-light">
              After making your payment, please take a screenshot of your payment receipt and attach it when you send your order via Messenger. This helps us verify and process your order quickly.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-sweet font-bold text-sweet-dark mb-6">Final Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="bg-sweet-green-light rounded-lg p-4">
              <h4 className="font-sweet font-bold text-sweet-dark mb-2">Customer Details</h4>
              <p className="text-sm text-sweet-text-light">Name: {customerName}</p>
              <p className="text-sm text-sweet-text-light">Contact: {contactNumber}</p>
              <p className="text-sm text-sweet-text-light">Service: {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</p>
              {serviceType === 'delivery' && (
                <>
                  <p className="text-sm text-sweet-text-light">Address: {address}</p>
                  {landmark && <p className="text-sm text-sweet-text-light">Landmark: {landmark}</p>}
                </>
              )}
              {serviceType === 'pickup' && (
                <p className="text-sm text-sweet-text-light">
                  Pickup Time: {pickupTime === 'custom' ? customTime : `${pickupTime} minutes`}
                </p>
              )}
              {serviceType === 'dine-in' && (
                <p className="text-sm text-sweet-text-light">
                  Party Size: {partySize} person{partySize !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-sweet-green-light">
                <div>
                  <h4 className="font-sweet font-bold text-sweet-dark">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-sweet-text-light">Size: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-sweet-text-light">
                      Add-ons: {item.selectedAddOns.map(addOn => 
                        addOn.quantity && addOn.quantity > 1 
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-sweet-text-light">₱{item.totalPrice} x {item.quantity}</p>
                </div>
                <span className="font-sweet font-bold text-sweet-green">₱{item.totalPrice * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-sweet-green-light pt-4 mb-6">
            <div className="flex items-center justify-between text-2xl font-sweet font-bold text-sweet-dark">
              <span>Total:</span>
              <span>₱{totalPrice}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-sweet font-bold text-lg transition-all duration-200 transform ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-sweet-green text-white hover:bg-sweet-green-dark hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? 'Saving Order...' : 'Place Order via Messenger'}
          </button>
          
          <p className="text-xs text-sweet-text-light text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your order. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;