// lib/ai.ts
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

// Priority list of free models to try
const MODELS_TO_TRY = [
  "google/gemini-2.0-flash-exp:free",        // 1. Best Overall
  "meta-llama/llama-3.2-3b-instruct:free",   // 2. Very Fast
  "deepseek/deepseek-r1:free",               // 3. Smart Reasoning
  "mistralai/mistral-7b-instruct:free",      // 4. Reliable Backup
  "google/gemma-2-9b-it:free",               // 5. Another Google Option
];

export const getAIAdvice = async (mood: string, notes: string): Promise<string | null> => {
  if (!OPENROUTER_API_KEY) {
    console.error("❌ Error: Missing OpenRouter API Key in .env");
    return null;
  }

  // Try models one by one
  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`🔄 Trying Model: ${model}...`);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mindmend.app",
          "X-Title": "MindMend",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: `You are a wise, compassionate recovery coach. 
              The user has just logged a mood.
              Your goal: Validate their feeling in 5 words, then give ONE actionable, 
              physical coping strategy (e.g. box breathing, cold water, walk).
              Keep it under 30 words total. Be kind.`
            },
            {
              role: "user",
              content: `I am feeling ${mood}. ${notes ? `Context: ${notes}` : ""}`
            }
          ]
        })
      });

      // If we get a 429 (Rate Limit) or 503 (Overloaded), throw error to trigger next loop
      if (!response.ok) {
        const errData = await response.json();
        console.warn(`⚠️ Model ${model} failed: ${response.status}`, errData.error?.message);
        continue; // Skip to next model
      }

      const data = await response.json();
      
      // Success!
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        console.log(`✅ Success with ${model}`);
        return content;
      }
      
    } catch (error) {
      console.warn(`❌ Network error with ${model}:`, error);
      // Continue to next model
    }
  }

  console.error("❌ All free models failed or are busy.");
  return null;
};