
import React from 'react';
import { IllbotFlowIcon, ChainIcon, WorkspaceIcon, HistoryClockIcon } from '../constants';

interface IllbotFlowLandingViewProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 transform hover:-translate-y-2 transition-transform duration-300">
        <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 text-indigo-400 flex-shrink-0">{icon}</div>
            <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{children}</p>
    </div>
);

export const IllbotFlowLandingView: React.FC<IllbotFlowLandingViewProps> = ({ onStart }) => {
    return (
        <div className="h-full overflow-y-auto space-y-12 animate-[fadeIn_0.5s_ease-in-out] p-4">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .hero-bg {
                    background: radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.2), transparent 40%);
                }
            `}</style>
            
            {/* Hero Section */}
            <section className="text-center py-16 hero-bg rounded-2xl">
                <IllbotFlowIcon className="w-24 h-24 mx-auto text-indigo-400 mb-6" />
                <h1 className="text-5xl font-extrabold text-slate-100 mb-4 tracking-tight">
                    Introducing ILLBOT <span className="text-indigo-400">Flow</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
                    Your AI-powered workflow, reimagined. Chain multiple tools together to go from initial idea to finished product in one seamless experience.
                </p>
                <button
                    onClick={onStart}
                    className="px-8 py-4 text-lg font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 transform hover:scale-105 transition-all duration-300"
                >
                    Start Your Flow
                </button>
            </section>

            {/* Features Section */}
            <section>
                <h2 className="text-3xl font-bold text-center text-slate-200 mb-8">Unleash Your Productivity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard icon={<ChainIcon className="w-full h-full" />} title="Chain Actions">
                        Combine tools like Web Research, Summarize, and Paraphrase in any order to create powerful, custom writing workflows.
                    </FeatureCard>
                    <FeatureCard icon={<WorkspaceIcon className="w-full h-full" />} title="Unified Workspace">
                        Go from a blank page to a polished final draft. The editor is your canvas, and the tools are your brushes.
                    </FeatureCard>
                    <FeatureCard icon={<HistoryClockIcon className="w-full h-full" />} title="Track Every Step">
                        The History panel keeps a clear, chronological record of every action you take, so you never lose your train of thought.
                    </FeatureCard>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-center text-slate-200 mb-8">Simple, Yet Powerful</h2>
                <div className="flex flex-col md:flex-row justify-around items-center gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center font-bold text-2xl text-indigo-300 mb-3">1</div>
                        <h3 className="text-xl font-semibold text-slate-200 mb-1">Input</h3>
                        <p className="text-slate-400 max-w-xs">Start with your own text, or use the Web Research tool to pull in information on any topic.</p>
                    </div>
                    <div className="text-indigo-500/50 text-4xl hidden md:block">&rarr;</div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center font-bold text-2xl text-indigo-300 mb-3">2</div>
                        <h3 className="text-xl font-semibold text-slate-200 mb-1">Chain</h3>
                        <p className="text-slate-400 max-w-xs">Select and apply a series of actions. Summarize your research, humanize the summary, then check the grammar.</p>
                    </div>
                     <div className="text-indigo-500/50 text-4xl hidden md:block">&rarr;</div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center font-bold text-2xl text-indigo-300 mb-3">3</div>
                        <h3 className="text-xl font-semibold text-slate-200 mb-1">Refine</h3>
                        <p className="text-slate-400 max-w-xs">Directly edit the text at any stage. Your flow is flexible—adapt it as your ideas evolve.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
