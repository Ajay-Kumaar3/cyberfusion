const GEMINI_API_KEY = "AIzaSyDfiDyHHF6j2kCYDv4hreFRve_EKX7Zd28"; // Extracted from config
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function askGemini(prompt, bypassCache = false) {
    // Generate a reliable cache key using the full length and a slice of both ends to avoid collisions
    const cacheStr = prompt.length + "_" + prompt.slice(0, 50) + "_" + prompt.slice(-50);
    const cacheKey = `gemini_cache_${btoa(unescape(encodeURIComponent(cacheStr)))}`;

    if (!bypassCache) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) return cached;
    }

    try {
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 1000, temperature: 0.3 }
            })
        });

        if (!response.ok) {
            console.error("Gemini API Error", response.status);
            return "Analysis unavailable at the moment. Please verify your API Key and Network.";
        }

        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis unavailable.";

        if (result !== "Analysis unavailable.") {
            sessionStorage.setItem(cacheKey, result);
        }

        return result;
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
