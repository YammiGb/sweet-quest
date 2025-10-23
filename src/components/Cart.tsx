import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <div className="text-8xl mb-6 animate-bounce-gentle">🛒</div>
          <h2 className="text-3xl font-sweet-display font-bold text-sweet-dark mb-4">Your Cart is Empty!</h2>
          <button
            onClick={onContinueShopping}
            className="bg-sweet-green text-white px-8 py-4 rounded-full hover:bg-sweet-green-dark transition-all duration-200 transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onContinueShopping}
          className="flex items-center text-sweet-text-light hover:text-sweet-green transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-4xl font-sweet font-bold text-sweet-dark">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-sweet-text-dark hover:text-sweet-green transition-colors duration-200 font-sweet whitespace-nowrap"
        >
          Clear All
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8 border-2 border-sweet-green-light">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b border-sweet-green-light' : ''}`}>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-sweet font-bold text-sweet-dark mb-2">{item.name}</h3>
                <p className="text-lg font-bold text-sweet-green mb-2">₱{item.totalPrice} each</p>
                {item.selectedVariation && (
                  <p className="text-sm text-sweet-text-light mb-1 font-sweet">🍰 Size: {item.selectedVariation.name}</p>
                )}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-sm text-sweet-text-light mb-1 font-sweet">
                    🍯 Sweet Add-ons: {item.selectedAddOns.map(addOn => 
                      addOn.quantity && addOn.quantity > 1 
                        ? `${addOn.name} x${addOn.quantity}`
                        : addOn.name
                    ).join(', ')}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-sweet-green-light to-sweet-green rounded-full p-1 border-2 border-sweet-green">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-sweet-green rounded-full transition-colors duration-200 hover:scale-110"
                    >
                      <Minus className="h-4 w-4 text-sweet-dark" />
                    </button>
                    <span className="font-bold text-sweet-dark min-w-[32px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-sweet-green-dark rounded-full transition-colors duration-200 hover:scale-110"
                    >
                      <Plus className="h-4 w-4 text-sweet-dark" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-sweet-green">₱{item.totalPrice * item.quantity}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-sweet-text-dark hover:text-sweet-green hover:bg-sweet-green-light rounded-full transition-all duration-200 hover:scale-110"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between text-2xl font-sweet font-bold text-sweet-dark mb-6">
          <span>Total:</span>
          <span>₱{(getTotalPrice() || 0).toFixed(2)}</span>
        </div>
        
        <button
          onClick={onCheckout}
          className="w-full bg-sweet-green text-white py-4 rounded-xl hover:bg-sweet-green-dark transition-all duration-200 transform hover:scale-[1.02] font-sweet font-bold text-lg"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;