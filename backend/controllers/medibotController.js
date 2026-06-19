import Groq from "groq-sdk";

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

        if (!process.env.GROQ_API_KEY) {
            return res.json({ success: false, message: 'Groq API key is not configured on the server.' });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        // Format history for Groq API
        // Groq expects: { role: "user" | "assistant" | "system", content: "..." }
        let formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'bot' ? 'assistant' : 'user',
            content: msg.text
        }));

        // Build the messages array
        const messages = [
            { role: "system", content: SYSTEM_INSTRUCTION },
            ...formattedHistory,
            { role: "user", content: message }
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama3-8b-8192",
            max_tokens: 800,
        });

        const responseText = completion.choices[0]?.message?.content || "I am sorry, I couldn't generate a response.";

        res.json({ success: true, response: responseText });

    } catch (error) {
        console.error("MediBot Error:", error);
        res.json({ success: false, message: "Failed to communicate with MediBot. Please try again later." });
    }
};

export { chatWithMediBot };
