import React, { useState, useCallback } from 'react';
import { generatePracticeQuestions } from '../services/geminiService';
import { PracticeQuestion, Mode } from '../types';
import { Loader } from './Loader';
import { PracticeQuestionsIcon } from '../constants';
import { XCircleIcon } from './ViewIcons';

const QuestionItem: React.FC<{ item: PracticeQuestion }> = ({ item }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    return (
        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50">
            <p className="text-slate-200 mb-2">{item.question}</p>
            <button onClick={() => setShowAnswer(!showAnswer)} className="text-xs text-indigo-400 font-semibold hover:underline">
                {showAnswer ? 'Hide' : 'Show'} Answer
            </button>
            {showAnswer && (
                <div className="mt-2 p-3 bg-slate-800/70 rounded text-sm text-green-300 border-l-2 border-green-400">
                    {item.answer}
                </div>
            )}
        </div>
    );
};

interface PracticeQuestionsViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const PracticeQuestionsView: React.FC<PracticeQuestionsViewProps> = ({ logActivity }) => {
    const [inputText, setInputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);

    const onGenerate = useCallback(async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setError(null);
        setQuestions([]);
        try {
            const result = await generatePracticeQuestions(inputText);
            setQuestions(result);
            logActivity(`Generated ${result.length} questions`, Mode.PracticeQuestions, inputText.split(/\s+/).filter(Boolean).length);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [inputText, logActivity]);

    const onClear = () => {
        setInputText('');
        setQuestions([]);
        setError(null);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                <button
                    onClick={onGenerate}
                    disabled={isLoading || !inputText}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? <Loader /> : <><PracticeQuestionsIcon className="w-5 h-5" /> Generate Questions</>}
                </button>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your text here to generate practice questions..."
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
                <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg relative p-4">
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
                     {!isLoading && !error && questions.length > 0 && (
                        <div className="space-y-4 overflow-y-auto pr-2 h-full">
                            {questions.map((q, i) => <QuestionItem key={i} item={q} />)}
                        </div>
                    )}
                    {!isLoading && !error && questions.length === 0 && (
                        <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
                            <PracticeQuestionsIcon className="w-16 h-16 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Practice Questions</h3>
                            <p>Generated questions will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};