import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message, contextBlock } = JSON.parse(event.body || "{}");
    const nvidiaApiKey = process.env.NVIDIA_API_KEY || "";

    if (!nvidiaApiKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "NVIDIA_API_KEY not configured on server" }) 
      };
    }

    const payload = {
      model: "nvidia/nemotron-3-nano-30b-a3b",
      messages: [{
        role: "user",
        content: `${contextBlock}\n\nUser: ${message}\nKeep answer concise, clear, and engaging. If you mention concept names, prefix with [CONCEPT: name] for referencing.`
      }],
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
      stream: false
    };

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nvidiaApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Nvidia API Error: ${response.status} ${errorText}`);
    }

    const data: any = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (error: any) {
    console.error('Chat failed:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || 'Chat failed' }),
    };
  }
};
