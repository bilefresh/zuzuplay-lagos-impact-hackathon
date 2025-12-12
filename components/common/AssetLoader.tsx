'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ProgressBar from './ProgressBar';
import './AssetLoader.css';

interface AssetLoaderProps {
  onLoadingComplete: () => void;
  assets?: string[];
  unityAssets?: {
    loaderUrl: string;
    dataUrl: string;
    frameworkUrl: string;
    codeUrl: string;
  };
  children?: React.ReactNode;
}

interface LoadingAsset {
  url: string;
  loaded: boolean;
  error: boolean;
}

const AssetLoader: React.FC<AssetLoaderProps> = ({ 
  onLoadingComplete, 
  assets = [],
  unityAssets,
  children 
}) => {
  const [loadingAssets, setLoadingAssets] = useState<LoadingAsset[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading assets...');
  const hasStartedLoading = useRef(false);

  // Default assets to preload if none provided
  const defaultAssets = [
    '/assets/icons/zuzuplay.svg',
    '/assets/icons/logo.svg',
    '/assets/icons/playerCar.svg',
    '/assets/icons/zuzuplayCar.svg',
    '/assets/icons/ghostCar.svg',
    '/assets/icons/coins.svg',
    '/assets/icons/correct.svg',
    '/assets/icons/incorrect.svg',
    '/assets/icons/timer.svg',
    '/assets/icons/restart.svg',
    '/assets/icons/slo-mo.svg',
    '/assets/icons/restart-active.svg',
    '/assets/icons/slo-mo-active.svg',
    '/assets/images/playerCar.png',
    '/assets/images/coin.png',
    '/assets/images/backgroundImage.png',
    '/assets/images/studIllustration.png',
    '/audio/kids-game-music-1.mp3',
    '/audio/kids-game-music-2.mp3',
    '/audio/kids-game-music-3.mp3',
    '/audio/kids-game-music-4.mp3',
    '/audio/kids-game-music-5.mp3',
    '/audio/kids-game-music-6.mp3',
    '/audio/kids-game-music-7.mp3',
    '/audio/kids-game-music-8.mp3',
  ];

  // Memoize the assets to prevent recreation on every render
  const allAssetsToLoad = useMemo(() => {
    const unityAssetUrls = unityAssets ? [
      unityAssets.loaderUrl,
      unityAssets.dataUrl,
      unityAssets.frameworkUrl,
      unityAssets.codeUrl
    ] : [];
    
    const assetsToLoad = assets.length > 0 ? assets : defaultAssets;
    return [...assetsToLoad, ...unityAssetUrls];
  }, [assets, unityAssets]);

  const preloadAsset = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const asset = new Image();
      const audio = new Audio();
      
      let loaded = false;
      let error = false;

      const handleLoad = () => {
        if (!loaded) {
          loaded = true;
          resolve(true);
        }
      };

      const handleError = () => {
        if (!loaded) {
          error = true;
          loaded = true;
          resolve(false);
        }
      };

      // Try loading as image first
      asset.onload = handleLoad;
      asset.onerror = () => {
        // If image fails, try as audio
        audio.onloadeddata = handleLoad;
        audio.onerror = handleError;
        audio.src = url;
        audio.load();
      };
      
      asset.src = url;
    });
  }, []);

  const loadAssets = useCallback(async () => {
    if (hasStartedLoading.current) return;
    hasStartedLoading.current = true;

    setIsLoading(true);
    setProgress(0);
    setLoadingText('Preparing assets...');

    // Initialize loading state
    const initialAssets = allAssetsToLoad.map(url => ({
      url,
      loaded: false,
      error: false
    }));
    setLoadingAssets(initialAssets);

    let loadedCount = 0;
    const totalAssets = allAssetsToLoad.length;

    setLoadingText('Loading game assets...');

    for (let i = 0; i < allAssetsToLoad.length; i++) {
      const url = allAssetsToLoad[i];
      
      try {
        const success = await preloadAsset(url);
        
        setLoadingAssets(prev => 
          prev.map(asset => 
            asset.url === url 
              ? { ...asset, loaded: success, error: !success }
              : asset
          )
        );

        loadedCount++;
        const newProgress = Math.round((loadedCount / totalAssets) * 100);
        setProgress(newProgress);

        // Update loading text based on progress
        if (newProgress < 20) {
          setLoadingText('Loading graphics...');
        } else if (newProgress < 40) {
          setLoadingText('Loading sounds...');
        } else if (newProgress < 60) {
          setLoadingText('Loading game engine...');
        } else if (newProgress < 80) {
          setLoadingText('Preparing game data...');
        } else if (newProgress < 95) {
          setLoadingText('Finalizing...');
        } else {
          setLoadingText('Almost ready...');
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.warn(`Failed to load asset: ${url}`, error);
        setLoadingAssets(prev => 
          prev.map(asset => 
            asset.url === url 
              ? { ...asset, loaded: false, error: true }
              : asset
          )
        );
        loadedCount++;
        const newProgress = Math.round((loadedCount / totalAssets) * 100);
        setProgress(newProgress);
      }
    }

    // Final delay to show 100% completion
    setProgress(100);
    setLoadingText('Ready to play!');
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsLoading(false);
    onLoadingComplete();
  }, [allAssetsToLoad, preloadAsset, onLoadingComplete]);

  useEffect(() => {
    loadAssets();
  }, []); // Empty dependency array to run only once

  if (!isLoading) {
    return <>{children}</>;
  }

  const errorCount = loadingAssets.filter(asset => asset.error).length;
  const successCount = loadingAssets.filter(asset => asset.loaded).length;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-4 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Loading content */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 mx-4 max-w-md w-full border border-white/20 shadow-2xl asset-loader-container asset-loader-glow">
        {/* Logo/Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-2xl">
            🏎️
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Math Racer</h2>
          <p className="text-white/80">Get ready for the race!</p>
        </div>

        {/* Progress section */}
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-white font-medium mb-2">{loadingText}</p>
            <div className="text-3xl font-bold text-white mb-2">{progress}%</div>
          </div>

          {/* Custom progress bar */}
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full bg-white/30 animate-pulse asset-loader-shimmer"></div>
            </div>
          </div>

          {/* Asset loading details */}
          <div className="text-center text-sm text-white/70">
            <div className="flex justify-between items-center">
              <span>Loaded: {successCount}</span>
              <span>Total: {allAssetsToLoad.length}</span>
            </div>
            {errorCount > 0 && (
              <div className="text-yellow-400 mt-1">
                {errorCount} assets failed to load
              </div>
            )}
          </div>
        </div>

        {/* Loading animation */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetLoader;
