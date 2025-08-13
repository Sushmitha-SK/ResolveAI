import { createAgent, gemini } from '@inngest/agent-kit'

const analyzeTicket = async (ticket) => {
    const supportAgent = createAgent({
        model: gemini({
            model: "gemini-1.5-flash-8b",
            apiKey: process.env.GEMINI_API_KEY,
        }),
        name: 'AI Ticket Triage Assistant',
        system: `You are an expert AI assistant that processes technical support tickets...`
    });

    const response = await supportAgent.run(`
You are a ticket triage agent. 
Analyze the following support ticket and ONLY return a raw JSON object with exactly these keys:
{
  "summary": "Short 1-2 sentence summary of the issue",
  "priority": "low" | "medium" | "high",
  "helpfulNotes": "Detailed technical explanation with tips and external links if possible",
  "relatedSkills": ["Skill1", "Skill2"]
}

Do not add any other keys. 
Do not include markdown, code fences, or comments. 
Respond with only valid JSON.

Ticket information:
- Title: ${ticket.title}
- Description: ${ticket.description}
`);


    let raw = response.output?.[0]?.content || "";

    try {
        raw = raw.trim();

        if (raw.startsWith("```")) {
            raw = raw.replace(/```[a-z]*\n?/gi, "").replace(/```$/, "").trim();
        }

        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse AI response:", e.message, "\nRAW:", raw);
        return null;
    }
};


export default analyzeTicket;

