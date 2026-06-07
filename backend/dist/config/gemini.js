"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJoke = generateJoke;
exports.generateQuizQuestion = generateQuizQuestion;
exports.evaluateQuizAnswer = evaluateQuizAnswer;
exports.chatWithAI = chatWithAI;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
    try {
        genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        console.log('⚡ Gemini AI initialized successfully.');
    }
    catch (error) {
        console.error('❌ Failed to initialize Gemini AI with API key:', error);
    }
}
else {
    console.log('⚠️ GEMINI_API_KEY is not defined. Using local fallback generator.');
}
// Fallback database for local execution if API Key is not set or fails
const fallbacks = {
    dark: [
        "My wife told me to stop impersonating a flamingo. I had to put my foot down.",
        "Give a man a match, and he'll be warm for a few hours. Set him on fire, and he will be warm for the rest of his life.",
        "I have a joke about trickle-down economics, but 99% of you will never get it.",
        "My grandfather has the heart of a lion... and a lifetime ban from the zoo.",
        "I was digging in our garden and found a chest full of gold coins. I was about to run inside to tell my wife, but then I remembered why I was digging in the garden."
    ],
    funny: [
        "I told my doctor that I broke my arm in two places. He told me to stop going to those places.",
        "Parallel lines have so much in common. It's a shame they'll never meet.",
        "I'm on a seafood diet. I see food and I eat it.",
        "Why don't scientists trust atoms? Because they make up everything!",
        "My wife accused me of stealing her road maps. I told her she was way out of line."
    ],
    lame: [
        "What do you call a factory that makes okay products? A satisfactory.",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "Why don't skeletons fight each other? They don't have the guts.",
        "What do you call a sleeping dinosaur? A dino-snore!",
        "How does a penguin build its house? Igloos it together!"
    ],
    romance: [
        "Are you a keyboard? Because you're just my type.",
        "Are you made of copper and tellurium? Because you're CuTe.",
        "Are you a parking ticket? Because you've got 'fine' written all over you.",
        "Are you French? Because Eiffel for you.",
        "Do you believe in love at first sight, or should I walk by again?"
    ],
    roast: [
        "You look like the type of person who double-clicks on links in emails.",
        "Your code is so messy that even GitHub Copilot suggests you switch careers.",
        "You have the perfect face for radio.",
        "I'd roast you, but my mom told me I shouldn't burn trash.",
        "You're like a cloud. When you disappear, it's a beautiful day."
    ]
};
const quizFallbacks = [
    {
        setup: "Why did the computer go to the doctor?",
        punchline: "Because it had a virus!",
        explanation: "Computers get viruses, doctors cure viruses... get it? Truly a classic pun from the 90s."
    },
    {
        setup: "What do you call an alligator in a vest?",
        punchline: "An investigator!",
        explanation: "Vest + alligator = investigator. Highly fashionable, highly dangerous."
    },
    {
        setup: "Why did the math book look sad?",
        punchline: "Because it had too many problems.",
        explanation: "A book full of math problems is literally full of problems. Emotional baggage at its finest."
    }
];
// Helper to get random item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
async function generateJoke(category, roastTopic) {
    if (!genAI) {
        if (category === 'roast' && roastTopic) {
            return `Roasting ${roastTopic}: ${getRandom(fallbacks.roast)}`;
        }
        return getRandom(fallbacks[category]);
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        let prompt = '';
        if (category === 'dark') {
            prompt = 'Write a clever, short, dark humor joke. Keep it punchy, edgy, and under 3 sentences. No preface, just the joke.';
        }
        else if (category === 'funny') {
            prompt = 'Write a very funny, clever observational joke or quick gag. Keep it under 3 sentences. No preface, just the joke.';
        }
        else if (category === 'lame') {
            prompt = 'Write a dad joke, wordplay pun, or deliberately cheesy/lame joke. Keep it under 2 sentences. No preface, just the joke.';
        }
        else if (category === 'romance') {
            prompt = 'Write a clever, funny, and flirty pickup line or romance-themed joke. Keep it under 2 sentences. No preface, just the joke.';
        }
        else if (category === 'roast') {
            prompt = `Write a savage, hilarious, yet light-hearted roast of the topic/person: "${roastTopic || 'people in general'}". Keep it witty, short (under 3 sentences), and punchy. No preface, just the roast.`;
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }
    catch (error) {
        console.error('Gemini joke generation failed, using fallback:', error);
        return getRandom(fallbacks[category]);
    }
}
async function generateQuizQuestion() {
    if (!genAI) {
        const fb = getRandom(quizFallbacks);
        return { setup: fb.setup, punchline: fb.punchline };
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Generate a funny joke structured as a Q&A setup and punchline. 
    Respond ONLY with a JSON object in this exact format:
    {"setup": "The question/setup", "punchline": "The answer/punchline"}
    Do not add markdown formatting or code blocks.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    }
    catch (error) {
        console.error('Gemini quiz question failed, using fallback:', error);
        const fb = getRandom(quizFallbacks);
        return { setup: fb.setup, punchline: fb.punchline };
    }
}
async function evaluateQuizAnswer(setup, punchline, userGuess) {
    if (!genAI) {
        const isClose = userGuess.toLowerCase().includes(punchline.toLowerCase().split(' ')[0]) ||
            userGuess.length > 5;
        return {
            correct: isClose,
            score: isClose ? 100 : 20,
            funnyRating: Math.floor(Math.random() * 5) + 5,
            explanation: isClose
                ? `You got the core concept! The actual punchline was: "${punchline}". Well guessed!`
                : `Not quite. The actual punchline was: "${punchline}". Better luck next time!`
        };
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Joke Setup: "${setup}"
    Actual Punchline: "${punchline}"
    User's Guess: "${userGuess}"
    
    Evaluate if the user's guess is semantically correct, close enough, or captures the spirit of the punchline.
    Also rate how funny the user's guess is from 1 to 10 (even if incorrect).
    Provide a witty, humorous explanation of why it is correct or incorrect.
    
    Respond ONLY with a JSON object in this format:
    {
      "correct": true/false,
      "score": number between 0 and 100 based on accuracy,
      "funnyRating": number between 1 and 10,
      "explanation": "Witty explanation"
    }
    Do not add markdown formatting or code blocks.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    }
    catch (error) {
        console.error('Gemini answer evaluation failed:', error);
        return {
            correct: false,
            score: 10,
            funnyRating: 5,
            explanation: `Evaluation failed due to system lag. The actual punchline: "${punchline}".`
        };
    }
}
async function chatWithAI(messages, userContext) {
    if (!genAI) {
        return "Hey! I'm RAJ AI. It seems my Gemini neural processors are running locally without an API key right now, but I'm still here to make you laugh. Type 'dark', 'funny', 'lame', or 'romance' and I will tell you a joke!";
    }
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: `You are RAJ AI, a premium, witty, and highly sarcastic AI stand-up comedian. 
      You make jokes, write roasts, and converse with users. Keep your answers funny, slightly cynical, 
      and always engaging. Recommend jokes often. User level data: ${userContext || 'Standard'}.`
        });
        // Format for Gemini Chat history
        const chat = model.startChat({
            history: messages.slice(0, -1).map(m => ({
                role: m.role,
                parts: [{ text: m.parts }]
            }))
        });
        const lastMsg = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMsg.parts);
        const response = await result.response;
        return response.text().trim();
    }
    catch (error) {
        console.error('Gemini Chat failed:', error);
        return "Ah, my joke gears jammed! Let's try that again.";
    }
}
