import { useRef, useCallback, useEffect } from 'react';

export type NotificationSound = 'approval-pending' | 'task-completed';

interface SoundNotificationOptions {
  enabled?: boolean;
  volume?: number; // 0-1 range
  soundUris?: { [key: string]: string } | null;
}

/**
 * Hook for managing sound notifications in the VS Code webview
 * Handles HTML5 Audio API with graceful fallbacks for browser restrictions
 */
export function useSoundNotifications(options: SoundNotificationOptions = {}) {
  const { enabled = true, volume = 0.3, soundUris = null } = options;
  const audioCache = useRef<Map<NotificationSound, HTMLAudioElement>>(new Map());
  const userHasInteracted = useRef<boolean>(false);
  
  // Set up user interaction detection
  useEffect(() => {
    const handleUserInteraction = () => {
      userHasInteracted.current = true;
      console.log('User interaction detected - audio playback now allowed');
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);
  
  // Get sound URI with fallback options
  const getSoundUri = useCallback((sound: NotificationSound): string | null => {
    // Method 1: Try PostMessage soundUris (preferred - most reliable)
    if (soundUris && soundUris[sound]) {
      console.log('Found sound URI via PostMessage:', soundUris[sound]);
      return soundUris[sound];
    }
    
    // Method 2: Try window.soundURIs (fallback)
    const soundURIs = (window as any).soundURIs;
    if (soundURIs && soundURIs[sound]) {
      console.log('Found sound URI via window.soundURIs:', soundURIs[sound]);
      return soundURIs[sound];
    }
    
    // Method 3: Try data attributes as last resort
    const root = document.getElementById('root');
    if (root) {
      const uriAttr = sound === 'approval-pending' 
        ? root.getAttribute('data-approval-sound-uri')
        : root.getAttribute('data-task-completed-sound-uri');
      
      if (uriAttr) {
        console.log('Found sound URI via data attribute:', uriAttr);
        return uriAttr;
      }
    }
    
    console.warn(`Sound URI not found for: ${sound}`, { 
      postMessageUris: soundUris,
      windowSoundURIs: soundURIs, 
      requestedSound: sound,
      soundURIsReady: (window as any).soundURIsReady
    });
    return null;
  }, [soundUris]);

  // Initialize or get cached audio element
  const getAudioElement = useCallback((sound: NotificationSound): HTMLAudioElement | null => {
    if (!enabled) {
      return null;
    }
    
    // Check if we already have this audio cached
    let audio = audioCache.current.get(sound);
    
    if (!audio) {
      try {
        // Create new audio element
        audio = new Audio();
        
        // Get sound URI with fallbacks
        const soundUri = getSoundUri(sound);
        if (!soundUri) {
          return null;
        }
        
        audio.src = soundUri;
        console.log('Set audio source to:', audio.src);
        
        audio.volume = volume;
        audio.preload = 'auto';
        
        // Handle loading errors gracefully
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load sound: ${sound}`, e);
          // Remove from cache so we don't keep trying
          audioCache.current.delete(sound);
        });
        
        // Cache the audio element
        audioCache.current.set(sound, audio);
        
      } catch (error) {
        console.warn(`Failed to create audio element for ${sound}:`, error);
        return null;
      }
    }
    
    // Update volume in case it changed
    if (audio) {
      audio.volume = volume;
    }
    
    return audio;
  }, [enabled, volume, getSoundUri]);
  
  // Play a notification sound
  const playNotification = useCallback(async (sound: NotificationSound): Promise<void> => {
    console.log('playNotification called with:', { sound, enabled, userHasInteracted: userHasInteracted.current });
    
    if (!enabled) {
      console.log('Sound notifications disabled');
      return;
    }
    
    if (!userHasInteracted.current) {
      console.warn('Cannot play sound - user has not interacted with page yet (browser autoplay restriction)');
      return;
    }
    
    try {
      const audio = getAudioElement(sound);
      if (!audio) {
        console.warn('No audio element available for sound:', sound);
        return;
      }
      
      console.log('Playing sound:', sound, 'with audio element:', audio);
      
      // Reset audio to beginning in case it was played recently
      audio.currentTime = 0;
      
      // Play the audio
      const playPromise = audio.play();
      
      // Handle the promise if it exists (modern browsers)
      if (playPromise) {
        console.log('Awaiting audio playback...');
        await playPromise;
        console.log('Audio playback completed successfully');
      } else {
        console.log('Audio play() did not return promise (legacy browser)');
      }
      
    } catch (error) {
      // This is expected in many scenarios (user hasn't interacted, autoplay blocked, etc.)
      console.warn(`Sound notification blocked or failed for ${sound}:`, error);
    }
  }, [enabled, getAudioElement]);
  
  // Specific notification methods
  const playApprovalPending = useCallback(() => {
    return playNotification('approval-pending');
  }, [playNotification]);
  
  const playTaskCompleted = useCallback(() => {
    return playNotification('task-completed');
  }, [playNotification]);
  
  // Test sound functionality (useful for settings)
  const testSound = useCallback((sound: NotificationSound) => {
    return playNotification(sound);
  }, [playNotification]);
  
  // Cleanup function to release audio resources
  const cleanup = useCallback(() => {
    audioCache.current.forEach((audio) => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    });
    audioCache.current.clear();
  }, []);
  
  return {
    playApprovalPending,
    playTaskCompleted,
    testSound,
    cleanup,
    isEnabled: enabled
  };
}