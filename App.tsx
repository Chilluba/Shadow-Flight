
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types';
import type { HistoryItem } from './types';
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
} from './constants';
import HistoryBar from './components/HistoryBar';
import GameScreen from './components/GameScreen';
import Controls from './components/Controls';
import Introduction from './components/Introduction';
import useSound from './hooks/useSound';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const App: React.FC = () => {
  const [showIntroduction, setShowIntroduction] = useState<boolean>(true);
  const [gameState, setGameState] = useState<GameState>(GameState.BETTING);
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [betAmount, setBetAmount] = useState<number>(MIN_BET);
  const [inputBet, setInputBet] = useState<string>(MIN_BET.toString());
  
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  
  const [flightLog, setFlightLog] = useState<string>('Prepare for takeoff...');
  const [isGeneratingLog, setIsGeneratingLog] = useState<boolean>(true);
  
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [difficultyFactor, setDifficultyFactor] = useState<number>(DIFFICULTY_INITIAL);
  const [isSafeZone, setIsSafeZone] = useState<boolean>(false);

  const { playTakeoff, playDing, playExplosion } = useSound();

  const gameLoopRef = useRef<number | null>(null);
  
  const generateFlightLog = useCallback(async () => {
    setIsGeneratingLog(true);
    setFlightLog('');
    try {
        const prompt = `Generate a short, futuristic flight log for a dangerous single-round mission codenamed "Shadow Flight".
        The mission is a high-risk flight where an enemy "shadow" vehicle will give chase.
        Include a creative callsign, a destination, and a brief, slightly ominous status update.
        Keep it concise, under 200 characters.
        Example: "Callsign: Viper-1. Target: Ganymede Relay. Status: Shadow signature detected. Engaging thrust."`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
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
        return 3 + Math.random() * 7; // 3x to 10x
    }

    const roll = Math.random();
    
    // Adjust probabilities based on difficulty. Higher difficulty -> higher chance of early crash.
    const earlyCrashChance = 0.6 + (difficulty - 1) * 0.1; // Base 60%, scales up/down
    const midCrashChance = 0.3 - (difficulty - 1) * 0.05; // Base 30%

    if (roll < earlyCrashChance) {
        // High frequency, low multiplier (1.01x - 2.0x)
        return 1.01 + Math.random();
    } else if (roll < earlyCrashChance + midCrashChance) {
        // Medium frequency, medium multiplier (2.0x - 5.0x)
        return 2 + Math.random() * 3;
    } else {
        // Low frequency, high multiplier (5.0x - 25.0x)
        return 5 + Math.pow(Math.random(), 2) * 20;
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
      window.clearInterval(gameLoopRef.current);
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

    const multiplierRiseRate = 0.01 + Math.random() * 0.02; // Make rise rate more consistent

    gameLoopRef.current = window.setInterval(() => {
      setMultiplier(prevMultiplier => {
        const nextMultiplier = prevMultiplier + multiplierRiseRate * (Math.log(prevMultiplier) + 1) * 0.05;
        
        if (nextMultiplier >= newCrashMultiplier) {
          if(gameLoopRef.current) window.clearInterval(gameLoopRef.current);
          setMultiplier(newCrashMultiplier);
          endRound();
          return newCrashMultiplier;
        }
        return nextMultiplier;
      });
    }, GAME_LOOP_INTERVAL_MS);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-black text-white font-mono flex flex-col items-center justify-center p-4">
      {showIntroduction ? (
        <Introduction onStartGame={handleStartGame} />
      ) : (
        <>
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
            <HistoryBar history={history} />
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
            />
          </div>
          <footer className="text-center text-xs text-gray-400 mt-8">
            <p>Shadow Flight - A Crash Game Experience</p>
            <p className="font-bold">Theoretical RTP: ~{THEORETICAL_RTP}%</p>
            <p>Disclaimer: This is a simulation game for entertainment purposes only. No real money is involved.</p>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;
