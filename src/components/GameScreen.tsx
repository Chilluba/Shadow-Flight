import React, { useMemo } from 'react';
import { GameState } from '../types/types';
import { PlaneIcon, ExplosionIcon, ShieldIcon } from './icons';
import { GAME_LOOP_INTERVAL_MS, CRASH_POINT_MAX } from '../utils/constants';

interface GameScreenProps {
  gameState: GameState;
  multiplier: number;
  crashMultiplier: number;
  countdown: number;
  flightLog: string;
  isGeneratingLog: boolean;
  difficultyFactor: number;
  isSafeZone: boolean;
}

const GameScreen: React.FC<GameScreenProps> = (props) => {
  const { gameState, multiplier, crashMultiplier, countdown, flightLog, isGeneratingLog, difficultyFactor, isSafeZone } = props;

  const isPreGame = gameState === GameState.BETTING || gameState === GameState.COUNTDOWN;
  const isRunning = gameState === GameState.IN_PROGRESS;
  const isCrashed = gameState === GameState.CRASHED;

  const { planeY, shadowY, isWarning } = useMemo(() => {
    const safeCrashMultiplier = Math.max(crashMultiplier, 1.01);
    const normalizedProgress = Math.min(1, Math.log(multiplier) / Math.log(safeCrashMultiplier));
    
    const planeY = Math.log(multiplier) / Math.log(CRASH_POINT_MAX) * 80;

    let gapFactor = Math.pow(1 - normalizedProgress, 2.0);
    
    // In safe zones, the shadow is much less aggressive
    if (isSafeZone) {
      gapFactor = Math.pow(1 - normalizedProgress, 0.5); // Shadow lags far behind
    }

    // Shadow chases, its aggression is scaled by the difficulty factor
    const initialGap = 15;
    const shadowY = planeY - (gapFactor * (initialGap / difficultyFactor)) - 1.0;

    const warningThreshold = isSafeZone ? 0.99 : 0.95;
    const isWarning = normalizedProgress > warningThreshold && isRunning;
    
    return { planeY, shadowY, isWarning };
  }, [multiplier, crashMultiplier, isRunning, difficultyFactor, isSafeZone]);


  const multiplierColor = isRunning 
    ? `text-cyan-300` 
    : isCrashed
    ? `text-red-500` 
    : `text-gray-400`;

  const renderContent = () => {
    switch (gameState) {
      case GameState.BETTING:
         return (
            <div className="text-center p-4 max-w-md">
                {isGeneratingLog ? (
                    <>
                        <div className="text-lg text-indigo-300 animate-pulse">AWAITING MISSION BRIEF...</div>
                        <div className="text-sm text-gray-400 mt-2">Connecting to command...</div>
                    </>
                ) : (
                    <>
                        <div className="text-lg text-indigo-300">MISSION BRIEFING</div>
                        <pre className="text-lg md:text-xl font-mono text-cyan-300 whitespace-pre-wrap mt-2">{flightLog}</pre>
                    </>
                )}
            </div>
        );
      case GameState.COUNTDOWN:
        return (
          <div className="text-center">
            <div className="text-xl text-gray-300">Takeoff in</div>
            <div className="text-6xl font-bold text-white drop-shadow-lg">{countdown}</div>
            <pre className="text-sm font-mono text-cyan-400 whitespace-pre-wrap mt-2 opacity-70 max-w-xs truncate">{flightLog}</pre>
          </div>
        );
      case GameState.IN_PROGRESS:
      case GameState.CRASHED:
        return (
          <div className="text-center relative">
            {isCrashed && <div className="text-2xl md:text-3xl font-bold text-red-500 absolute -top-10 left-1/2 -translate-x-1/2 w-full">CRASHED!</div>}
            <div className={`text-6xl md:text-8xl font-bold transition-colors duration-300 will-change-contents ${multiplierColor} drop-shadow-[0_0_15px_rgba(100,200,255,0.5)]`}>
              {multiplier.toFixed(2)}x
            </div>
            {isSafeZone && isRunning && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-green-500/80 text-white px-4 py-1 rounded-full text-lg animate-pulse">
                    <ShieldIcon className="w-6 h-6" />
                    SAFE ZONE
                </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative w-full aspect-video bg-black bg-opacity-30 rounded-xl overflow-hidden shadow-2xl border border-indigo-500/30 transition-all duration-300 touch-manipulation ${isWarning ? 'warning-glow' : ''}`}>
        <style>{`
          .grid-background {
            background-image:
              linear-gradient(to right, rgba(79, 70, 229, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(79, 70, 229, 0.2) 1px, transparent 1px);
            background-size: 2rem 2rem;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          .warning-glow {
            box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.5), inset 0 0 20px 5px rgba(239, 68, 68, 0.3);
            animation: shake 0.5s infinite;
          }
        `}</style>
        <div className="absolute inset-0 grid-background opacity-50"></div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        {renderContent()}
      </div>

      <div className="absolute top-0 left-0 w-full h-full">
        {!isPreGame && (
          <>
            {/* Main Plane */}
            <div 
              className="absolute h-8 w-8 md:h-12 md:w-12 will-change-transform" 
              style={{ 
                left: `calc(${planeY}% - 1rem)`, 
                bottom: `${planeY}%`,
                transform: 'translateZ(0)', // Force hardware acceleration
                transition: isRunning ? 'none' : 'all 0.3s ease-out'
              }}
            >
              {isCrashed ? (
                <div className="relative w-full h-full">
                  <ExplosionIcon className="w-full h-full text-orange-500 animate-ping opacity-75" />
                  <ExplosionIcon className="absolute top-0 left-0 w-full h-full text-yellow-400" />
                </div>
              ) : (
                <PlaneIcon className={`w-full h-full transition-colors duration-300 ${isSafeZone ? 'text-green-400 drop-shadow-[0_0_8px_rgba(50,255,150,0.8)]' : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(100,200,255,0.8)]'}`} />
              )}
            </div>
            {/* Shadow Plane */}
             {!isCrashed && (
                <div 
                  className="absolute h-8 w-8 md:h-12 md:w-12 will-change-transform" 
                  style={{ 
                    left: `calc(${shadowY}% - 1rem)`, 
                    bottom: `${shadowY}%`,
                    transform: 'translateZ(0)', // Force hardware acceleration
                    transition: isRunning ? 'none' : 'all 0.3s ease-out'
                  }}
                >
                    <PlaneIcon className="w-full h-full text-red-500 opacity-70 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                </div>
             )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameScreen;
