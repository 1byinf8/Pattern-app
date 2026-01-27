export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Debug logging
    console.log('=== Gemini API Request ===');
    console.log('API Key status:', apiKey ? `Present (length: ${apiKey.length}, starts with: ${apiKey.substring(0, 8)}...)` : 'MISSING!');
    console.log('Request action:', req.body?.action);

    if (!apiKey) {
        console.error('ERROR: GEMINI_API_KEY environment variable is not set!');
        return res.status(500).json({
            error: 'API key not configured',
            debug: 'GEMINI_API_KEY environment variable is missing. Please add it in Vercel Project Settings -> Environment Variables'
        });
    }

    try {
        const { action, data } = req.body;
        console.log('Processing action:', action);

        let prompt = '';
        let systemPrompt = '';

        if (action === 'generate_problem') {
            const { patterns, difficulty, questionNumber } = data;
            console.log('Generating problem for patterns:', patterns, 'difficulty:', difficulty);

            systemPrompt = `You are a senior software engineer and expert coding interview problem creator. You create challenging but fair interview problems similar to LeetCode.`;

            prompt = `Based on the patterns the user practiced this week, create a custom interview problem.

Patterns practiced: ${patterns.join(', ')}

Requirements:
- Question ${questionNumber} of 4
- Difficulty: ${difficulty}
- DO NOT mention the pattern name in the problem
- Make it feel like a real LeetCode/interview problem
- The pattern should not be obvious from the problem statement

Respond in this exact JSON format:
{
    "title": "Problem Title",
    "description": "Full problem description with context",
    "examples": [
        {"input": "example input", "output": "example output", "explanation": "optional explanation"}
    ],
    "constraints": ["constraint 1", "constraint 2"],
    "hints": ["hint 1 if they struggle", "hint 2"],
    "expectedPattern": "the pattern this tests",
    "expectedComplexity": {"time": "O(?)", "space": "O(?)"}
}`;
        }
        else if (action === 'review_code') {
            const { problem, code, conversation } = data;
            const prevContext = conversation.length > 0
                ? `Previous conversation:\n${conversation.map(c => `${c.role}: ${c.content}`).join('\n')}\n\n`
                : '';

            systemPrompt = `You are a senior software engineer conducting a coding interview. Be encouraging but thorough.`;

            prompt = `Problem: ${problem.title}
${problem.description}

User's code:
\`\`\`
${code}
\`\`\`

${prevContext}

Review the code and respond in this exact JSON format:
{
    "isCorrect": true/false,
    "feedback": "Your detailed feedback on the solution",
    "issues": ["issue 1 if any", "issue 2 if any"],
    "followUpQuestion": "A follow-up question about their approach, optimization, or edge cases (null if satisfied)",
    "isSatisfied": true/false (true if solution is good and no more questions needed)
}

Ask about:
- Time/space complexity
- Edge cases
- Alternative approaches
- Why they chose this approach`;
        }
        else if (action === 'answer_followup') {
            const { problem, code, conversation, answer } = data;
            const context = conversation.map(c => `${c.role}: ${c.content}`).join('\n');

            systemPrompt = `You are a senior software engineer conducting a coding interview. Be supportive and help them learn.`;

            prompt = `Problem: ${problem.title}
User's code:
\`\`\`
${code}
\`\`\`

Conversation so far:
${context}

User's latest answer: ${answer}

Evaluate their answer and respond in this exact JSON format:
{
    "feedback": "Your response to their answer",
    "followUpQuestion": "Another follow-up question if needed, or null if satisfied",
    "isSatisfied": true/false (true if you're satisfied with their understanding)
}

If they're struggling, guide them.`;
        }
        else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        // Build contents for Gemini API
        const contents = [];
        if (systemPrompt) {
            contents.push({ role: 'user', parts: [{ text: `System: ${systemPrompt}` }] });
            contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
        }
        contents.push({ role: 'user', parts: [{ text: prompt }] });

        // Call Gemini API with gemini-2.5-flash model
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192,
                        responseMimeType: 'application/json'
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                    ]
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('=== Gemini API Error ===');
            console.error('Status:', response.status);
            console.error('Response:', errorText);
            return res.status(500).json({
                error: 'AI service error',
                status: response.status,
                debug: errorText
            });
        }

        const result = await response.json();
        console.log('API response received successfully');

        const candidate = result.candidates?.[0];
        const content = candidate?.content;
        const parts = content?.parts || [];
        const text = parts[0]?.text || '';

        if (!text) {
            console.error('No text in response:', JSON.stringify(result));
            return res.status(500).json({ error: 'No response from AI', debug: result });
        }

        // Parse JSON from response with cleaning
        let parsed;
        try {
            // Try direct parse first
            parsed = JSON.parse(text);
        } catch (e) {
            // Clean and extract JSON
            let cleanedText = text.trim();

            // Remove markdown code blocks
            if (cleanedText.includes('```json')) {
                cleanedText = cleanedText.split('```json')[1];
                if (cleanedText.includes('```')) {
                    cleanedText = cleanedText.split('```')[0];
                }
            } else if (cleanedText.includes('```')) {
                const parts = cleanedText.split('```');
                if (parts.length >= 2) {
                    cleanedText = parts[1];
                }
            }

            cleanedText = cleanedText.trim();

            // Find JSON object boundaries
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('Could not parse JSON from:', text);
                return res.status(500).json({ error: 'Invalid AI response format', raw: text });
            }

            // Fix common JSON errors
            let jsonStr = jsonMatch[0];
            jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

            parsed = JSON.parse(jsonStr);
        }

        console.log('Successfully parsed AI response');
        return res.status(200).json(parsed);

    } catch (error) {
        console.error('=== Unexpected Error ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}
