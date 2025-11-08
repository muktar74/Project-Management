
import { GoogleGenAI } from "@google/genai";
import { Log, User } from "../types";

// Fix: Aligned with @google/genai coding guidelines.
// Removed API key checks and initialized the client directly with the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const summarizeLogs = async (logs: Log[], users: User[], projectName: string): Promise<string> => {
  const userMap = new Map(users.map(u => [u.id, u.name]));

  const formattedLogs = logs.map(log => {
    const userName = userMap.get(log.userId) || 'Unknown User';
    const blockerInfo = log.blockers ? ` | Blocker: ${log.blockers}` : '';
    return `- ${log.date} by ${userName} (${log.hours}h): ${log.task}${blockerInfo}`;
  }).join('\n');

  const prompt = `
    You are a project management assistant. Based on the following recent activity logs for the project "${projectName}", provide a concise summary of the progress.
    The summary should be structured into three sections: "Key Accomplishments", "Potential Blockers", and "Overall Status".
    Be brief and to the point. Use bullet points for accomplishments and blockers.

    Here are the logs:
    ${formattedLogs}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate summary from Gemini API.");
  }
};
