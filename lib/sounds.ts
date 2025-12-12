"use client";
import { useEffect } from "react";
import type { PolySynth, Synth } from "tone";

// Singleton pattern for audio initialization
let isInitialized = false;
let isAudioContextStarted = false;
let startSynth: PolySynth | null = null;
let correctSynth: Synth | null = null;
let incorrectSynth: Synth | null = null;
let carSynth: Synth | null = null;
let finishSynth: PolySynth | null = null;

// Background music tracks system
let backgroundAudio: HTMLAudioElement | null = null;
let backgroundPlaying = false;
let currentTrackIndex = 0;
let shuffleMode = true; // Enable shuffle by default for variety
let repeatMode: 'off' | 'track' | 'playlist' = 'playlist'; // Default to repeat playlist
let shuffledIndices: number[] = [];

// List of background music tracks - specifically selected for K-12 engagement
const backgroundTracks = [
  '/audio/kids-game-music-1.mp3', // Carefree - Upbeat and cheerful
  '/audio/kids-game-music-2.mp3', // Happy Boy End Theme - Celebratory
  '/audio/kids-game-music-3.mp3', // Wallpaper - Gentle flow
  '/audio/kids-game-music-4.mp3', // Quirky Dog - Fun and bouncy
  '/audio/kids-game-music-5.mp3', // Silly Fun - High-energy and playful
  '/audio/kids-game-music-6.mp3', // Sunshine A - Bright and addictive
  '/audio/kids-game-music-8.mp3', // Monkeys Spinning Monkeys - Ultra catchy
];

// Fallback variables for when no audio files are available
let fallbackSynth: Synth | null = null;
let fallbackLoop: any = null;
let usingFallback = false;

// Shuffle utility functions
const createShuffledIndices = () => {
  const indices = Array.from({ length: backgroundTracks.length }, (_, i) => i);
  // Fisher-Yates shuffle algorithm
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
};

const getNextTrackIndex = () => {
  if (shuffleMode) {
    // Initialize shuffle array if empty
    if (shuffledIndices.length === 0) {
      shuffledIndices = createShuffledIndices();
    }
    
    // Find current position in shuffle array
    const currentShufflePos = shuffledIndices.indexOf(currentTrackIndex);
    const nextShufflePos = (currentShufflePos + 1) % shuffledIndices.length;
    
    // If we've gone through all tracks, reshuffle for next cycle
    if (nextShufflePos === 0 && repeatMode === 'playlist') {
      shuffledIndices = createShuffledIndices();
    }
    
    return shuffledIndices[nextShufflePos];
  } else {
    // Sequential mode
    return (currentTrackIndex + 1) % backgroundTracks.length;
  }
};

const initializeAudio = async () => {
  if (typeof window === "undefined" || isInitialized) return;

  try {
    const Tone = await import("tone");

    // Only start the audio context after user interaction
    if (!isAudioContextStarted) {
      await Tone.start();
      isAudioContextStarted = true;
    }

    // Bell-like synthesizer for start sounds
    startSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.8 },
    }).toDestination();
    
    // Sparkly bell-like synth for correct answers
    correctSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.1, release: 1.2 },
    }).toDestination();
    
    // Gentle, soft synth for incorrect answers
    incorrectSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 0.8 },
    }).toDestination();
    // Toy-like car sound using oscillator instead of noise
    carSynth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0.3, release: 0.1 },
    }).toDestination();
    // Celebratory finish sound with bell-like quality
    finishSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.2, release: 1.5 },
    }).toDestination();

    // Initialize background music audio element
    initializeBackgroundMusic();

    isInitialized = true;
  } catch (error) {
    console.warn("Audio initialization failed:", error);
  }
};

// Background music initialization
const initializeBackgroundMusic = async () => {
  if (typeof window === "undefined") return;
  
  try {
    // Try to initialize audio files first
    backgroundAudio = new Audio();
    backgroundAudio.loop = false; // We'll handle looping manually for better control
    backgroundAudio.volume = 0.3;
    backgroundAudio.preload = 'auto';
    
    // Set up event listeners for smart track transitions
    backgroundAudio.addEventListener('ended', () => {
      handleTrackEnded();
    });
    
    backgroundAudio.addEventListener('error', (e) => {
      console.warn('Background music file error:', e);
      // Switch to fallback if files don't work
      if (!usingFallback) {
        initializeFallbackMusic();
      }
    });
    
    // Test if the first track exists
    if (backgroundTracks.length > 0) {
      backgroundAudio.src = backgroundTracks[currentTrackIndex];
      
      // Test load - if it fails, use fallback
      backgroundAudio.addEventListener('loadstart', () => {
        usingFallback = false;
      });
      
      setTimeout(() => {
        if (backgroundAudio?.networkState === 3) { // NETWORK_NO_SOURCE
          console.log('No audio files found, using fallback music');
          initializeFallbackMusic();
        }
      }, 1000);
    } else {
      initializeFallbackMusic();
    }
  } catch (error) {
    console.warn("Background music initialization failed:", error);
    initializeFallbackMusic();
  }
};

