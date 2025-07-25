import React, { useState, useCallback } from 'react';
import { detectAIText, AIDetectionResult } from '../services/geminiService';
import { Loader } from './Loader';
import { AIDetectorIcon } from '../constants';
import { XCircleIcon } from './ViewIcons';
import { Mode } from '../types';

const Gauge: React.FC<{ score: number }> = ({ score }) => {
  const rotation = (score / 100) * 180;
  const color = score > 75 ? 'text-red-500' : score > 50 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="w-64 h-32 relative flex-shrink-0">
      <div className="w-full h-full overflow-hidden">
        <div
          className="w-full h-full rounded-t-full border-t-8 border-l-8 border-r-8 border-slate-700"
          style={{
            borderColor: '#334155',
          }}
        ></div>
        <div
          className={`w-full h-full rounded-t-full border-t-8 border-l-8 border-r-8 absolute bottom-0 left-0 ${color}`}
          style={{
            clipPath: `polygon(0% 100%, 0% 0%, ${score}%, 0%, ${score}%, 100%)`,
            transition: 'clip-path 0.5s ease-in-out',
          }}
        ></div>
      </div>
      <div
        className="h-1/2 w-1 bg-slate-200 absolute bottom-0 left-1/2 origin-bottom transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
      ></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <span className={`text-4xl font-bold ${color}`}>{score.toFixed(0)}%</span>
        <p className="text-sm text-slate-400 text-center">{score > 50 ? "Likely AI-Generated" : "Likely Human-Written"}</p>
      </div>
    </div>
  );
};

interface AIDetectorViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const AIDetectorView: React.FC<AIDetectorViewProps> = ({ logActivity }) => {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIDetectionResult | null>(null);

  const onDetect = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const detectionResult = await detectAIText(inputText);
      setResult(detectionResult);
      logActivity(`Detected AI content (${detectionResult.score.toFixed(0)}%)`, Mode.AIDetector, inputText.split(/\s+/).filter(Boolean).length);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, logActivity]);

  const onClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
        <button
          onClick={onDetect}
          disabled={isLoading || !inputText}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader /> : <><AIDetectorIcon className="w-5 h-5" /> Detect AI</>}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to analyze for AI presence..."
            className="w-full flex-1 p-4 bg-transparent resize-none focus:outline-none placeholder-slate-500 text-slate-200"
          ></textarea>
          <div className="flex justify-between items-center p-2 border-t border-slate-700">
            <button
              onClick={onClear}
              className="p-1 text-slate-400 hover:text-white transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
              title="Clear text"
              disabled={!inputText}
            >
              <XCircleIcon />
            </button>
            <span className="text-xs text-slate-400">{inputText.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg relative p-4 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
              <Loader />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center p-4 rounded-xl">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}
          {!isLoading && !error && result && (
            <div className="flex flex-col items-center gap-4 text-center h-full overflow-y-auto">
              <Gauge score={result.score} />
              <p className="text-slate-300 max-w-md">{result.explanation}</p>
              {result.suspiciousSentences && result.suspiciousSentences.length > 0 && (
                <div className="w-full text-left mt-4 border-t border-slate-700 pt-4">
                    <h4 className="font-semibold text-slate-200 mb-2">Sentences that may indicate AI generation:</h4>
                    <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
                        {result.suspiciousSentences.map((sentence, index) => (
                            <li key={index} className="italic">"{sentence}"</li>
                        ))}
                    </ul>
                </div>
              )}
            </div>
          )}
          {!isLoading && !error && !result && (
            <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
              <AIDetectorIcon className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">AI Detection Results</h3>
              <p>Results will appear here after analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};