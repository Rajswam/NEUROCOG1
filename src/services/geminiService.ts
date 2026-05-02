import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

export function getGemini() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    ai = new GoogleGenAI({ apiKey: key || 'MOCK_KEY' });
  }
  return ai;
}

export const queryKnowledgeBase = async (query: string, documents: {name: string, content: string}[]) => {
  const context = documents.length > 0 
    ? documents.map(d => `--- BEGIN ${d.name} ---\n${d.content}\n--- END ${d.name} ---`).join('\n\n')
    : 'No documents provided in the knowledge base.';

  const prompt = `You are an expert AI clinical assistant querying a clinical knowledge base.
Context Documents:
${context}

User Query:
${query}

Answer the user's query using the information in the provided documents. Reference the document names if possible. If the answer is not in the documents, state that clearly, but try to be as helpful as possible from your general knowledge while distinguishing it from the KB context. Be professional and analytical.`;

  try {
    const aiInstance = getGemini();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (err: any) {
    console.error('Error querying KB:', err);
    const errorMessage = err?.message || String(err);
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return '⚠️ **API Quota Exceeded:** You have exceeded your Gemini API quota. Please check your API plan and billing details at Google AI Studio.';
    }
    return 'Error querying Knowledge Base. Please check your API key and connection.';
  }
};

export const generateAnalyticalReport = async (caseDetails: string) => {
  const prompt = `You are an expert AI clinical assistant. 
Based on the following case details, produce a deep dive, detailed, and in-depth analytical report following the specific structure below:

DIAGNOSTIC PHASE (Steps 1–8)
1) Clinical presentation & chief complaint analysis
2) History taking & contextualization
3) Physical examination interpretation
4) Differential diagnosis generation
5) Investigations selection
6) Diagnostic confirmation
7) Pathophysiology mapping
8) Homeostatic derangements analysis

THERAPEUTIC PHASE (Steps 9–15)
9) Treatment planning & goal setting
10) Acute intervention & stabilization
11) Specific therapy initiation
12) Response monitoring & adjustment
13) Complication prevention
14) Multidisciplinary coordination
15) Patient education & engagement

OPTIMIZATION PHASE (Steps 16–21)
16) Outcome assessment & prognostic evaluation
17) Rehabilitation & functional optimization
18) Preventive strategy implementation
19) Discharge planning & transition
20) Follow-up & long-term monitoring
21) Continuity of care & system integration

Case Details:
${caseDetails}

Format strictly as a Markdown document.`;

  try {
    const aiInstance = getGemini();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (err: any) {
    console.error('Error generating report:', err);
    const errorMessage = err?.message || String(err);
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return '⚠️ **API Quota Exceeded:** You have exceeded your Gemini API quota. Please check your API plan and billing details at Google AI Studio.';
    }
    return 'Error generating report. Please check your API key.';
  }
};
