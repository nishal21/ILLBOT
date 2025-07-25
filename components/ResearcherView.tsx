import React, { useState, useCallback } from 'react';
import { researchTopic } from '../services/geminiService';
import { ResearchResult, Mode } from '../types';
import { Loader } from './Loader';
import { ResearchIcon } from '../constants';
import { XCircleIcon } from './ViewIcons';

interface ResearcherViewProps {
    logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const ResearcherView: React.FC<ResearcherViewProps> = ({ logActivity }) => {
    const [topic, setTopic] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResearchResult | null>(null);

    const onResearch = useCallback(async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const researchResult = await researchTopic(topic);
            setResult(researchResult);
            logActivity(`Researched "${topic}"`, Mode.Researcher);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [topic, logActivity]);

    const onClear = () => {
        setTopic('');
        setResult(null);
        setError(null);
    };

    return (
        <div className="h-full flex flex-col gap-6 max-w-5xl mx-auto">
            {/* Input section */}
            <div className="flex flex-col gap-2">
                <label htmlFor="topic-input" className="text-lg font-semibold text-slate-200">Research Topic</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        id="topic-input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., The impact of AI on modern education"
                        className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && onResearch()}
                    />
                     <button
                        onClick={onResearch}
                        disabled={isLoading || !topic}
                        className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
                        >
                        {isLoading ? <Loader /> : <><ResearchIcon className="w-5 h-5" /> Research</>}
                    </button>
                    <button
                        onClick={onClear}
                        className="flex-shrink-0 p-3 bg-slate-700/50 text-slate-400 hover:text-white rounded-lg transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
                        title="Clear"
                        disabled={!topic && !result}
                    >
                        <XCircleIcon />
                    </button>
                </div>
            </div>

            {/* Results section */}
            <div className="flex-1 flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg relative min-h-[400px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                        <Loader />
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center p-4 rounded-xl z-10">
                        <p className="text-red-300 text-center">{error}</p>
                    </div>
                )}
                {result && !isLoading && (
                    <div className="p-6 overflow-y-auto h-full">
                        <h3 className="text-xl font-bold text-slate-100 mb-4">Research Summary</h3>
                        <div className="prose prose-invert max-w-none text-slate-300 mb-8"
                            dangerouslySetInnerHTML={{ __html: result.summary.replace(/\n/g, '<br />') }}>
                        </div>

                        {result.sources.length > 0 && (
                             <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-4 border-t border-slate-700 pt-6">Sources</h3>
                                <ul className="space-y-3">
                                {result.sources.map((source, index) => (
                                    <li key={index} className="bg-slate-700/50 p-3 rounded-lg hover:bg-slate-700 transition-colors">
                                    <a
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-indigo-400 hover:underline truncate block"
                                    >
                                        {source.title || 'Untitled Source'}
                                    </a>
                                    <p className="text-xs text-slate-400 truncate">{source.uri}</p>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                {!result && !isLoading && !error && (
                     <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
                        <ResearchIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">Ready to Research</h3>
                        <p>Enter a topic above and get an AI-powered summary with sources.</p>
                    </div>
                )}
            </div>
        </div>
    );
};