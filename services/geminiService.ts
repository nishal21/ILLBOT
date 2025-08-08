
import { GoogleGenAI, GenerateContentResponse, Type, Chat } from "@google/genai";
import { 
    ParaphraseMode, 
    SummarizerFormat, 
    AIHumanizerTone, 
    CitationStyle,
    EssayGrade,
    Flashcard,
    PracticeQuestion,
    ContentWriterTone,
    ContentWriterLength,
    AnalyticsResult,
    ResearchResult,
    ResearchSource
} from '../types';

let ai: GoogleGenAI | null = null;
const model = 'gemini-2.5-flash';

export const initializeAi = async (apiKey: string): Promise<boolean> => {
    try {
        const newAi = new GoogleGenAI({ apiKey });
        // Perform a simple, cheap check to validate the key
        await newAi.models.generateContent({ model: 'gemini-2.5-flash', contents: [{text: 'test'}]});
        ai = newAi; // Assign only after successful validation
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        ai = null;
        return false;
    }
};

export const clearAi = () => {
    ai = null;
};

export const isAiInitialized = (): boolean => !!ai;

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("AI service not initialized. Please set your API key in Settings.");
    }
    return ai;
}


// --- Updated "Smarter" Services ---

export const paraphraseText = async (text: string, mode: ParaphraseMode): Promise<string> => {
    const aiClient = getAiClient();
    let systemInstruction = "You are an expert writer. Your task is to paraphrase the given text while preserving its core meaning. Return only the paraphrased text.";
    let prompt = `Text to paraphrase: "${text}"`;

    switch (mode) {
        case 'Simpler':
            systemInstruction += " Rephrase the text to be much simpler and easier for a general audience to understand.";
            break;
        case 'Formal':
            systemInstruction += " Rephrase the text to sound more formal, academic, and professional.";
            break;
        case 'Creative':
            systemInstruction += " Rephrase the text in a highly creative and original way, using unique vocabulary and sentence structures.";
            break;
        case 'Expand':
             systemInstruction += " Expand upon the original text, adding relevant details and elaborating on the key points to make it more comprehensive.";
             break;
        case 'Shorten':
            systemInstruction += " Condense the text, making it more concise and to the point without losing critical information.";
            break;
        case 'Balanced':
        default:
             systemInstruction += " Rephrase the text while maintaining its original tone and meaning, providing a balanced alternative.";
            break;
    }

    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model: model, contents: [{text: prompt}],
            config: { systemInstruction: systemInstruction, temperature: mode === 'Creative' ? 0.9 : 0.7 }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in paraphraseText:", error);
        throw new Error("Failed to paraphrase text. Please try again.");
    }
};

