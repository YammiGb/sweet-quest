import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import { useAffiliates } from './hooks/useAffiliates';
import Header from './components/Header';
import SubNav from './components/SubNav';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import { useMenu } from './hooks/useMenu';

function MainApp() {
  const cart = useCart();
  const { menuItems } = useMenu();
  const { getAffiliateByCode } = useAffiliates();
  const [currentView, setCurrentView] = React.useState<'menu' | 'cart' | 'checkout'>('menu');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [referralInfo, setReferralInfo] = React.useState<{
    referralCode: string;
    affiliateName: string;
    affiliateId: string;
  } | null>(null);

  const handleViewChange = (view: 'menu' | 'cart' | 'checkout') => {
    setCurrentView(view);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Handle referral code detection and validation
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
      // Store referral code in session storage
      sessionStorage.setItem('sweet_quest_referral', referralCode);
      
      // Validate affiliate and get details
      getAffiliateByCode(referralCode).then(affiliate => {
        if (affiliate) {
          setReferralInfo({
            referralCode,
            affiliateName: affiliate.name,
            affiliateId: affiliate.id
          });
        }
      });
    } else {
      // Check if referral code exists in session storage
      const storedReferral = sessionStorage.getItem('sweet_quest_referral');
      if (storedReferral) {
        getAffiliateByCode(storedReferral).then(affiliate => {
          if (affiliate) {
            setReferralInfo({
              referralCode: storedReferral,
              affiliateName: affiliate.name,
              affiliateId: affiliate.id
            });
          }
        });
      }
    }
  }, [getAffiliateByCode]);

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white font-sweet">
      <Header 
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={() => handleViewChange('menu')}
      />
      <SubNav selectedCategory={selectedCategory} onCategoryClick={handleCategoryClick} />
      
      {currentView === 'menu' && (
        <Menu 
          menuItems={filteredMenuItems}
          addToCart={cart.addToCart}
        />
      )}
      
      {currentView === 'cart' && (
        <Cart 
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={() => handleViewChange('menu')}
          onCheckout={() => handleViewChange('checkout')}
        />
      )}
      
      {currentView === 'checkout' && (
        <Checkout 
          cartItems={cart.cartItems}
          totalPrice={cart.getTotalPrice()}
          onBack={() => handleViewChange('cart')}
          referralInfo={referralInfo}
        />
      )}
      
      {currentView === 'menu' && (
        <FloatingCartButton 
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;