
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types/types';
import type { HistoryItem } from './types/types';
import { GoogleGenAI } from "@google/genai";
import {
  INITIAL_BALANCE,
  MIN_BET,
  MAX_BET,
  GAME_LOOP_INTERVAL_MS,
  COUNTDOWN_SECONDS,
  POST_ROUND_DELAY_MS,
  DIFFICULTY_INITIAL,
  DIFFICULTY_MIN,
  DIFFICULTY_MAX,
  DIFFICULTY_WIN_INCREASE,
  DIFFICULTY_LOSS_DECREASE,
  SAFE_ZONE_CHANCE,
  THEORETICAL_RTP
} from './utils/constants';
import HistoryBar from './components/HistoryBar';
import GameScreen from './components/GameScreen';
import Controls from './components/Controls';
import Introduction from './components/Introduction';
import ErrorBoundary from './components/ErrorBoundary';
import useSound from './hooks/useSound';

// Fix API key access for Vite
const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

// Only initialize AI if API key is available
if (apiKey) {
  try {
    ai = new GoogleGenAI(apiKey);
  } catch (error) {
    console.warn('Failed to initialize Google GenAI:', error);
  }
}

const App: React.FC = () => {
  const [showIntroduction, setShowIntroduction] = useState<boolean>(() => {
    const hasSeenIntro = localStorage.getItem('shadow-flight-intro-seen');
    return !hasSeenIntro;
  });
  const [gameState, setGameState] = useState<GameState>(GameState.BETTING);
  const [balance, setBalance] = useState<number>(() => {
    const savedBalance = localStorage.getItem('shadow-flight-balance');
    return savedBalance ? parseFloat(savedBalance) : INITIAL_BALANCE;
  });
  const [betAmount, setBetAmount] = useState<number>(() => {
    const savedBet = localStorage.getItem('shadow-flight-bet-amount');
    return savedBet ? parseFloat(savedBet) : MIN_BET;
  });
  const [inputBet, setInputBet] = useState<string>(() => {
    const savedBet = localStorage.getItem('shadow-flight-bet-amount');
    return savedBet ? savedBet : MIN_BET.toString();
  });
  
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const savedHistory = localStorage.getItem('shadow-flight-history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  
  const [flightLog, setFlightLog] = useState<string>('Prepare for takeoff...');
  const [isGeneratingLog, setIsGeneratingLog] = useState<boolean>(true);
  
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [difficultyFactor, setDifficultyFactor] = useState<number>(DIFFICULTY_INITIAL);
  const [isSafeZone, setIsSafeZone] = useState<boolean>(false);

  const { playTakeoff, playDing, playExplosion, toggleSound, setVolume, settings } = useSound();

  const gameLoopRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showIntroduction) return;

      switch (event.key.toLowerCase()) {
        case ' ':
        case 'enter':
          event.preventDefault();
          if (gameState === GameState.BETTING) {
            handlePlaceBet();
          } else if (gameState === GameState.IN_PROGRESS && !hasCashedOut) {
            handleCashOut();
          }
          break;
        case 'escape':
          if (gameState === GameState.IN_PROGRESS && !hasCashedOut) {
            handleCashOut();
          }
          break;
        case '1':
          if (gameState === GameState.BETTING) {
            handleBetChange('10');
          }
          break;
        case '2':
          if (gameState === GameState.BETTING) {
            handleBetChange('50');
          }
          break;
        case '3':
          if (gameState === GameState.BETTING) {
            handleBetChange('100');
          }
          break;
        case 'm':
          if (gameState === GameState.BETTING) {
            handleBetChange(MAX_BET.toString());
          }
          break;
      }
    };

         window.addEventListener('keydown', handleKeyPress);
     return () => window.removeEventListener('keydown', handleKeyPress);
   }, [gameState, hasCashedOut, showIntroduction, handlePlaceBet, handleCashOut, handleBetChange]);

   // Save game data to localStorage
   useEffect(() => {
     localStorage.setItem('shadow-flight-balance', balance.toString());
   }, [balance]);

   useEffect(() => {
     localStorage.setItem('shadow-flight-bet-amount', betAmount.toString());
   }, [betAmount]);

   useEffect(() => {
     localStorage.setItem('shadow-flight-history', JSON.stringify(history));
   }, [history]);
  
  const generateFlightLog = useCallback(async () => {
    setIsGeneratingLog(true);
    setFlightLog('');
    
    // If AI is not available, use fallback messages
    if (!ai) {
      const fallbackMessages = [
        "Callsign: Phoenix-7. Target: Nebula Station. Status: Shadow detected on radar. Engines hot.",
        "Callsign: Ghost-2. Target: Mars Colony. Status: Hostile pursuit confirmed. Evasive maneuvers ready.",
        "Callsign: Viper-1. Target: Ganymede Relay. Status: Shadow signature detected. Engaging thrust.",
        "Callsign: Raven-5. Target: Europa Base. Status: Enemy contact imminent. All systems green.",
        "Callsign: Falcon-3. Target: Titan Outpost. Status: Shadow closing fast. Maximum velocity."
      ];
      
      setTimeout(() => {
        const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
        setFlightLog(randomMessage);
        setIsGeneratingLog(false);
      }, 500); // Simulate loading time
      return;
    }

    try {
        const prompt = `Generate a short, futuristic flight log for a dangerous single-round mission codenamed "Shadow Flight".
        The mission is a high-risk flight where an enemy "shadow" vehicle will give chase.
        Include a creative callsign, a destination, and a brief, slightly ominous status update.
        Keep it concise, under 200 characters.
        Example: "Callsign: Viper-1. Target: Ganymede Relay. Status: Shadow signature detected. Engaging thrust."`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{ parts: [{ text: prompt }] }],
        });

        const text = response.response.text();
        setFlightLog(text.trim());
    } catch (error) {
        console.error("Error generating flight log:", error);
        setFlightLog("Mission details corrupted. Proceed with caution.");
    } finally {
        setIsGeneratingLog(false);
    }
  }, []);
  
  useEffect(() => {
    if (gameState === GameState.BETTING && !isGeneratingLog) {
        generateFlightLog();
    }
  }, [gameState, isGeneratingLog, generateFlightLog]);

  const generateCrashPoint = useCallback((isSafe: boolean, difficulty: number) => {
    if (isSafe) {
        // Safe zones guarantee a better-than-average outcome
        return 2.5 + Math.random() * 7.5; // 2.5x to 10x
    }

    const roll = Math.random();
    
    // More balanced RTP calculation
    // Adjust probabilities based on difficulty. Higher difficulty -> higher chance of early crash.
    const earlyCrashChance = Math.min(0.75, 0.55 + (difficulty - 1) * 0.08); // Base 55%, max 75%
    const midCrashChance = Math.max(0.15, 0.35 - (difficulty - 1) * 0.05); // Base 35%, min 15%
    const highCrashChance = 1 - earlyCrashChance - midCrashChance; // Remaining percentage

    if (roll < earlyCrashChance) {
        // High frequency, low multiplier (1.01x - 2.2x) - slightly improved
        return 1.01 + Math.random() * 1.19;
    } else if (roll < earlyCrashChance + midCrashChance) {
        // Medium frequency, medium multiplier (2.2x - 6.0x)
        return 2.2 + Math.random() * 3.8;
    } else {
        // Low frequency, high multiplier (6.0x - 25.0x) - more achievable high multipliers
        const highMultiplier = 6 + Math.pow(Math.random(), 1.8) * 19;
        return Math.min(highMultiplier, 25); // Cap at 25x
    }
  }, []);

  const handleCashOut = useCallback(() => {
    if (gameState === GameState.IN_PROGRESS && !hasCashedOut) {
      const winnings = betAmount * multiplier;
      setBalance(prev => prev + winnings);
      setHasCashedOut(true);
      playDing();
    }
  }, [gameState, hasCashedOut, multiplier, betAmount, playDing]);


  const endRound = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    playExplosion();
    setGameState(GameState.CRASHED);

    // Adaptive Difficulty Adjustment
    if (hasCashedOut) {
        setDifficultyFactor(prev => Math.min(DIFFICULTY_MAX, prev + DIFFICULTY_WIN_INCREASE));
    } else {
        setDifficultyFactor(prev => Math.max(DIFFICULTY_MIN, prev - DIFFICULTY_LOSS_DECREASE));
    }
    
    setHistory(prevHistory => {
        const newItem: HistoryItem = { id: Date.now(), multiplier: crashMultiplier };
        return [newItem, ...prevHistory].slice(0, 5);
    });

    setTimeout(() => {
        setGameState(GameState.BETTING);
    }, POST_ROUND_DELAY_MS);

  }, [crashMultiplier, playExplosion, hasCashedOut]);


  const startRound = useCallback(() => {
    const safeZone = Math.random() < SAFE_ZONE_CHANCE;
    setIsSafeZone(safeZone);
    
    setGameState(GameState.IN_PROGRESS);
    setMultiplier(1.00);
    setHasCashedOut(false);

    const newCrashMultiplier = generateCrashPoint(safeZone, difficultyFactor);
    setCrashMultiplier(newCrashMultiplier);
    playTakeoff();

    const multiplierRiseRate = 0.01 + Math.random() * 0.02;
    const startTime = performance.now();
    let animationFrameId: number;

    // Use requestAnimationFrame for smoother, more efficient animation
    const updateMultiplier = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
      const nextMultiplier = 1.00 + elapsed * multiplierRiseRate * (Math.log(1.00 + elapsed) + 1) * 0.5;
      
      if (nextMultiplier >= newCrashMultiplier) {
        setMultiplier(newCrashMultiplier);
        endRound();
        return;
      }
      
      setMultiplier(nextMultiplier);
      animationFrameId = requestAnimationFrame(updateMultiplier);
    };

    animationFrameId = requestAnimationFrame(updateMultiplier);

    // Store the animation frame ID for cleanup
    gameLoopRef.current = animationFrameId;
  }, [generateCrashPoint, playTakeoff, endRound, difficultyFactor]);


  useEffect(() => {
    let countdownInterval: number | null = null;
    if (gameState === GameState.COUNTDOWN) {
      countdownInterval = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if(countdownInterval) window.clearInterval(countdownInterval);
            startRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) window.clearInterval(countdownInterval);
    };
  }, [gameState, startRound]);
  
  const handlePlaceBet = () => {
    if (balance >= betAmount) {
      setBalance(prev => prev - betAmount);
      setGameState(GameState.COUNTDOWN);
      setCountdown(COUNTDOWN_SECONDS);
    } else {
      alert("Insufficient balance!");
    }
  };
  
  const handleBetChange = (value: string) => {
    setInputBet(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= MIN_BET && numValue <= MAX_BET) {
        setBetAmount(numValue);
    }
  };
  
  const validateAndSetBet = () => {
      let numValue = parseFloat(inputBet);
      if (isNaN(numValue) || numValue < MIN_BET) numValue = MIN_BET;
      if (numValue > MAX_BET) numValue = MAX_BET;
      if (numValue > balance) numValue = balance;
      setBetAmount(numValue);
      setInputBet(numValue.toString());
  };

  const handleStartGame = () => {
    setShowIntroduction(false);
    localStorage.setItem('shadow-flight-intro-seen', 'true');
  };

  const resetGame = () => {
    setBalance(INITIAL_BALANCE);
    setHistory([]);
    setDifficultyFactor(DIFFICULTY_INITIAL);
    localStorage.removeItem('shadow-flight-balance');
    localStorage.removeItem('shadow-flight-history');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-black text-white font-mono flex flex-col items-center justify-center p-4">
        {showIntroduction ? (
          <Introduction onStartGame={handleStartGame} />
        ) : (
          <>
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
              <ErrorBoundary fallback={<div className="text-center text-red-400">History display error</div>}>
                <HistoryBar history={history} />
              </ErrorBoundary>
              <ErrorBoundary fallback={<div className="text-center text-red-400">Game display error</div>}>
                <GameScreen 
                  gameState={gameState}
                  multiplier={multiplier}
                  crashMultiplier={crashMultiplier}
                  countdown={countdown}
                  flightLog={flightLog}
                  isGeneratingLog={isGeneratingLog}
                  difficultyFactor={difficultyFactor}
                  isSafeZone={isSafeZone}
                />
              </ErrorBoundary>
              <ErrorBoundary fallback={<div className="text-center text-red-400">Controls error</div>}>
                <Controls
                  gameState={gameState}
                  balance={balance}
                  betAmount={betAmount}
                  inputBet={inputBet}
                  handleBetChange={handleBetChange}
                  validateAndSetBet={validateAndSetBet}
                  setBetAmount={setBetAmount}
                  handlePlaceBet={handlePlaceBet}
                  handleCashOut={handleCashOut}
                  multiplier={multiplier}
                  hasCashedOut={hasCashedOut}
                  difficultyFactor={difficultyFactor}
                  soundSettings={settings}
                  toggleSound={toggleSound}
                  setVolume={setVolume}
                  resetGame={resetGame}
                />
              </ErrorBoundary>
            </div>
            <footer className="text-center text-xs text-gray-400 mt-8">
              <p>Shadow Flight - A Crash Game Experience</p>
              <p className="font-bold">Theoretical RTP: ~{THEORETICAL_RTP}%</p>
              <p>Disclaimer: This is a simulation game for entertainment purposes only. No real money is involved.</p>
            </footer>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