// Initialize fallback tone.js music when audio files aren't available
const initializeFallbackMusic = async () => {
  try {
    const Tone = await import("tone");
    
    fallbackSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 },
    }).toDestination();
    fallbackSynth.volume.value = -25; // Quieter than audio files
    
    // Create a simple, catchy background melody loop
    fallbackLoop = new Tone.Loop((time) => {
      if (!fallbackSynth) return;
      
      const melody = [
        "C5", "E5", "G5", "C5", 
        "F5", "E5", "D5", "C5",
        "G5", "F5", "E5", "D5",
        "C5", "E5", "G5", "C6"
      ];
      
      melody.forEach((note, index) => {
        fallbackSynth?.triggerAttackRelease(note, 0.4, time + index * 0.5);
      });
    }, "8m");
    
    usingFallback = true;
    console.log('Fallback music initialized');
  } catch (error) {
    console.warn('Fallback music initialization failed:', error);
  }
};

// Track management with shuffle and repeat support
const handleTrackEnded = () => {
  if (!backgroundAudio || !backgroundPlaying) return;
  
  if (repeatMode === 'track') {
    // Repeat the same track
    backgroundAudio.currentTime = 0;
    backgroundAudio.play().catch(e => console.warn('Failed to repeat track:', e));
  } else if (repeatMode === 'playlist' || repeatMode === 'off') {
    // Move to next track (or stop if repeat is off and we've finished all)
    playNextTrack();
  }
};

const playNextTrack = () => {
  if (!backgroundAudio || backgroundTracks.length === 0) return;
  
  if (repeatMode === 'off' && shuffleMode && shuffledIndices.length > 0) {
    const currentPos = shuffledIndices.indexOf(currentTrackIndex);
    if (currentPos === shuffledIndices.length - 1) {
      // Finished all tracks in shuffle mode with repeat off
      stopBackgroundMusic();
      return;
    }
  }
  
  currentTrackIndex = getNextTrackIndex();
  backgroundAudio.src = backgroundTracks[currentTrackIndex];
  
  if (backgroundPlaying) {
    backgroundAudio.play().catch(e => console.warn('Failed to play next track:', e));
  }
};

// Safe sound functions that handle uninitialized audio
const safePlaySound = (soundFunction: () => void) => {
  if (!isInitialized) {
    // Queue the sound to play after initialization
    const initAndPlay = async () => {
      await initializeAudio();
      if (isInitialized) {
        soundFunction();
      }
    };
    initAndPlay();
  } else {
    soundFunction();
  }
};

// Sound functions
export const playStartSound = () => {
  safePlaySound(() => {
    if (!startSynth) return;
    // Cheerful ascending melody in higher register for kids
    startSynth.triggerAttackRelease(["C5", "E5", "G5"], 0.4);
    setTimeout(() => {
      startSynth?.triggerAttackRelease(["G5", "C6", "E6"], 0.4);
    }, 300);
    setTimeout(() => {
      startSynth?.triggerAttackRelease(["C6", "E6", "G6", "C7"], 0.6);
    }, 600);
  });
};

export const playCorrectSound = () => {
  safePlaySound(() => {
    if (!correctSynth) return;
    // Cheerful celebration with bell-like ascending tones
    correctSynth.triggerAttackRelease("C6", 0.15);
    setTimeout(() => {
      correctSynth?.triggerAttackRelease("E6", 0.15);
    }, 100);
    setTimeout(() => {
      correctSynth?.triggerAttackRelease("G6", 0.2);
    }, 200);
    setTimeout(() => {
      correctSynth?.triggerAttackRelease("C7", 0.3);
    }, 350);
    // Add sparkly bell effect
    setTimeout(() => {
      correctSynth?.triggerAttackRelease("E7", 0.1);
    }, 500);
  });
};

export const playIncorrectSound = () => {
  safePlaySound(() => {
    if (!incorrectSynth) return;
    // Gentle, encouraging "try again" sound in higher register
    // Using a soft descending pattern that's not scary
    incorrectSynth.triggerAttackRelease("G5", 0.3);
    setTimeout(() => {
      incorrectSynth?.triggerAttackRelease("E5", 0.3);
    }, 200);
    setTimeout(() => {
      // End on a hopeful note that encourages trying again
      incorrectSynth?.triggerAttackRelease("C5", 0.4);
    }, 400);
  });
};

export const playCarSound = (speed: number) => {
  safePlaySound(() => {
    if (!carSynth) return;
    // Create toy car sounds with pitch variation based on speed
    // Higher speed = higher pitch, like a toy car accelerating
    const basePitch = "C5";
    const pitchOffset = Math.floor(speed * 2); // 0-4 semitones higher
    const notes = ["C5", "D5", "E5", "F5", "G5"];
    const note = notes[Math.min(pitchOffset, 4)];
    
    const volume = Math.min(-25 + speed * 3, -10);
    carSynth.volume.value = volume;
    carSynth.triggerAttackRelease(note, 0.08);
  });
};

