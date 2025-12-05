import React, { useState } from 'react';
import { useNotifications, useNotificationState } from './NotificationProvider';
import { useTranslation } from 'react-i18next';
import styles from './VolumeControl.module.css';

export function VolumeControl() {
  const { toggleSound, setVolume } = useNotifications();
  const { soundEnabled, volume } = useNotificationState();
  const { t } = useTranslation();
  const [showSlider, setShowSlider] = useState(false);
  
  // Convert volume (0.0-1.0) to percentage (0-100) for display
  const volumePercentage = Math.round(volume * 100);
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseInt(e.target.value);
    const volumeValue = percentage / 100;
    setVolume(volumeValue);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Mute/Unmute Button */}
      <button
        onClick={toggleSound}
        className={`p-2 rounded-xl transition-all duration-200
          bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm
          border border-gray-200/30 dark:border-gray-700/30
          hover:bg-purple-500/10 hover:border-purple-400/30
          ${soundEnabled ? 'text-purple-500 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}
        title={soundEnabled ? t('volumeControl.mute') : t('volumeControl.enable')}
      >
        {soundEnabled ? (
          // Volume on icon
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8 19a1 1 0 01-1-1v-6a1 1 0 011-1h2.172a3 3 0 001.414-.586L15 7a1 1 0 011 1v8a1 1 0 01-1 1l-3.414-3.414A3 3 0 0010.172 13H8a1 1 0 01-1-1V7a1 1 0 011-1z" />
          </svg>
        ) : (
          // Volume off icon
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1V9a1 1 0 011-1h1.586l4.707-4.707C10.923 2.663 12 3.109 12 4v16c0 .891-1.077 1.337-1.707.707L5.586 16z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </button>

      {/* Volume Slider - only show when sound is enabled */}
      {soundEnabled && (
        <div className={`${styles.sliderContainer} flex items-center gap-2 px-3 py-1.5 rounded-xl
          bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm
          border border-gray-200/20 dark:border-gray-700/20`}>
          <input
            type="range"
            min="0"
            max="100"
            value={volumePercentage}
            onChange={handleVolumeChange}
            className={styles.slider}
            title={t('volumeControl.volumeLevel', { percentage: volumePercentage })}
          />
          <span className={`text-xs min-w-[2rem] font-medium transition-colors
            ${volumePercentage > 0 ? 'text-purple-500 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {volumePercentage}%
          </span>
        </div>
      )}
    </div>
  );
}