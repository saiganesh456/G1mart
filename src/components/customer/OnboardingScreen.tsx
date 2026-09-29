import React, { useState } from 'react';
import { ArrowRight, ChevronRight, Apple, ShoppingBasket, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OnboardingScreen: React.FC = () => {
  const { navigate } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Fresh groceries at your fingertips',
      description:
        'Crisp vegetables, farm-fresh fruits, and pure dairy sourced directly from Hyderabad local farms every morning.',
      icon: Apple,
      badge: 'Farm Fresh Quality',
      color: 'bg-emerald-500',
    },
    {
      title: 'Choose from daily essentials',
      description:
        'Over 2,000+ daily grocery products, staples, rice, atta, snacks, beverages and household cleaners at supermarket prices.',
      icon: ShoppingBasket,
      badge: 'Huge Supermarket Variety',
      color: 'bg-emerald-600',
    },
    {
      title: 'Fast and reliable home delivery',
      description:
        'Doorstep express delivery in 15-30 minutes across Hyderabad with live order tracking and contactless payment options.',
      icon: Truck,
      badge: '15-30 Mins Express',
      color: 'bg-[#2E7D32]',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigate('login');
    }
  };

  const handleSkip = () => {
    navigate('login');
  };

  const SlideIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-6 bg-white select-none max-w-md mx-auto w-full my-auto py-8">
      {/* Top Header with Skip Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <img
            src="/assets/images/g1_mart_banner_transparent.png"
            alt="G1 Mart"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo.png';
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-3 py-1 rounded-full hover:bg-stone-100 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Center Slide Illustration & Content */}
      <div className="flex flex-col items-center text-center my-auto py-6">
        {/* Visual Icon Card */}
        <div className="relative mb-8">
          <div className="w-48 h-48 rounded-full bg-[#E8F5E9] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-white/60 to-transparent" />
            <div className={`w-24 h-24 rounded-3xl ${slides[currentSlide].color} text-white flex items-center justify-center shadow-xl shadow-emerald-900/10`}>
              <SlideIcon className="w-12 h-12 stroke-[1.75]" />
            </div>
          </div>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#212121] text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
            {slides[currentSlide].badge}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-[#212121] tracking-tight max-w-xs mt-3 leading-snug">
          {slides[currentSlide].title}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 font-normal mt-3 max-w-xs leading-relaxed">
          {slides[currentSlide].description}
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-6 pb-4">
        {/* Slide Indicator Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'w-8 bg-[#2E7D32]' : 'w-2 bg-stone-300'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {currentSlide === slides.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/20 active:scale-[0.98] transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#2E7D32]/20 active:scale-[0.98] transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