export const playFinishSound = () => {
  safePlaySound(() => {
    if (!finishSynth) return;
    // Epic celebration fanfare with sparkly high notes
    // Start with triumphant chord
    finishSynth.triggerAttackRelease(["C5", "E5", "G5"], 0.5);
    
    // Ascending celebration melody
    const celebrationNotes = ["C6", "D6", "E6", "F6", "G6", "A6", "B6", "C7"];
    celebrationNotes.forEach((note, index) => {
      setTimeout(() => {
        finishSynth?.triggerAttackRelease(note, 0.3);
      }, 300 + index * 120);
    });
    
    // Final triumphant chord with sparkles
    setTimeout(() => {
      finishSynth?.triggerAttackRelease(["C6", "E6", "G6", "C7"], 1.0);
    }, 1400);
    
    // Sparkly finishing touches
    setTimeout(() => {
      finishSynth?.triggerAttackRelease("E7", 0.2);
    }, 1600);
    setTimeout(() => {
      finishSynth?.triggerAttackRelease("G7", 0.2);
    }, 1750);
  });
};

// Background music controls
export const startBackgroundMusic = () => {
  if (backgroundPlaying) return;
  
  if (usingFallback && fallbackLoop) {
    fallbackLoop.start();
    backgroundPlaying = true;
  } else if (backgroundAudio) {
    backgroundAudio.play()
      .then(() => {
        backgroundPlaying = true;
      })
      .catch(e => {
        console.warn('Failed to start background music:', e);
        // Try fallback if audio file fails
        if (!usingFallback) {
          initializeFallbackMusic().then(() => {
            if (fallbackLoop) {
              fallbackLoop.start();
              backgroundPlaying = true;
            }
          });
        }
      });
  }
};

export const stopBackgroundMusic = () => {
  if (usingFallback && fallbackLoop) {
    fallbackLoop.stop();
  } else if (backgroundAudio) {
    backgroundAudio.pause();
    // Reset to beginning for next play session
    backgroundAudio.currentTime = 0;
  }
  
  backgroundPlaying = false;
};

export const toggleBackgroundMusic = () => {
  if (backgroundPlaying) {
    stopBackgroundMusic();
  } else {
    startBackgroundMusic();
  }
};

// Additional background music controls
export const setBackgroundMusicVolume = (volume: number) => {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  
  if (usingFallback && fallbackSynth) {
    // Convert 0-1 to decibel range for tone.js (-40 to -10)
    const dbVolume = -40 + (clampedVolume * 30);
    fallbackSynth.volume.value = dbVolume;
  } else if (backgroundAudio) {
    backgroundAudio.volume = clampedVolume;
  }
};

export const skipToNextTrack = () => {
  if (usingFallback) {
    // For fallback, we could cycle through different melodies
    // For now, just restart the current loop
    if (fallbackLoop && backgroundPlaying) {
      fallbackLoop.stop();
      fallbackLoop.start();
    }
  } else {
    playNextTrack();
  }
};

export const getCurrentTrackName = () => {
  if (usingFallback) {
    return 'Built-in Melody';
  }
  
  if (backgroundTracks.length === 0) return 'No track';
  
  // Map track files to their actual names for better UX
  const trackNames = [
    'Carefree ♪',
    'Happy Boy End Theme 🎉',
    'Wallpaper 🌊',
    'Quirky Dog 🔥',
    'Silly Fun 🎯',
    'Sunshine A ☀️',
    'Monkeys Spinning Monkeys 🐵'
  ];
  
  return trackNames[currentTrackIndex] || 'Unknown track';
};

// Shuffle and repeat controls
export const toggleShuffle = () => {
  shuffleMode = !shuffleMode;
  if (shuffleMode) {
    // Create new shuffle when enabling
    shuffledIndices = createShuffledIndices();
  }
  return shuffleMode;
};

export const setRepeatMode = (mode: 'off' | 'track' | 'playlist') => {
  repeatMode = mode;
  return repeatMode;
};

export const getRepeatMode = () => repeatMode;
export const getShuffleMode = () => shuffleMode;

export const cycleRepeatMode = () => {
  const modes: ('off' | 'track' | 'playlist')[] = ['off', 'track', 'playlist'];
  const currentIndex = modes.indexOf(repeatMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  repeatMode = modes[nextIndex];
  return repeatMode;
};

// Complete audio shutdown for game end
export const stopAllAudio = () => {
  // Stop background music
  stopBackgroundMusic();
  
  // Stop fallback loop if running
  if (fallbackLoop) {
    try {
      fallbackLoop.stop();
    } catch (e) {
      // Ignore errors if already stopped
    }
  }
  
  // Reset all flags
  backgroundPlaying = false;
  
  console.log('All audio stopped - game ended');
};

// React hook for components that need to ensure initialization
export const useAudioInit = () => {
  useEffect(() => {
    // Don't auto-initialize - wait for user interaction
    const handleUserInteraction = async () => {
      if (!isInitialized) {
        await initializeAudio();
        // Remove event listeners after initialization
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);
};
