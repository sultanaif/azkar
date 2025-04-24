import React, { useState, useEffect } from 'react';
import { Moon, Sun, ChevronRight, ChevronLeft, Repeat, RefreshCw, Timer } from 'lucide-react';
import { morningAzkar, eveningAzkar } from './data/azkar';
import { AzkarType, Zekr } from './types';

function App() {
  const [type, setType] = useState<AzkarType>('morning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCounts, setCurrentCounts] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [streak, setStreak] = useState<number>(0);
  const [lastCompletionDate, setLastCompletionDate] = useState<string>('');

  const azkar = type === 'morning' ? morningAzkar : eveningAzkar;

  // Initialize counts
  useEffect(() => {
    const savedCounts = localStorage.getItem(`${type}CurrentCounts`);
    const savedStreak = localStorage.getItem('streak');
    const savedLastCompletion = localStorage.getItem('lastCompletionDate');
    
    // Initialize currentCounts with zeros (representing no progress)
    if (savedCounts) {
      setCurrentCounts(JSON.parse(savedCounts));
    } else {
      setCurrentCounts(new Array(azkar.length).fill(0));
    }
    
    setStreak(savedStreak ? parseInt(savedStreak) : 0);
    setLastCompletionDate(savedLastCompletion || '');
    setCurrentIndex(0);
  }, [type]);

  // Save progress and handle streak
  useEffect(() => {
    if (currentCounts.length > 0) {
      localStorage.setItem(`${type}CurrentCounts`, JSON.stringify(currentCounts));
      
      const isCompleted = currentCounts.every((count, index) => count >= azkar[index].count);
      if (isCompleted) {
        const today = new Date().toLocaleDateString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
        
        if (lastCompletionDate === yesterday) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem('streak', newStreak.toString());
        } else if (lastCompletionDate !== today) {
          setStreak(1);
          localStorage.setItem('streak', '1');
        }
        
        setLastCompletionDate(today);
        localStorage.setItem('lastCompletionDate', today);
      }
    }
  }, [currentCounts, type, lastCompletionDate, streak]);

  const handleCount = () => {
    const totalCount = azkar[currentIndex].count;
    const currentCount = currentCounts[currentIndex];
    
    if (currentCount < totalCount) {
      setIsAnimating(true);
      setCurrentCounts(prevCounts => {
        const newCounts = [...prevCounts];
        newCounts[currentIndex] = currentCount + 1;
        return newCounts;
      });
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  const getRemainingCount = (index: number): number => {
    const totalCount = azkar[index].count;
    const currentCount = currentCounts[index] || 0;
    return totalCount - currentCount;
  };

  const handleNext = () => {
    if (currentIndex < azkar.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetCount = () => {
    setCurrentCounts(prevCounts => {
      const newCounts = [...prevCounts];
      newCounts[currentIndex] = 0;
      return newCounts;
    });
  };

  const resetAllCounts = () => {
    setCurrentCounts(new Array(azkar.length).fill(0));
  };

  const remainingCount = getRemainingCount(currentIndex);
  const isCompleted = remainingCount === 0;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-4 py-12 pb-32 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow">
            <Timer className="w-5 h-5 text-indigo-500" />
            <span className="text-gray-700">سلسلة الإنجاز: </span>
            <span className="font-bold text-indigo-600">{streak} يوم</span>
          </div>
          <button
            onClick={resetAllCounts}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-600 hover:bg-gray-50 transition-all duration-300 shadow"
          >
            <RefreshCw className="w-5 h-5" />
            <span>إعادة البدء</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <button
            onClick={() => setType('morning')}
            className={`relative flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 ${
              type === 'morning'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            style={{
              transform: type === 'morning' ? 'scale(1.02)' : 'scale(1)',
              zIndex: type === 'morning' ? 2 : 1
            }}
          >
            <Sun className="w-6 h-6" />
            <span>أذكار الصباح</span>
          </button>
          <button
            onClick={() => setType('evening')}
            className={`relative flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 ${
              type === 'evening'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            style={{
              transform: type === 'evening' ? 'scale(1.02)' : 'scale(1)',
              zIndex: type === 'evening' ? 2 : 1
            }}
          >
            <Moon className="w-6 h-6" />
            <span>أذكار المساء</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12 backdrop-blur-lg bg-opacity-90 transition-all duration-500 hover:shadow-3xl relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity duration-500"
            style={{ opacity: isAnimating ? 0.5 : 0 }}
          />

          <div className="text-center mb-8">
            <div className="inline-block px-6 py-2 bg-gray-100 rounded-full">
              <span className="text-gray-600 font-medium">
                {currentIndex + 1} / {azkar.length}
              </span>
            </div>
          </div>

          <p className="text-3xl leading-relaxed text-gray-800 text-center mb-12 transition-opacity duration-300 ease-in-out arabic-text">
            {azkar[currentIndex].text}
          </p>

          <div className="flex flex-col items-center gap-6 relative">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCount}
                disabled={isCompleted}
                className={`group px-12 py-5 rounded-2xl text-xl font-medium transition-all duration-300 transform ${
                  isAnimating ? 'scale-95' : 'scale-100'
                } ${
                  !isCompleted
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:-translate-y-1 animate-glow'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-2">
                  تكرار
                  <Repeat className="w-5 h-5 transition-transform group-hover:rotate-180" />
                </span>
              </button>
              <button
                onClick={resetCount}
                className="p-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full"
                title="إعادة العد"
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xl font-medium text-gray-700 bg-gray-100 px-8 py-3 rounded-full">
              المتبقي: {remainingCount}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm shadow-lg py-4 px-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:-translate-x-1"
          >
            <ChevronRight className="w-5 h-5" />
            السابق
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === azkar.length - 1}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:translate-x-1"
          >
            التالي
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;