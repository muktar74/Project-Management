import { GoogleGenAI } from "@google/genai";
import { Log, User, Task, Project } from "../types";

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


export const suggestNextTask = async (tasks: Task[], projects: Project[]): Promise<string> => {
    const projectMap = new Map(projects.map(p => [p.id, p.name]));

    if (tasks.length === 0) {
        return "You're all caught up! No open tasks to suggest.";
    }

    const formattedTasks = tasks.map(task => {
        const projectName = projectMap.get(task.projectId) || 'Unknown Project';
        return `- Task: "${task.title}" | Project: ${projectName} | Due: ${task.dueDate}`;
    }).join('\n');

    const prompt = `
        You are a productivity assistant for a project management tool. A team member has the following list of open tasks. Based on the task titles, their projects, and especially their due dates, suggest which single task they should focus on next and provide a brief, encouraging reason why. Prioritize tasks that are overdue or due soon.

        Today's date is ${new Date().toLocaleDateString()}.

        Here are the open tasks:
        ${formattedTasks}

        Respond with the suggested task title and the reason in markdown format.
        Example format:
        **Suggested Task:** Design the new dashboard
        **Reason:** This is due soon and is a critical first step for the upcoming user testing phase. Getting it done today will keep the project on track!
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for task suggestion:", error);
        throw new Error("Failed to generate task suggestion from Gemini API.");
    }
};