import React, { useState, useEffect } from 'react';
import {
  Clock,
  Shield,
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Sliders,
  Check,
} from 'lucide-react';
import type { ExchangeConfig, CoinCountdownRecord } from '../types/index.js';

interface CountdownSectionProps {
  config: ExchangeConfig;
  countdowns: CoinCountdownRecord[];
  onUpdateConfig: (updated: Partial<ExchangeConfig>) => Promise<void>;
  onClearCountdown: (coin: string, timeframe?: string) => Promise<void>;
  onClearAllCountdowns: () => Promise<void>;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({
  config,
  countdowns,
  onUpdateConfig,
  onClearCountdown,
  onClearAllCountdowns,
}) => {
  const [mode, setMode] = useState<'OFF' | 'ONLY_TIMEFRAME' | 'ALL_TIMEFRAMES'>(
    config.countdownMode || 'OFF'
  );
  const [allTfDuration, setAllTfDuration] = useState<'12h' | '24h' | 'CUSTOM'>(
    config.countdownAllTfDuration || '12h'
  );
  const [customHours, setCustomHours] = useState<number>(config.countdownCustomHours || 12);
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Sync internal state with incoming config
  useEffect(() => {
    setMode(config.countdownMode || 'OFF');
    setAllTfDuration(config.countdownAllTfDuration || '12h');
    setCustomHours(config.countdownCustomHours || 12);
  }, [config.countdownMode, config.countdownAllTfDuration, config.countdownCustomHours]);

  // Live timer tick every second for real-time countdown updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleModeChange = async (newMode: 'OFF' | 'ONLY_TIMEFRAME' | 'ALL_TIMEFRAMES') => {
    setMode(newMode);
    setIsSaving(true);
    try {
      await onUpdateConfig({ countdownMode: newMode });
      setActionSuccess(`Countdown Mode updated to ${newMode}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAllTfDurationChange = async (dur: '12h' | '24h' | 'CUSTOM') => {
    setAllTfDuration(dur);
    setIsSaving(true);
    try {
      await onUpdateConfig({
        countdownAllTfDuration: dur,
        countdownCustomHours: dur === 'CUSTOM' ? customHours : dur === '12h' ? 12 : 24,
      });
      setActionSuccess(`All Timeframes Duration set to ${dur}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomHoursChange = async (hours: number) => {
    const clean = Math.max(1, Math.min(168, hours));
    setCustomHours(clean);
    setIsSaving(true);
    try {
      await onUpdateConfig({
        countdownAllTfDuration: 'CUSTOM',
        countdownCustomHours: clean,
      });
      setActionSuccess(`Custom duration set to ${clean} hours`);
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to calculate live remaining time in HH:MM:SS
  const getLiveRemaining = (expiresAt: string) => {
    const now = Date.now();
    const expMs = new Date(expiresAt).getTime();
    const diffSec = Math.max(0, Math.floor((expMs - now) / 1000));
    if (diffSec <= 0) return { formatted: '00:00:00', percentRemaining: 0, isExpired: true };

    const hours = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;
    const formatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return { formatted, percentRemaining: 100, isExpired: false };
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c1322] via-[#090e1a] to-[#060a12] border border-cyan-800/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/60">
              <Clock className="w-5 h-5 text-cyan-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                  Countdown Section &bull; Expiry Cooldown Engine
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    mode === 'OFF'
                      ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      : mode === 'ONLY_TIMEFRAME'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-purple-950 text-purple-300 border-purple-600'
                  }`}
                >
                  {mode === 'OFF'
                    ? 'COUNTDOWN: OFF'
                    : mode === 'ONLY_TIMEFRAME'
                    ? 'ONLY TIMEFRAME COUNTDOWN'
                    : 'ALL TIMEFRAMES COUNTDOWN'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                TP, SL या Manual Close के बाद उसी कॉइन में तुरंत नया ऑर्डर रोकने और फ्रेश मार्केट डेटा से हाई-प्रॉफ़िट सेटअप लेने के लिए ऑटो-काउंटडाउन।
              </p>
            </div>
          </div>

          {actionSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[11px] animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
          )}
        </div>

        {/* Mode Selector - 3 Distinct Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Option 1: OFF */}
          <button
            onClick={() => handleModeChange('OFF')}
            disabled={isSaving}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              mode === 'OFF'
                ? 'bg-zinc-800/90 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                : 'bg-[#0a0f1c] border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`font-extrabold text-xs ${mode === 'OFF' ? 'text-white' : 'text-zinc-300'}`}>
                  1. OFF (Normal Mode)
                </span>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${mode === 'OFF' ? 'bg-cyan-500 border-cyan-400' : 'border-zinc-600'}`}>
                  {mode === 'OFF' && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                सामान्य कार्यप्रणाली। ट्रेड क्लोज़ होने पर कोई लंबा एक्सपायरी काउंटडाउन नहीं लगेगा।
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[10px] text-zinc-500 font-bold">
              No Expiry Lock &bull; Standard 30s settle
            </div>
          </button>

          {/* Option 2: ONLY TIMEFRAME COUNTDOWN */}
          <button
            onClick={() => handleModeChange('ONLY_TIMEFRAME')}
            disabled={isSaving}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              mode === 'ONLY_TIMEFRAME'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                : 'bg-[#0a0f1c] border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`font-extrabold text-xs ${mode === 'ONLY_TIMEFRAME' ? 'text-emerald-300' : 'text-zinc-300'}`}>
                    2. Only Timeframe Countdown
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-900/60 text-emerald-200 border border-emerald-600 font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${mode === 'ONLY_TIMEFRAME' ? 'bg-emerald-500 border-emerald-400' : 'border-zinc-600'}`}>
                  {mode === 'ONLY_TIMEFRAME' && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-300 leading-relaxed">
                जिस टाइमफ़्रेम का ऑर्डर क्लोज़ होगा सिर्फ उसी टाइमफ़्रेम पर काउंटडाउन लगेगा। दूसरे टाइमफ़्रेम पर नया सेटअप बन सकता है।
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-zinc-800 grid grid-cols-4 gap-1 text-[9.5px] text-center font-bold">
              <span className="p-1 rounded bg-[#060a12] text-cyan-300 border border-zinc-800">15m=4h</span>
              <span className="p-1 rounded bg-[#060a12] text-teal-300 border border-zinc-800">30m=8h</span>
              <span className="p-1 rounded bg-[#060a12] text-amber-300 border border-zinc-800">1h=12h</span>
              <span className="p-1 rounded bg-[#060a12] text-purple-300 border border-zinc-800">4h=24h</span>
            </div>
          </button>

          {/* Option 3: ALL TIMEFRAMES COUNTDOWN */}
          <button
            onClick={() => handleModeChange('ALL_TIMEFRAMES')}
            disabled={isSaving}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              mode === 'ALL_TIMEFRAMES'
                ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
                : 'bg-[#0a0f1c] border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`font-extrabold text-xs ${mode === 'ALL_TIMEFRAMES' ? 'text-purple-300' : 'text-zinc-300'}`}>
                  3. All Timeframe Countdown
                </span>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${mode === 'ALL_TIMEFRAMES' ? 'bg-purple-500 border-purple-400' : 'border-zinc-600'}`}>
                  {mode === 'ALL_TIMEFRAMES' && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-300 leading-relaxed">
                पूरा कॉइन लॉक। किसी भी टाइमफ़्रेम का ऑर्डर क्लोज़ होने पर तय घंटों तक उस कॉइन के किसी भी टाइमफ़्रेम में नया सेटअप नहीं बनेगा।
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[10px] text-purple-300 font-bold">
              Full Coin Cooldown &bull; Active Duration: {allTfDuration === 'CUSTOM' ? `${customHours}h` : allTfDuration}
            </div>
          </button>
        </div>

        {/* Sub-Settings for All Timeframes Countdown */}
        {mode === 'ALL_TIMEFRAMES' && (
          <div className="p-3.5 rounded-xl bg-[#080d16] border border-purple-900/60 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>All Timeframes Lock Duration (पूरे कॉइन के लिए समय चुनें):</span>
              </span>
              <span className="text-zinc-400 text-[10.5px]">
                Active: <strong className="text-white">{allTfDuration === 'CUSTOM' ? `${customHours} Hours` : allTfDuration}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['12h', '24h', 'CUSTOM'] as const).map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleAllTfDurationChange(dur)}
                  disabled={isSaving}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
                    allTfDuration === dur
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950/50'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <span>{dur === 'CUSTOM' ? 'Custom Set (कस्टम घंटे)' : `${dur} Lock`}</span>
                </button>
              ))}

              {allTfDuration === 'CUSTOM' && (
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                  <span className="text-zinc-400 text-[11px]">घंटे (Hours):</span>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={customHours}
                    onChange={(e) => setCustomHours(Number(e.target.value))}
                    onBlur={(e) => handleCustomHoursChange(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-black border border-purple-600 rounded text-purple-300 font-bold text-xs focus:outline-none text-center"
                  />
                  <button
                    onClick={() => handleCustomHoursChange(customHours)}
                    className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700 rounded text-[11px] font-bold"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active Countdowns Table / Grid */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0f1a] border border-zinc-800 space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold text-sm text-white">
              Active Cooldown & Expiry Quarantine ({countdowns.length})
            </span>
          </div>

          {countdowns.length > 0 && (
            <button
              onClick={onClearAllCountdowns}
              className="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Unlock and clear all coin countdowns immediately"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All Active Countdowns</span>
            </button>
          )}
        </div>

        {countdowns.length === 0 ? (
          <div className="py-10 text-center space-y-2 bg-[#060910] rounded-xl border border-zinc-900">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-zinc-300 font-bold text-xs">
              कोई कॉइन काउंटडाउन क्वारंटाइन में नहीं है (No Active Countdowns)
            </div>
            <p className="text-zinc-500 text-[11px] max-w-md mx-auto">
              जैसे ही किसी कॉइन का ऑर्डर TP, SL या Manual Close होगा, चुने गए मोड के अनुसार उसका लाइव टाइमर यहाँ आ जाएगा।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {countdowns.map((cd) => {
              const live = getLiveRemaining(cd.expiresAt);
              return (
                <div
                  key={cd.id || `${cd.coin}_${cd.timeframe}`}
                  className="p-3.5 rounded-xl bg-gradient-to-br from-[#0c1424] to-[#070b14] border border-cyan-900/60 shadow-lg space-y-2.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{cd.coin}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600">
                        {cd.timeframe === 'ALL' ? 'ALL TIMEFRAMES' : cd.timeframe}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {cd.durationHours}h Lock
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#050812] rounded-lg border border-cyan-950 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">क्लोज़ कारण (Trigger):</span>
                      <strong className={`font-bold ${
                        cd.closeReason.includes('TP')
                          ? 'text-emerald-400'
                          : cd.closeReason.includes('SL')
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}>
                        {cd.closeReason}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">एक्सपायरी समय (Expiry):</span>
                      <span className="text-zinc-300 font-mono text-[10.5px]">
                        {new Date(cd.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Live Clock Display */}
                  <div className="p-2 bg-gradient-to-r from-cyan-950/60 via-[#0a1120] to-indigo-950/60 rounded-lg border border-cyan-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">REMAINING:</span>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-cyan-300 tracking-wider">
                      {live.formatted}
                    </span>
                  </div>

                  {/* Unlock / Reset Button */}
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onClearCountdown(cd.coin, cd.timeframe)}
                      className="px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-[10.5px] font-bold transition flex items-center gap-1"
                      title="1-Click Unlock: Remove countdown and allow bot to scan coin immediately"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" />
                      <span>Unlock / Scan Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
