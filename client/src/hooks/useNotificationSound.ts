import { useState, useCallback, useRef } from 'react';

export function useNotificationSound() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSoundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Criar áudio de notificação (beep simples)
  const createNotificationAudio = useCallback(() => {
    if (!audioRef.current) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Som: 800Hz por 200ms, depois 1000Hz por 200ms
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    }
  }, []);

  const playSound = useCallback(() => {
    if (soundEnabled) {
      try {
        createNotificationAudio();
      } catch (error) {
        console.error('Erro ao reproduzir som:', error);
      }
    }
  }, [soundEnabled, createNotificationAudio]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem('notificationSoundEnabled', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  return {
    soundEnabled,
    playSound,
    toggleSound,
  };
}
