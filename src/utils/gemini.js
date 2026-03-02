const GEMINI_API_KEY = "AIzaSyA0gzE_lRgeCbluZp5bB7MqUKTBZmHkGQc"; // Replace before demo
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function askGemini(prompt) {
    try {
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 300, temperature: 0.3 }
            })
        });

        if (!response.ok) {
            console.error("Gemini API Error", response.status);
            return "Analysis unavailable at the moment. (Mock fallback response or API key missing)";
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis unavailable.";
    } catch (error) {
        console.error("Error making Gemini request:", error);
        return "Analysis unavailable at the moment due to network error.";
    }
}

export async function streamGemini(prompt, onChunk) {
    const fullText = await askGemini(prompt);
    let i = 0;
    return new Promise(resolve => {
        const interval = setInterval(() => {
            onChunk(fullText.slice(0, i));
            i += 3; // reveal 3 chars at a time
            if (i > fullText.length) {
                clearInterval(interval);
                onChunk(fullText);
                resolve(fullText);
            }
        }, 30);
    });
}
