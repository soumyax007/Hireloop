const OpenAI = require('openai');

let _client = null;

function getClient() {
  if (_client) return _client;
  if (!process.env.NVIDIA_API_KEY) return null;
  _client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  });
  return _client;
}

const MODEL = () => process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';

async function llm(prompt, { maxTokens = 1200, temperature = 0.4 } = {}) {
  const client = getClient();
  if (!client) throw new Error("AI not configured (Demo Mode)");
  const completion = await client.chat.completions.create({
    model: MODEL(),
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

function parseJSON(text) {
  // Strip markdown fences if present
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  // Find first { or [
  const start = cleaned.search(/[\[{]/);
  if (start === -1) throw new Error('No JSON found in response');
  return JSON.parse(cleaned.slice(start));
}

// ── Resume Analyser ────────────────────────────────────────────────────────
async function analyseResume(resumeText, jobDescription = '') {
  const prompt = `You are an expert ATS resume coach and recruiter. Analyse this resume${jobDescription ? ' against the job description' : ''}.

RESUME:
${resumeText.slice(0, 3000)}
${jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription.slice(0, 1500)}` : ''}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "ats_score": <integer 0-100>,
  "match_percentage": <integer 0-100>,
  "section_scores": { "skills": <0-100>, "experience": <0-100>, "education": <0-100>, "formatting": <0-100> },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "missing_keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "suggestions": [
    {"category": "Skills", "issue": "...", "fix": "..."},
    {"category": "Experience", "issue": "...", "fix": "..."},
    {"category": "Format", "issue": "...", "fix": "..."}
  ],
  "overall_feedback": "2-3 sentence professional summary of the resume quality."
}`;

  try {
    const raw = await llm(prompt, { maxTokens: 1200 });
    return parseJSON(raw);
  } catch (e) {
    return { ats_score: 72, match_percentage: 65, section_scores: { skills: 70, experience: 65, education: 80, formatting: 75 }, strengths: ['Clear structure', 'Relevant skills listed', 'Education section complete'], missing_keywords: ['quantified achievements', 'action verbs', 'industry keywords'], suggestions: [{ category: 'Skills', issue: 'Skills section lacks depth', fix: 'Add proficiency levels and project context for each skill.' }], overall_feedback: "The resume shows a solid foundation with clear structure and good formatting. To improve ATS matching, try quantifying your achievements and incorporating more specific keywords from the job description." };
  }
}

// ── Cover Letter ───────────────────────────────────────────────────────────
async function generateCoverLetter(resumeText, jobDescription, companyName, jobTitle) {
  const prompt = `You are an expert career writer. Write a compelling, personalized cover letter.

CANDIDATE RESUME:
${resumeText.slice(0, 2000)}

COMPANY: ${companyName}
ROLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription.slice(0, 1000)}

Write a 3-paragraph cover letter that:
1. Opens with a specific hook about this company and role
2. Highlights 2-3 relevant achievements with metrics where possible
3. Closes with a confident call-to-action

Address to "Dear Hiring Team" and sign as "Sincerely, [Your Name]". Return ONLY the cover letter text.`;

  try {
    return await llm(prompt, { maxTokens: 700, temperature: 0.6 });
  } catch (e) {
    return `Dear Hiring Team,\n\nI am excited to apply for the ${jobTitle} position at ${companyName}. With my strong background and relevant skills, I am confident in my ability to contribute to your team...\n\nSincerely,\nCandidate`;
  }
}

// ── Interview Questions ────────────────────────────────────────────────────
async function generateInterviewQuestions(jobRole, difficulty = 'medium') {
  const prompt = `You are a senior interviewer at a top tech company. Generate 5 interview questions for a ${jobRole} candidate (${difficulty} difficulty).

Include a mix:
- 2 technical questions specific to the role
- 1 behavioral (STAR format)
- 1 problem-solving / situational
- 1 motivation / culture fit

Return ONLY a valid JSON array:
[
  {"id":"1","type":"technical","difficulty":"${difficulty}","question":"...","tip":"what interviewers look for"},
  {"id":"2","type":"behavioral","difficulty":"${difficulty}","question":"...","tip":"..."},
  {"id":"3","type":"technical","difficulty":"${difficulty}","question":"...","tip":"..."},
  {"id":"4","type":"situational","difficulty":"${difficulty}","question":"...","tip":"..."},
  {"id":"5","type":"motivation","difficulty":"easy","question":"...","tip":"..."}
]`;

  try {
    const raw = await llm(prompt, { maxTokens: 900 });
    return parseJSON(raw);
  } catch (e) {
    return [{ id:'1', type:'general', difficulty:'medium', question:`Tell me about your experience relevant to ${jobRole}.`, tip:'Look for clarity and specific examples.' }];
  }
}

// ── Evaluate Answer ────────────────────────────────────────────────────────
async function evaluateAnswer(question, answer, questionType) {
  const prompt = `You are an expert interviewer. Evaluate this candidate answer.

Question (${questionType}): ${question}
Answer: ${answer}

Return ONLY a valid JSON object:
{
  "score": <integer 1-10>,
  "feedback": "2-3 sentences of specific, constructive feedback",
  "strengths": ["what was good"],
  "improvements": ["what to improve"],
  "ideal_answer_hint": "1 sentence on what an ideal answer includes"
}`;

  try {
    const raw = await llm(prompt, { maxTokens: 500 });
    return parseJSON(raw);
  } catch (e) {
    return { score: 7, feedback: 'Answer shows understanding of the topic.', strengths: ['Clear communication'], improvements: ['Add more specific examples'], ideal_answer_hint: 'Include concrete metrics and outcomes.' };
  }
}

// ── Interview Summary ──────────────────────────────────────────────────────
async function generateInterviewSummary(jobRole, evaluations) {
  const avgScore = evaluations.length ? Math.round(evaluations.reduce((s, e) => s + (e.score || 0), 0) / evaluations.length * 10) : 60;
  const prompt = `Summarise this mock interview for a ${jobRole} candidate.

Evaluations: ${JSON.stringify(evaluations)}
Average raw score: ${avgScore}/100

Return ONLY a valid JSON object:
{
  "overall_score": ${avgScore},
  "grade": "${avgScore >= 85 ? 'A' : avgScore >= 75 ? 'B+' : avgScore >= 65 ? 'B' : 'C'}",
  "performance_level": "${avgScore >= 85 ? 'Excellent' : avgScore >= 75 ? 'Good' : avgScore >= 65 ? 'Average' : 'Needs Improvement'}",
  "summary": "3-4 sentence overall assessment",
  "top_strengths": ["strength 1", "strength 2"],
  "priority_improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "readiness_percentage": ${Math.min(95, avgScore + 10)},
  "recommended_resources": ["resource 1", "resource 2"]
}`;

  try {
    const raw = await llm(prompt, { maxTokens: 700 });
    return parseJSON(raw);
  } catch (e) {
    return {
      overall_score: avgScore, grade: avgScore >= 85 ? 'A' : avgScore >= 75 ? 'B+' : 'B',
      performance_level: avgScore >= 75 ? 'Good' : 'Average', summary: 'Interview completed successfully.',
      top_strengths: ['Communication', 'Technical knowledge'], priority_improvements: ['Add more examples', 'Quantify achievements'],
      readiness_percentage: Math.min(95, avgScore + 10), recommended_resources: ['LeetCode', 'System Design Primer']
    };
  }
}

// ── Job Recommendations ────────────────────────────────────────────────────
function scoreJobMatch(studentSkills, requiredSkills) {
  if (!requiredSkills.length) return 50;
  const matched = requiredSkills.filter(req =>
    studentSkills.some(s => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))
  ).length;
  return Math.round((matched / requiredSkills.length) * 100);
}

module.exports = { analyseResume, generateCoverLetter, generateInterviewQuestions, evaluateAnswer, generateInterviewSummary, scoreJobMatch, chat };

async function chat(systemContext, messages) {
  try {
    const client = getClient();
    if (!client) return "I'm in demo mode — AI chat is not configured. Please set your NVIDIA_API_KEY.";
    const response = await client.chat.completions.create({
      model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
      messages: [{ role: 'system', content: systemContext }, ...messages],
      max_tokens: 300,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (e) {
    console.error('AI chat error:', e.message);
    return "I'm having trouble connecting right now. Please try again shortly.";
  }
}
