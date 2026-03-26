import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { query, concepts } = JSON.parse(event.body || "{}");
    const nvidiaApiKey = process.env.NVIDIA_API_KEY || "";

    if (!nvidiaApiKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "NVIDIA_API_KEY not configured on server" }) 
      };
    }

    const conceptList = Array.isArray(concepts) ? concepts.map((c: any) => c.term).join(', ') : '';

    const payload = {
      model: "nvidia/nemotron-3-nano-30b-a3b",
      messages: [{
        role: "user",
        content: `I want to learn: "${query}". \nBased on the following available concepts in my database, generate a step-by-step learning roadmap. \nOnly use concepts from this list: [${conceptList}]. \nProvide a logical order and a brief reason why each step is important.\nOutput ONLY a JSON object with a single key "steps" containing an array of objects. Each object must have "term" (string), "reason" (string), and "order" (number).`
      }],
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
      stream: false,
      response_format: { type: "json_object" }
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

    if (!text) throw new Error('Empty response from Nvidia API');

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: text, // Result is already JSON string
    };
  } catch (error: any) {
    console.error('Roadmap generate failed:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || 'Failed to generate roadmap' }),
    };
  }
};
