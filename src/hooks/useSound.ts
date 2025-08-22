
import { useCallback, useRef, useEffect, useState } from 'react';

interface SoundSettings {
  volume: number;
  enabled: boolean;
}

const useSound = () => {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    const saved = localStorage.getItem('sound-settings');
    return saved ? JSON.parse(saved) : { volume: 0.3, enabled: true };
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<{ [key: string]: AudioBuffer }>({});
  const isInitializedRef = useRef(false);

  // Initialize audio context
  useEffect(() => {
    if (!settings.enabled) return;

    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        await generateSynthSounds();
        isInitializedRef.current = true;
      } catch (error) {
        console.warn('Failed to initialize audio context:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [settings.enabled]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('sound-settings', JSON.stringify(settings));
  }, [settings]);

  // Generate synthetic sounds
  const generateSynthSounds = useCallback(async () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const sampleRate = ctx.sampleRate;

    // Takeoff sound - rising tone with engine noise
    const takeoffDuration = 1.5;
    const takeoffBuffer = ctx.createBuffer(1, sampleRate * takeoffDuration, sampleRate);
    const takeoffData = takeoffBuffer.getChannelData(0);
    
    for (let i = 0; i < takeoffData.length; i++) {
      const t = i / sampleRate;
      const frequency = 100 + (t / takeoffDuration) * 200; // Rising from 100Hz to 300Hz
      const envelope = Math.sin(t * Math.PI / takeoffDuration) * 0.3;
      const noise = (Math.random() - 0.5) * 0.1; // Engine noise
      takeoffData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope + noise;
    }
    soundBuffersRef.current['takeoff'] = takeoffBuffer;

    // Ding sound - bell-like tone
    const dingDuration = 0.5;
    const dingBuffer = ctx.createBuffer(1, sampleRate * dingDuration, sampleRate);
    const dingData = dingBuffer.getChannelData(0);
    
    for (let i = 0; i < dingData.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 8); // Quick decay
      const fundamental = Math.sin(2 * Math.PI * 800 * t);
      const harmonic = Math.sin(2 * Math.PI * 1200 * t) * 0.5;
      dingData[i] = (fundamental + harmonic) * envelope * 0.4;
    }
    soundBuffersRef.current['ding'] = dingBuffer;

    // Explosion sound - noise burst with low frequency rumble
    const explosionDuration = 1.0;
    const explosionBuffer = ctx.createBuffer(1, sampleRate * explosionDuration, sampleRate);
    const explosionData = explosionBuffer.getChannelData(0);
    
    for (let i = 0; i < explosionData.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 4); // Decay
      const noise = (Math.random() - 0.5);
      const rumble = Math.sin(2 * Math.PI * 60 * t) * 0.7; // Low frequency rumble
      explosionData[i] = (noise * 0.8 + rumble) * envelope * 0.5;
    }
    soundBuffersRef.current['explosion'] = explosionBuffer;
  }, []);

  const playSound = useCallback(async (soundName: string) => {
    if (!settings.enabled || !audioContextRef.current || !isInitializedRef.current) {
      return;
    }

    try {
      const ctx = audioContextRef.current;
      
      // Resume context if suspended (required for user interaction)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const buffer = soundBuffersRef.current[soundName];
      if (!buffer) return;

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = settings.volume;
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      source.start(0);
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }, [settings.enabled, settings.volume]);

  const playTakeoff = useCallback(() => playSound('takeoff'), [playSound]);
  const playDing = useCallback(() => playSound('ding'), [playSound]);
  const playExplosion = useCallback(() => playSound('explosion'), [playSound]);

  const toggleSound = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  return { 
    playTakeoff, 
    playDing, 
    playExplosion,
    toggleSound,
    setVolume,
    settings
  };
};

export default useSound;