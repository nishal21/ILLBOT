import React, { useState, useCallback } from 'react';
import { gradeEssay } from '../services/geminiService';
import { EssayGrade, Mode } from '../types';
import { Loader } from './Loader';
import { EssayGraderIcon } from '../constants';
import { XCircleIcon } from './ViewIcons';

const Gauge: React.FC<{ score: number }> = ({ score }) => {
    const rotation = (score / 100) * 180;
    const color = score > 85 ? 'text-green-500' : score > 65 ? 'text-yellow-500' : 'text-red-500';
  
    return (
      <div className="w-64 h-32 relative flex-shrink-0">
        <div className="w-full h-full overflow-hidden">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="#334155" strokeWidth="10" />
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className={color}
              style={{
                strokeDasharray: 141.37, // half circumference of circle with r=45
                strokeDashoffset: 141.37 - (score / 100) * 141.37,
                transition: 'stroke-dashoffset 0.5s ease-in-out',
              }}
            />
          </svg>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <span className={`text-4xl font-bold ${color}`}>{score.toFixed(0)}</span>
          <p className="text-sm text-slate-400 text-center -mt-1">/ 100</p>
        </div>
      </div>
    );
};

interface EssayGraderViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const EssayGraderView: React.FC<EssayGraderViewProps> = ({ logActivity }) => {
    const [inputText, setInputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<EssayGrade | null>(null);

    const onGrade = useCallback(async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const gradeResult = await gradeEssay(inputText);
            setResult(gradeResult);
            logActivity('Graded an essay', Mode.EssayGrader, inputText.split(/\s+/).filter(Boolean).length);
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
                    onClick={onGrade}
                    disabled={isLoading || !inputText}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? <Loader /> : <><EssayGraderIcon className="w-5 h-5" /> Grade Essay</>}
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your essay here for grading..."
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
                            <div className="w-full text-left grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-green-900/30 border border-green-500/30 p-3 rounded-lg">
                                    <h4 className="font-semibold text-green-300 mb-1">Strengths</h4>
                                    <p className="text-sm text-slate-300">{result.strengths}</p>
                                </div>
                                <div className="bg-red-900/30 border border-red-500/30 p-3 rounded-lg">
                                    <h4 className="font-semibold text-red-300 mb-1">Areas for Improvement</h4>
                                    <p className="text-sm text-slate-300">{result.areasForImprovement}</p>
                                </div>
                            </div>
                            <div className="w-full text-left mt-2 border-t border-slate-700 pt-4">
                                <h4 className="font-semibold text-slate-200 mb-2">Detailed Feedback</h4>
                                <div className="prose prose-sm prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: result.detailedFeedback.replace(/\n/g, '<br/>') }}></div>
                            </div>
                        </div>
                    )}
                    {!isLoading && !error && !result && (
                        <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
                            <EssayGraderIcon className="w-16 h-16 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Essay Grade</h3>
                            <p>Grading results will appear here after analysis.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};