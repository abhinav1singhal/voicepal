const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";

export const textToSpeech = async (text, voiceId = "21m00Tcm4TlvDq8ikWAM") => {
    if (!API_KEY) {
        console.warn("ElevenLabs API Key not found");
        return null;
    }

    try {
        const response = await fetch(`${BASE_URL}/${voiceId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": API_KEY,
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            }),
        });

        if (!response.ok) {
            throw new Error("ElevenLabs API request failed");
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error("Text-to-speech error:", error);
        return null;
    }
};
