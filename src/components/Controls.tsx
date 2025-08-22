
import React, { useMemo } from 'react';
import { GameState } from '../types/types';
import { MIN_BET, MAX_BET } from '../utils/constants';

interface ControlsProps {
  gameState: GameState;
  balance: number;
  betAmount: number;
  inputBet: string;
  multiplier: number;
  hasCashedOut: boolean;
  difficultyFactor: number;
  soundSettings: { volume: number; enabled: boolean };
  handleBetChange: (value: string) => void;
  validateAndSetBet: () => void;
  setBetAmount: React.Dispatch<React.SetStateAction<number>>;
  handlePlaceBet: () => void;
  handleCashOut: () => void;
  toggleSound: () => void;
  setVolume: (volume: number) => void;
  resetGame?: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  gameState,
  balance,
  betAmount,
  inputBet,
  multiplier,
  hasCashedOut,
  difficultyFactor,
  soundSettings,
  handleBetChange,
  validateAndSetBet,
  setBetAmount,
  handlePlaceBet,
  handleCashOut,
  toggleSound,
  setVolume,
  resetGame,
}) => {
  const isBettingDisabled = gameState !== GameState.BETTING;

  const quickBet = (amount: number) => {
    if (isBettingDisabled) return;
    const newBet = Math.min(MAX_BET, betAmount + amount);
    handleBetChange(newBet.toString());
  }
  
  const { level: challengeLevel, color: challengeColor } = useMemo(() => {
    if (difficultyFactor < 0.9) return { level: 'Low', color: 'text-green-400' };
    if (difficultyFactor < 1.1) return { level: 'Normal', color: 'text-yellow-400' };
    if (difficultyFactor < 1.3) return { level: 'High', color: 'text-orange-400' };
    return { level: 'Intense', color: 'text-red-500' };
  }, [difficultyFactor]);

  const renderMainButton = () => {
    switch(gameState) {
        case GameState.IN_PROGRESS:
            if (hasCashedOut) {
                return (
                    <button disabled className="w-full h-full text-xl md:text-2xl font-bold bg-gray-600 rounded-lg cursor-not-allowed flex flex-col items-center justify-center">
                        Cashed Out!
                    </button>
                );
            }
            return (
              <button
                onClick={handleCashOut}
                className="w-full h-full text-xl md:text-2xl font-bold bg-green-500 hover:bg-green-600 active:bg-green-700 transition-all duration-200 rounded-lg shadow-lg transform active:scale-95 flex flex-col items-center justify-center touch-manipulation min-h-[60px] md:min-h-[80px]"
                aria-label={`Cash out and win ${(betAmount * multiplier).toFixed(2)} dollars`}
                role="button"
              >
                <div>Cash Out</div>
                <div className="text-xl md:text-2xl font-semibold">${(betAmount * multiplier).toFixed(2)}</div>
              </button>
            );
        
        case GameState.COUNTDOWN:
             return (
                <button disabled className="w-full h-full text-xl md:text-2xl font-bold bg-gray-700 rounded-lg cursor-wait">
                    Get Ready...
                </button>
            );

        case GameState.CRASHED:
             return (
                <button disabled className="w-full h-full text-xl md:text-2xl font-bold bg-red-800 rounded-lg cursor-not-allowed">
                    Round Over
                </button>
            );

        case GameState.BETTING:
        default:
            return (
              <button
                onClick={handlePlaceBet}
                disabled={balance < betAmount || betAmount < MIN_BET}
                className="w-full h-full text-xl md:text-2xl font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 rounded-lg shadow-lg transform active:scale-95 touch-manipulation min-h-[60px] md:min-h-[80px]"
                aria-label={`Place bet of ${betAmount} dollars`}
                aria-disabled={balance < betAmount || betAmount < MIN_BET}
              >
                Place Bet
              </button>
            );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-3 md:p-4 bg-black bg-opacity-20 rounded-xl border border-indigo-500/30">
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="p-3 bg-gray-800/50 rounded-lg">
            <label htmlFor="bet-amount" className="text-sm text-gray-400">Bet Amount</label>
            <input
                id="bet-amount"
                type="number"
                inputMode="decimal"
                value={inputBet}
                onChange={(e) => handleBetChange(e.target.value)}
                onBlur={validateAndSetBet}
                disabled={isBettingDisabled}
                className="w-full mt-1 px-3 py-3 bg-gray-900 border border-gray-600 rounded-md text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 touch-manipulation"
            />
             <div className="grid grid-cols-4 gap-2 mt-3">
                <button onClick={() => quickBet(10)} disabled={isBettingDisabled} className="bet-btn touch-manipulation">+10</button>
                <button onClick={() => quickBet(50)} disabled={isBettingDisabled} className="bet-btn touch-manipulation">+50</button>
                <button onClick={() => quickBet(100)} disabled={isBettingDisabled} className="bet-btn touch-manipulation">+100</button>
                <button onClick={() => handleBetChange(MAX_BET.toString())} disabled={isBettingDisabled} className="bet-btn touch-manipulation">MAX</button>
            </div>
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col justify-between min-h-[140px]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm mb-2 gap-1 sm:gap-0">
            <span className="text-gray-400">Balance: <span className={`font-semibold text-lg ${balance < MIN_BET ? 'text-red-400' : 'text-white'}`}>${balance.toFixed(2)}</span></span>
            <span className="text-gray-400">Challenge: <span className={`font-semibold text-lg ${challengeColor}`}>{challengeLevel}</span></span>
        </div>
        {balance < MIN_BET && resetGame && (
          <div className="mb-2 p-2 bg-red-900/50 border border-red-500/50 rounded-lg text-center">
            <p className="text-red-300 text-sm mb-2">Insufficient funds to continue!</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded transition-colors touch-manipulation text-sm"
            >
              Reset Game ($1,000)
            </button>
          </div>
        )}
        <div className="flex justify-between items-center text-sm mb-3">
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleSound}
                    className={`px-3 py-2 rounded text-xs font-semibold transition-colors touch-manipulation ${
                        soundSettings.enabled 
                            ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white' 
                            : 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-gray-300'
                    }`}
                    aria-label={`Sound is currently ${soundSettings.enabled ? 'enabled' : 'disabled'}. Click to ${soundSettings.enabled ? 'disable' : 'enable'} sound`}
                >
                    🔊 {soundSettings.enabled ? 'ON' : 'OFF'}
                </button>
                {soundSettings.enabled && (
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={soundSettings.volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer touch-manipulation"
                        style={{
                            background: `linear-gradient(to right, #10b981 0%, #10b981 ${soundSettings.volume * 100}%, #4b5563 ${soundSettings.volume * 100}%, #4b5563 100%)`
                        }}
                        aria-label={`Volume control, currently at ${Math.round(soundSettings.volume * 100)}%`}
                    />
                )}
            </div>
        </div>
        <div className="flex-grow">
          {renderMainButton()}
        </div>
      </div>

       <style>{`
            .bet-btn {
                @apply bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-bold py-3 px-2 rounded disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px];
            }
        `}</style>
    </div>
  );
};

export default Controls;