export const summarizeText = async (text: string, format: SummarizerFormat, wordCount: number): Promise<string> => {
    const aiClient = getAiClient();
    const prompt = `Summarize the following text in approximately ${wordCount} words, formatted as a ${format === 'Paragraph' ? 'single paragraph' : 'series of key bullet points'}. Text: "${text}"`;
    try {
         const response: GenerateContentResponse = await aiClient.models.generateContent({
            model: model, contents: [{text: prompt}],
            config: { systemInstruction: "You are an expert summarizer. Your task is to distill text into clear and accurate summaries of a specified length and format." }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in summarizeText:", error);
        throw new Error("Failed to summarize text. Please try again.");
    }
};

export const checkGrammar = async (text: string): Promise<string> => {
    const aiClient = getAiClient();
    const prompt = `Correct any grammar and spelling mistakes in the following text. Return only the full, corrected text. For every correction you make, you MUST wrap the original incorrect text in '~~' and the new corrected text in '**'. For example, if the input is "I is happy.", the output should be "I ~~is~~**am** happy.". Do not provide any explanation, just the marked-up text. Text: "${text}"`;
    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model: model, contents: [{text: prompt}],
            config: { systemInstruction: "You are a meticulous proofreader. Your job is to correct grammatical errors, spelling mistakes, and punctuation, and mark up the changes clearly.", temperature: 0.0 }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in checkGrammar:", error);
        throw new Error("Failed to check grammar. Please try again.");
    }
};


export type AIDetectionResult = {
    score: number; // 0-100
    explanation: string;
    suspiciousSentences: string[];
};

export const detectAIText = async (text: string): Promise<AIDetectionResult> => {
    const aiClient = getAiClient();
    const systemInstruction = `You are an expert in computational linguistics and stylistic analysis, acting as a highly accurate "AI Text Detector". Your sole mission is to determine if a piece of text was written by a human or generated by an AI. You have been trained to see beyond surface-level grammar and structure.`;

    const prompt = `Carefully analyze the following text for subtle linguistic markers of AI generation. Go beyond simple grammar and structure.

**Key AI "Tells" to Look For:**
*   **Predictable Word Choice:** Does the text use overly common or "safe" words where a human might use a more interesting synonym? Is the vocabulary sophisticated but lacking in originality?
*   **Uniform Sentence Structure (Low Burstiness):** Are the sentences rhythmically monotonous? Do they follow a similar length and structure (e.g., subject-verb-object) without variation? This is a major AI tell.
*   **Unnatural Flow & Transitions:** Do transitions between sentences or ideas feel abrupt or overly formal (e.g., excessive use of 'Furthermore', 'Moreover', 'In conclusion')?
*   **Lack of Voice:** Does the text lack a distinct personality, tone, or perspective? Does it sound like a generic encyclopedia entry?
*   **"Perfect but Soulless" (Low Perplexity):** Is the text grammatically flawless but devoid of any human quirks, idioms, or authentic voice? The lack of minor imperfections is a strong signal.
*   **Overly-structured Content:** Is information presented in a very rigid, list-like format, even within paragraphs, which is typical of data aggregation?

**Critical Caveat:** Do NOT penalize text for being well-written, formal, or technical. Many human experts write this way. Your analysis must be based on the *subtle stylistic patterns* listed above, not on quality or formality.

Based on your expert analysis, provide a JSON object with:
1.  A 'score' from 0 (very likely human) to 100 (very likely AI).
2.  A 'explanation' justifying your score by citing specific examples from the text that match the "tells" above.
3.  A 'suspiciousSentences' array listing the specific sentences that are the strongest indicators of AI generation.

Text to analyze: "${text}"`;

    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "A score from 0 (very likely human) to 100 (very likely AI)." },
                        explanation: { type: Type.STRING, description: "A detailed explanation of the reasoning, referencing specific evidence from the text and the 'tells'." },
                        suspiciousSentences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of sentences that most strongly suggest AI generation."}
                    },
                    required: ["score", "explanation", "suspiciousSentences"]
                }
            }
        });
        const json = JSON.parse(response.text);
        return json;
    } catch (error) {
        console.error("Gemini API error in detectAIText:", error);
        throw new Error("Failed to analyze text for AI detection.");
    }
};

