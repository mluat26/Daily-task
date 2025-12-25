
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWorkloadAdvice = async (projects: Project[]) => {
  const projectSummary = projects.map(p => ({
    name: p.projectName,
    deadline: p.deadline,
    status: p.status,
    isUrgent: p.isUrgent,
    tasksRemaining: p.tasks.filter(t => !t.completed).length
  }));

  const prompt = `As a freelance business consultant, analyze this workload and give me 3 concise, actionable pieces of advice in Vietnamese. 
  Focus on prioritizing urgent projects and managing deadlines.
  Current projects: ${JSON.stringify(projectSummary)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.7 },
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Không thể lấy lời khuyên lúc này. Hãy tập trung vào các dự án đang gấp!";
  }
};

export const parseTasksFromText = async (text: string): Promise<Partial<Task>[]> => {
  const currentYear = new Date().getFullYear();
  const prompt = `Trích xuất danh sách công việc và ngày hạn từ văn bản sau. 
  Định dạng ngày là YYYY-MM-DD. Mặc định năm là ${currentYear} nếu người dùng không ghi năm.
  Văn bản: "${text}"
  Trả về mảng JSON các đối tượng { "title": string, "dueDate": string }. 
  Chỉ trả về JSON, không giải thích thêm.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              dueDate: { type: Type.STRING }
            },
            required: ["title", "dueDate"]
          }
        }
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Task Parsing Error:", error);
    return [];
  }
};
