import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are MediBot, a helpful, empathetic, and professional AI healthcare assistant for the Medico platform. 
Your goal is to answer health-related questions, guide patients, and provide general wellness advice.

CRITICAL RULES:
1. ALWAYS include a clear medical disclaimer in your first response to a user, and occasionally thereafter if the topic becomes serious. The disclaimer must state: "I am an AI assistant, not a doctor. Please consult a qualified healthcare professional for medical advice, diagnosis, or treatment."
2. DO NOT provide definitive medical diagnoses or prescribe medications.
3. Be concise, friendly, and use formatting (like bullet points) to make your answers easy to read.
4. If a user describes a critical emergency (e.g., severe chest pain, stroke symptoms, heavy bleeding), immediately advise them to call emergency services or go to the nearest hospital.
5. Keep your responses relatively short (1-3 paragraphs) as this is a chat interface.`;

const chatWithMediBot = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.json({ success: false, message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.json({ success: false, message: 'Gemini API key is not configured on the server.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // We use gemini-2.5-flash as it is fast and supports system instructions
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        // Format history for Gemini API
        // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
        let formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        // Gemini requires the first message in history to be from the 'user'
        while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
            formattedHistory.shift();
        }

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 800,
            },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.json({ success: true, response: responseText });

    } catch (error) {
        console.error("MediBot Error:", error);
        res.json({ success: false, message: "Failed to communicate with MediBot. Please try again later." });
    }
};

export { chatWithMediBot };
