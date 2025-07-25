import React, { useState, useCallback } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { Flashcard, Mode } from '../types';
import { Loader } from './Loader';
import { FlashcardGeneratorIcon } from '../constants';
import { XCircleIcon } from './ViewIcons';

const FlashcardItem: React.FC<{ card: Flashcard; index: number }> = ({ card, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full h-48 [perspective:1000px]" onClick={() => setIsFlipped(!isFlipped)}>
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Front */}
        <div className="absolute w-full h-full bg-slate-700 border border-slate-600 rounded-lg p-4 flex flex-col justify-center items-center [backface-visibility:hidden]">
          <span className="text-xs text-slate-400 mb-2">Term</span>
          <h3 className="text-lg font-bold text-center text-indigo-300">{card.term}</h3>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full bg-slate-600 border border-slate-500 rounded-lg p-4 flex flex-col justify-center items-center [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-y-auto">
          <span className="text-xs text-slate-400 mb-2">Definition</span>
          <p className="text-sm text-center text-slate-200">{card.definition}</p>
        </div>
      </div>
    </div>
  );
};

interface FlashcardGeneratorViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const FlashcardGeneratorView: React.FC<FlashcardGeneratorViewProps> = ({ logActivity }) => {
    const [inputText, setInputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

    const onGenerate = useCallback(async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setError(null);
        setFlashcards([]);
        try {
            const result = await generateFlashcards(inputText);
            setFlashcards(result);
            logActivity(`Generated ${result.length} flashcards`, Mode.FlashcardGenerator, inputText.split(/\s+/).filter(Boolean).length);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [inputText, logActivity]);

    const onClear = () => {
        setInputText('');
        setFlashcards([]);
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
                    {isLoading ? <Loader /> : <><FlashcardGeneratorIcon className="w-5 h-5" /> Generate Flashcards</>}
                </button>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your notes or article here to create flashcards..."
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
                    {!isLoading && !error && flashcards.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2">
                           {flashcards.map((card, index) => <FlashcardItem key={index} card={card} index={index} />)}
                        </div>
                    )}
                     {!isLoading && !error && flashcards.length === 0 && (
                        <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
                            <FlashcardGeneratorIcon className="w-16 h-16 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Flashcards</h3>
                            <p>Generated flashcards will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};