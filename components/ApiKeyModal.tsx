
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => Promise<boolean>;
  onClose?: () => void;
  currentKey: string | null;
  onClear: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose, currentKey, onClear }) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (keyInput.trim()) {
      setIsLoading(true);
      const success = await onSave(keyInput.trim());
      if (!success) {
        setError('The provided API key appears to be invalid. Please check it and try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full m-4 ring-1 ring-white/10">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-slate-100">API Key Settings</h2>
          {onClose && (
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
          )}
        </div>
        
        {currentKey ? (
            <div className="space-y-4">
                <p className="text-slate-300">Your Gemini API key is configured and ready to use.</p>
                <div className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between border border-slate-600">
                    <span className="font-mono text-green-400 text-sm">••••••••••••••••••••{currentKey.slice(-4)}</span>
                    <button onClick={onClear} className="text-sm text-red-400 hover:text-red-300 font-semibold transition-colors">Clear Key</button>
                </div>
                 <p className="text-xs text-slate-500">To change your key, clear the current one and enter a new one.</p>
            </div>
        ) : (
            <div className="space-y-4">
                <p className="text-slate-300">To use ILLBOT, please enter your Google Gemini API key. You can get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">Google AI Studio</a>.</p>
                <div>
                    <label htmlFor="apiKey" className="text-sm font-medium text-slate-400">Gemini API Key</label>
                    <input
                        id="apiKey"
                        type="password"
                        value={keyInput}
                        onChange={e => setKeyInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="Enter your API key here..."
                        className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 placeholder-slate-500"
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    onClick={handleSave}
                    disabled={!keyInput.trim() || isLoading}
                    className="w-full py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                    {isLoading ? 'Verifying...' : 'Save & Start Using ILLBOT'}
                </button>
            </div>
        )}
      </div>
      <style>{`
        .animate-fade-in { 
            animation: fadeIn 0.2s ease-out; 
        } 
        @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
        }
      `}</style>
    </div>
  );
};