const humanizeStep = async (text: string, tone: AIHumanizerTone, level: number): Promise<string> => {
    const aiClient = getAiClient();
    let systemInstruction = `You are an AI text humanizer with one mission: defeat AI detectors by rewriting text to sound authentically human. Your approach will change based on the requested "humanization level" from 0 to 100.`;
    
    let personaInstruction = '';
    if (level <= 20) {
        personaInstruction = `**Level: Subtle (0-20)**
        - Your goal is refinement, not a total rewrite.
        - Subtly rephrase for better flow and clarity.
        - Make minor adjustments to sentence structure to avoid monotony.
        - Maintain a professional and clear tone. Avoid slang or overly casual language.`
    } else if (level <= 40) {
        personaInstruction = `**Level: Natural (21-40)**
        - Make the text sound more natural and less robotic.
        - Vary sentence length moderately.
        - Introduce some common contractions (e.g., "it's", "don't").
        - The goal is to be a better-written, more readable version of the original.`
    } else if (level <= 60) {
        personaInstruction = `**Level: Casual (41-60)**
        - Adopt a conversational, 'smart but slightly rushed' persona.
        - **Maximize burstiness (choppy rhythm):** Mix long, complex sentences with short fragments. This is key.
        - Use slightly more informal language and common idioms.
        - Punctuation can be less rigid (e.g., use of em-dashes).`
    } else if (level <= 80) {
        personaInstruction = `**Level: Very Human (61-80)**
        - Significantly increase the 'human' feel.
        - Use more informal language, conversational phrasing ("So yeah...", "I mean..."), and maybe some light slang.
        - **Embrace imperfection:** Use em-dashes—like this—to connect thoughts, and ellipses... to trail off. Run-on sentences are okay if they sound natural.
        - Prioritize authentic voice over perfect grammar.`
    } else {
        personaInstruction = `**Level: Chaotic Human (81-100)**
        - Go for maximum 'human chaos', like an energetic social media post.
        - Be highly unpredictable in word choice and sentence structure.
        - Use fragments, slang, and even humor liberally.
        - The goal is to be unmistakably human, even if it's a bit messy and over-the-top.`
    }

    let toneInstruction = '';
    switch (tone) {
        case 'Friendly':
            toneInstruction = `**Tone: Friendly**
            - Use a warm, approachable, and conversational style.
            - Incorporate contractions (e.g., "you're", "it's") and positive language.
            - Imagine you're explaining something to a friend.`;
            break;
        case 'Professional':
            toneInstruction = `**Tone: Professional**
            - Use formal language and a respectful, objective tone.
            - Avoid slang, contractions, and overly casual phrasing.
            - Ensure clarity, precision, and a structured flow.`;
            break;
        case 'Confident':
            toneInstruction = `**Tone: Confident**
            - Use strong, declarative sentences.
            - Avoid hedging language (e.g., "might", "seems to be", "perhaps").
            - Be direct, assertive, and clear in your statements.`;
            break;
        case 'Neutral':
        default:
            toneInstruction = `**Tone: Neutral**
            - Maintain an objective, balanced, and impartial tone.
            - Avoid emotional language or strong opinions.
            - Focus on presenting information clearly and factually.`;
            break;
    }
    
    systemInstruction += `\n\n${personaInstruction}`;
    systemInstruction += `\n\n${toneInstruction}`;
    systemInstruction += `\n\n**OUTPUT FORMAT - NON-NEGOTIABLE:**
    You MUST return ONLY the rewritten text, with changes marked up.
    - Wrap text you're removing in \`~~\`.
    - Wrap text you're adding in \`**\`.
    - No chit-chat, no explanations. Just the marked-up text.`;

    const prompt = `Apply your humanization process (Level: ${level}, Tone: ${tone}) to the following text:\n\n"${text}"`;
    
    const temperature = 0.5 + (level / 100) * 0.5; // Scale temperature from 0.5 to 1.0 based on level

    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: systemInstruction,
                temperature: temperature, 
            }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in humanizeStep:", error);
        throw new Error("Failed to humanize text.");
    }
};

export const humanizeText = async (text: string, tone: AIHumanizerTone, initialLevel: number): Promise<string> => {
    const MAX_ATTEMPTS = 3;
    const SCORE_THRESHOLD = 30; // Target AI score
    let attempts = 0;
    let currentLevel = initialLevel;
    
    let bestResult = {
        markupText: '',
        score: 100,
    };

    // First, run with the user's selected level, regardless of the initial score
    const initialMarkup = await humanizeStep(text, tone, currentLevel);
    const initialPlainText = initialMarkup.replace(/~~\s*[^~]+?\s*~~/g, '').replace(/\*\*\s*([^~*]+?)\s*\*\*/g, '$1');
    const initialDetection = await detectAIText(initialPlainText);
    
    bestResult = { markupText: initialMarkup, score: initialDetection.score };
    
    if (bestResult.score < SCORE_THRESHOLD) {
        return bestResult.markupText;
    }

    // If the score is still too high, begin iterative attempts
    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        currentLevel = Math.min(100, currentLevel + 25); // Increase intensity

        const markupText = await humanizeStep(text, tone, currentLevel);
        const plainText = markupText.replace(/~~\s*[^~]+?\s*~~/g, '').replace(/\*\*\s*([^~*]+?)\s*\*\*/g, '$1');
        const detectionResult = await detectAIText(plainText);
        const currentScore = detectionResult.score;

        if (currentScore < bestResult.score) {
            bestResult = { markupText, score: currentScore };
        }

        if (bestResult.score < SCORE_THRESHOLD) {
            break; // Exit loop if we've reached our goal
        }
    }

    return bestResult.markupText;
};

