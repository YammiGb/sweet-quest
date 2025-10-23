import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-sweet-background via-sweet-green-light to-sweet-green py-24 px-4 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce-gentle">🍯</div>
      <div className="absolute top-20 right-20 text-5xl animate-bounce-gentle delay-300">🍰</div>
      <div className="absolute bottom-20 left-20 text-4xl animate-bounce-gentle delay-700">🍪</div>
      <div className="absolute bottom-10 right-10 text-5xl animate-bounce-gentle delay-500">🧁</div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h1 className="text-6xl md:text-7xl font-sweet-display font-bold text-sweet-dark mb-6 animate-fade-in">
          Sweet Quest
          <span className="block text-sweet-green text-4xl md:text-5xl mt-4 animate-scale-in">
            🍯 Your Sweet Adventure Awaits! 🍯
          </span>
        </h1>
        <p className="text-2xl text-sweet-text-light mb-10 max-w-3xl mx-auto animate-slide-up font-sweet">
          Discover the most delightful desserts, treats, and sweet surprises that will make your taste buds dance with joy! ✨
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
          <a 
            href="#menu"
            className="bg-sweet-green text-white px-10 py-4 rounded-full hover:bg-sweet-green-dark transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-xl"
          >
            🍰 Explore Sweet Menu
          </a>
          <a 
            href="#special"
            className="bg-sweet-yellow text-sweet-dark px-10 py-4 rounded-full hover:bg-sweet-yellow-dark transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-xl"
          >
            🎉 Special Treats
          </a>
        </div>
        
        {/* Sweet stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-2">🍰</div>
            <div className="text-2xl font-bold text-sweet-dark">50+</div>
            <div className="text-sweet-text-light">Sweet Delights</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-sweet-dark">5.0</div>
            <div className="text-sweet-text-light">Sweet Rating</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-2xl font-bold text-sweet-dark">100%</div>
            <div className="text-sweet-text-light">Sweet Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;