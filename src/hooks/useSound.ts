
import { useCallback } from 'react';

// This is a mock sound hook. In a real application, you would use
// the Web Audio API or a library like Howler.js to play actual sound files.
// For example: const takeoffSound = new Audio('/sounds/takeoff.mp3');

const useSound = () => {
  const playSound = useCallback((soundName: string) => {
    // console.log(`Playing sound: ${soundName}`);
    // In a real implementation:
    // switch (soundName) {
    //   case 'takeoff': takeoffSound.play(); break;
    //   case 'ding': dingSound.play(); break;
    //   case 'explosion': explosionSound.play(); break;
    // }
  }, []);

  const playTakeoff = useCallback(() => playSound('takeoff'), [playSound]);
  const playDing = useCallback(() => playSound('ding'), [playSound]);
  const playExplosion = useCallback(() => playSound('explosion'), [playSound]);

  return { playTakeoff, playDing, playExplosion };
};

export default useSound;