export const generateCitation = async (style: CitationStyle, data: { [key: string]: string }): Promise<string> => {
    const aiClient = getAiClient();
    let sourceInfo = "Generate a citation based on the following information:\n";
    if (data.url) {
        sourceInfo = `Generate a citation for the content at this URL: ${data.url}`;
    } else {
        for (const [key, value] of Object.entries(data)) {
            if (value) {
                sourceInfo += `${key}: ${value}\n`;
            }
        }
    }
    
    const prompt = `Using the provided source information, generate a single, complete citation in ${style} format. Return only the formatted citation. Information:\n${sourceInfo}`;

    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: "You are an expert academic librarian specializing in citation generation. Provide only the formatted citation based on the details provided.",
                temperature: 0.0,
                ...(data.url && { tools: [{ googleSearch: {} }] }) // Use search only if URL is provided
            }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in generateCitation:", error);
        throw new Error(`Failed to generate ${style} citation.`);
    }
};

export const writeContent = async (topic: string, length: ContentWriterLength, tone: ContentWriterTone): Promise<string> => {
    const aiClient = getAiClient();
    let lengthInstruction = '';
    switch (length) {
        case 'Short':
            lengthInstruction = 'a short paragraph (around 100 words)';
            break;
        case 'Medium':
            lengthInstruction = 'a few paragraphs (around 300 words)';
            break;
        case 'Long':
            lengthInstruction = 'a detailed article (around 500+ words)';
            break;
    }

    const systemInstruction = `You are a professional content writer. Your task is to write high-quality, engaging, and original content based on a given topic, length, and tone.`;
    const prompt = `Write content about the following topic: "${topic}". The desired length is ${lengthInstruction} and the tone should be ${tone}. Return only the written content.`;

    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in writeContent:", error);
        throw new Error("Failed to generate content.");
    }
};

export const gradeEssay = async (text: string): Promise<EssayGrade> => {
    const aiClient = getAiClient();
    const systemInstruction = `You are an experienced writing instructor and essay grader. Your task is to provide a comprehensive, constructive, and unbiased evaluation of an essay. Analyze it based on clarity, argumentation, evidence, structure, and grammar.`;
    const prompt = `Please grade the following essay. Provide your feedback in a JSON object with the following structure:
1.  'score': An overall score from 0 to 100.
2.  'strengths': A concise paragraph highlighting what the essay does well.
3.  'areasForImprovement': A concise paragraph suggesting key areas that need work.
4.  'detailedFeedback': A bulleted list providing specific, actionable feedback on different aspects of the essay.

Essay to grade: "${text}"`;

    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "Overall score from 0 to 100." },
                        strengths: { type: Type.STRING, description: "What the essay does well." },
                        areasForImprovement: { type: Type.STRING, description: "What the essay needs to improve." },
                        detailedFeedback: { type: Type.STRING, description: "Specific, actionable feedback points." }
                    },
                    required: ["score", "strengths", "areasForImprovement", "detailedFeedback"]
                }
            }
        });
        const json = JSON.parse(response.text);
        return json;
    } catch (error) {
        console.error("Gemini API error in gradeEssay:", error);
        throw new Error("Failed to grade the essay.");
    }
};

export const generateFlashcards = async (text: string): Promise<Flashcard[]> => {
    const aiClient = getAiClient();
    const systemInstruction = `You are an academic tool that specializes in creating study aids. Your task is to read the provided text and extract key information to generate a set of flashcards.`;
    const prompt = `From the following text, identify the most important terms and their corresponding definitions or key concepts. Generate a list of flashcards from this information.

Text: "${text}"`;

    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            term: { type: Type.STRING, description: "The key term or concept for the front of the flashcard." },
                            definition: { type: Type.STRING, description: "The definition or explanation for the back of the flashcard." }
                        },
                        required: ["term", "definition"]
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return json;
    } catch (error) {
        console.error("Gemini API error in generateFlashcards:", error);
        throw new Error("Failed to generate flashcards.");
    }
};

