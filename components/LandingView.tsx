
import React from 'react';
import { IllbotIcon, ParaphraserIcon, SummarizerIcon, ResearchIcon, GrammarCheckerIcon, ContentWriterIcon, AIHumanizerIcon } from '../constants';

interface LandingViewProps {
  onEnter: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center transform hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center">
        <div className="w-12 h-12 text-indigo-400 flex-shrink-0 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed flex-1">{children}</p>
    </div>
);

export const LandingView: React.FC<LandingViewProps> = ({ onEnter }) => {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-y-auto font-sans">
            <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <main className="relative container mx-auto px-4 py-16 sm:py-24 animate-fade-in-up">
                
                {/* Hero Section */}
                <section className="text-center">
                    <IllbotIcon className="w-24 h-24 mx-auto text-indigo-400 mb-6" />
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            ILLBOT
                        </span>
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-semibold text-slate-200 mb-6">
                        Your AI-Powered Writing Co-Pilot
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                        Elevate your writing with a suite of intelligent tools designed for clarity, creativity, and precision. From paraphrasing to research, ILLBOT is your partner in crafting perfect text.
                    </p>
                    <button
                        onClick={onEnter}
                        className="px-8 py-4 text-lg font-semibold bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transform hover:scale-105 transition-all duration-300 animate-pulse-slow"
                    >
                        Enter Application
                    </button>
                </section>

                {/* Features Section */}
                <section className="mt-24 sm:mt-32">
                    <h3 className="text-3xl font-bold text-center text-slate-200 mb-12">An Elite Toolkit at Your Fingertips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <FeatureCard icon={<ParaphraserIcon />} title="Paraphraser">
                            Rewrite text in various tones—Formal, Creative, Simple, and more—while preserving the core message.
                        </FeatureCard>
                        <FeatureCard icon={<SummarizerIcon />} title="Summarizer">
                            Distill long articles or documents into concise paragraphs or bullet points, saving you time and effort.
                        </FeatureCard>
                        <FeatureCard icon={<ResearchIcon />} title="Researcher">
                            Get AI-powered summaries on any topic, complete with cited sources from across the web.
                        </FeatureCard>
                         <FeatureCard icon={<ContentWriterIcon />} title="Content Writer">
                            Generate high-quality articles, essays, and reports on any subject with just a simple prompt.
                        </FeatureCard>
                         <FeatureCard icon={<GrammarCheckerIcon />} title="Grammar Checker">
                            Instantly correct grammatical errors, spelling mistakes, and punctuation to polish your writing.
                        </FeatureCard>
                        <FeatureCard icon={<AIHumanizerIcon />} title="AI Humanizer">
                           Refine AI-generated text to sound more natural and authentic, helping it pass as human-written.
                        </FeatureCard>
                    </div>
                </section>

                {/* Warning Section */}
                <section className="mt-24 sm:mt-32 max-w-3xl mx-auto">
                     <div className="bg-slate-800/50 border border-yellow-500/30 rounded-xl p-6 flex gap-4 items-start">
                        <div className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-yellow-300">A Note on Our Tools</h4>
                            <p className="text-slate-300 mt-2">
                                Our suite of writing assistants like the Paraphraser, Summarizer, and Researcher are top-notch and production-ready. 
                                The <strong className="font-semibold text-yellow-200">AI Humanizer</strong>, while powerful, is an experimental tool. Its results can be unpredictable at times, and we're actively working to improve its consistency. Enjoy the full power of ILLBOT!
                            </p>
                        </div>
                     </div>
                </section>

            </main>
            <footer className="text-center text-slate-500 py-8">
                <p>ILLBOT - Advanced AI Writing Assistant</p>
            </footer>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                 @keyframes pulse-slow {
                    50% {
                        box-shadow: 0 0 0 10px rgba(99, 102, 241, 0), 0 0 0 20px rgba(99, 102, 241, 0);
                    }
                    100% {
                         box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.3), 0 0 0 10px rgba(99, 102, 241, 0);
                    }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
                     box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.3);
                }
            `}</style>
        </div>
    );
};
