import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { generateContent } from "../services/ai.service.js";

const descriptionGenerator = asynchandler(async (req, res) => {
  const { title, technologies, category, features } = req.body;

  if (!title || !technologies || !category || !features) {
    throw new ApiError(400, "PLease enter details");
  }

  const prompt = `
    Generate a professional project description for the following project.

    Title:${title}
    Category:${category}
    Technologies :${technologies}
    Features:${features}
    
    
    The description should be professional, concise and suitable for a portfolio website.
    `;
  const response = await generateContent(prompt);
  if (!response) {
    throw new ApiError(400, "Error while connecting with ai");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Description recieved"));
});

const tagsGenerator = asynchandler(async (req, res) => {
  const { title, description, technologies } = req.body;

  if (!title || !description || !technologies) {
    throw new ApiError(404, "Please enter inputs to make tags ");
  }

  const prompt = `

Generate 5-10 relevant tags for the following software project.

Title: ${title}
Description: ${description}
Technologies: ${technologies}

Return only comma separated tags without explanation.

`;
  const response = await generateContent(prompt);
  if (!response) {
    throw new ApiError(400, "Error while connecting with ai");
  }

  const tags = response.split(",").map((tag) => tag.trim());

  return res.status(200).json(new ApiResponse(200, tags, "Tags recieved"));
});

const projectReviewGenerator = asynchandler(async (req, res) => {
  const { title, description, technologies, category } = req.body;

  if (!title || !description || !technologies || !category) {
    throw new ApiError(400, "Please enter details");
  }

  const prompt = `

  You are an experienced software engineer and hackathon judge.

Review the following software project and provide constructive feedback.

Project Title:
${title}

Project Description:
${description}

Technologies Used:
${technologies}

Category:
${category}
 

Return the response strictly in JSON format:

{
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Do not include markdown, headings, code blocks, or explanations outside JSON.

Focus on:
- Technical architecture
- Scalability
- User experience
- Missing features
- Potential improvements
- Industry relevance

Keep the review practical and specific to this project. Avoid generic advice.

`;

  let response = await generateContent(prompt);
  if (!response) {
    throw new ApiError(400, "Error while connecting with ai");
  }

  response = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

 try {
     const review = JSON.parse(response);
 } catch {
    throw new ApiError(500,"Failed to parse AI response")
 }
  return res.status(200).json(new ApiResponse(200, review, "Review recieved"));
});

const projectAssistantChatbot = asynchandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    throw new ApiError(404, "Enter message");
  }

  const prompt = `
  You are ProjectSphere AI Assistant.

You help students with:
- project ideas
- software architecture decisions
- technology selection
- resume projects
- hackathon preparation
- portfolio improvement
- web development and programming concepts

Response Rules:

1. If the user sends greetings or casual messages such as:
   - hi
   - hello
   - hey
   - hii
   - good morning
   - thank you
   - thanks
   - bye

   Respond naturally in 1-2 short sentences only.
   Do not give long introductions or explain your capabilities unless the user asks.

2. If the user asks a simple factual question, give a concise answer.

3. If the user asks a conceptual or technical question, provide a clear and detailed explanation with examples when useful.

4. If the user asks for a brief explanation using phrases such as:
   - explain briefly
   - short answer
   - in short
   - concise explanation

   then keep the response short and focused.

5. If the user asks for more detail using phrases such as:
   - explain in detail
   - elaborate
   - deep explanation
   - teach me
   - how does it work

   then provide a detailed explanation with examples and practical insights.

6. Match the depth of the response to the user's question and intent instead of always giving long answers.

7. Be practical, educational, and beginner-friendly while maintaining technical accuracy.

 message:${message}
  
  `;

  const response = await generateContent(prompt);
  if (!response) {
    throw new ApiError(400, "Error while connecting with ai");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "response recieved"));
});

export {
  descriptionGenerator,
  tagsGenerator,
  projectReviewGenerator,
  projectAssistantChatbot,
};