export const generatePracticeQuestions = async (text: string): Promise<PracticeQuestion[]> => {
    const aiClient = getAiClient();
    const systemInstruction = `You are a helpful study assistant. Your job is to create relevant, short-answer practice questions based on a provided text to help a student test their knowledge. For each question, provide a concise and accurate answer.`;
    const prompt = `Read the following text and generate a list of practice questions that cover the main points.

Text: "${text}"`;

    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING, description: "A question based on the text." },
                            answer: { type: Type.STRING, description: "A concise answer to the question." }
                        },
                        required: ["question", "answer"]
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return json;
    } catch (error)
    {
        console.error("Gemini API error in generatePracticeQuestions:", error);
        throw new Error("Failed to generate practice questions.");
    }
};

export const researchTopic = async (topic: string): Promise<ResearchResult> => {
    const aiClient = getAiClient();
    const prompt = `You are a research assistant. Provide a concise summary for the topic "${topic}" based on Google Search results.`;
    
    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web) ?? [];
        const filteredSources = sources.filter((source): source is ResearchSource => !!source?.uri);
        
        return {
            summary: response.text,
            sources: filteredSources,
        };
    } catch (error) {
        console.error("Gemini API error in researchTopic:", error);
        throw new Error("Failed to research topic.");
    }
};

export const completeText = async (text: string): Promise<string> => {
    const aiClient = getAiClient();
    const prompt = `Continue writing based on the following text. Add one or two paragraphs that logically follow and expand upon the ideas. Return only the new text to be appended.
---
${text}`;
    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: "You are an expert writer and AI assistant that completes text.",
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in completeText:", error);
        throw new Error("Failed to complete text.");
    }
};

export const analyzeText = async (text: string): Promise<AnalyticsResult> => {
    const aiClient = getAiClient();
    const systemInstruction = `You are a text analysis expert. Analyze the provided text for readability, tone, and word count.`;
    const prompt = `Analyze the following text and return a JSON object with:
1. 'readability': A description of the reading level (e.g., "8th Grade Level", "Easy to Read", "Very Formal/Academic").
2. 'tone': A short description of the dominant tone (e.g., "Formal, Optimistic", "Casual, Critical").
3. 'wordCount': The total number of words.

Text: "${text}"`;
    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        readability: { type: Type.STRING },
                        tone: { type: Type.STRING },
                        wordCount: { type: Type.NUMBER }
                    },
                    required: ["readability", "tone", "wordCount"]
                }
            }
        });
        const json = JSON.parse(response.text);
        return json;
    } catch (error) {
        console.error("Gemini API error in analyzeText:", error);
        throw new Error("Failed to analyze text.");
    }
};


// --- Unchanged Services ---

export type PlagiarismSource = { uri: string; title: string; };
export const checkPlagiarism = async (text: string): Promise<PlagiarismSource[]> => {
    const aiClient = getAiClient();
    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: `Does the following text appear elsewhere on the internet? "${text}"`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web) ?? [];
        return sources.filter((source): source is PlagiarismSource => !!source?.uri);
    } catch (error) {
        console.error("Gemini API error in checkPlagiarism:", error);
        throw new Error("Failed to check for plagiarism. The Google Search tool might be unavailable.");
    }
};


export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    const aiClient = getAiClient();
    const prompt = `Translate the following text to ${targetLanguage}. Return only the translated text. Text: "${text}"`;
    try {
        const response = await aiClient.models.generateContent({
            model: model,
            contents: [{text: prompt}],
            config: {
                systemInstruction: `You are a highly accurate translation engine. You will be asked to translate text to a specified language.`,
                temperature: 0.3,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in translateText:", error);
        throw new Error(`Failed to translate text to ${targetLanguage}.`);
    }
};

export const createChat = (): Chat => {
    const aiClient = getAiClient();
    return aiClient.chats.create({
        model: model,
        config: {
            systemInstruction: 'You are ILLBOT, a helpful and knowledgeable AI assistant. Keep your responses concise and informative.',
        },
    });
};
