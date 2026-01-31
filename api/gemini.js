export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            received: req.method,
            expected: 'POST'
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Debug logging
    console.log('=== Gemini API Request ===');
    console.log('API Key status:', apiKey ? `Present (length: ${apiKey.length})` : 'MISSING!');
    console.log('Request action:', req.body?.action);

    if (!apiKey) {
        console.error('ERROR: GEMINI_API_KEY environment variable is not set!');
        return res.status(500).json({
            error: 'API key not configured',
            debug: 'GEMINI_API_KEY environment variable is missing. Please add it in Vercel Project Settings -> Environment Variables',
            hint: 'After adding the variable, you must redeploy the project'
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
        else if (action === 'generate_interview') {
            const { patterns } = data;
            console.log('Generating full interview for patterns:', patterns);

            systemPrompt = `You are a senior software engineer and expert coding interview problem creator. You create challenging but fair interview problems similar to LeetCode.`;

            prompt = `Create a complete 4-question coding interview based on these patterns: ${patterns.join(', ')}

Requirements:
- Question 1: Easy (Warmup)
- Question 2: Medium (Core pattern)
- Question 3: Medium (Variation)
- Question 4: Hard (Complex/Combined)
- DO NOT mention the pattern name in the problem titles or descriptions
- Make it feel like a real coherent interview

Respond in this exact JSON format:
[
    {
        "title": "Problem 1 Title",
        "description": "Description...",
        "examples": [{"input": "...", "output": "...", "explanation": "..."}],
        "constraints": ["..."],
        "hints": ["..."],
        "expectedPattern": "...",
        "expectedComplexity": {"time": "...", "space": "..."}
    },
    { ... (Problem 2) ... },
    { ... (Problem 3) ... },
    { ... (Problem 4) ... }
]`;
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
            return res.status(400).json({
                error: 'Invalid action',
                received: action,
                expected: 'generate_problem | generate_interview | review_code | answer_followup'
            });
        }

        // Build contents for Gemini API
        const contents = [];
        if (systemPrompt) {
            contents.push({ role: 'user', parts: [{ text: `System: ${systemPrompt}` }] });
            contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
        }
        contents.push({ role: 'user', parts: [{ text: prompt }] });

        // Call Gemini API with gemini-2.5-flash model
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        console.log('Calling Gemini API...');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('=== Gemini API Error ===');
            console.error('Status:', response.status);
            console.error('Response:', errorText);

            // Try to parse error for better message
            let errorMessage = 'AI service error';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error?.message || errorMessage;
            } catch (e) {
                // Use raw text if not JSON
                errorMessage = errorText.substring(0, 200);
            }

            return res.status(500).json({
                error: 'AI service error',
                status: response.status,
                message: errorMessage,
                hint: response.status === 400 ? 'Check if API key is valid' : 'Service temporarily unavailable'
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
            return res.status(500).json({
                error: 'No response from AI',
                debug: result,
                hint: 'The AI returned an empty response'
            });
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

            // Try to find JSON - could be object {...} or array [...]
            let jsonStr = null;

            // Check if it starts with [ for array (generate_interview returns array)
            const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
            const objectMatch = cleanedText.match(/\{[\s\S]*\}/);

            if (arrayMatch && (!objectMatch || arrayMatch.index <= objectMatch.index)) {
                jsonStr = arrayMatch[0];
            } else if (objectMatch) {
                jsonStr = objectMatch[0];
            }

            if (!jsonStr) {
                console.error('Could not parse JSON from:', text);
                return res.status(500).json({
                    error: 'Invalid AI response format',
                    raw: text.substring(0, 500),
                    hint: 'The AI did not return valid JSON'
                });
            }

            // Fix common JSON errors (trailing commas)
            jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

            try {
                parsed = JSON.parse(jsonStr);
            } catch (parseError) {
                console.error('JSON parse error after cleanup:', parseError.message);
                console.error('Attempted to parse:', jsonStr.substring(0, 500));
                return res.status(500).json({
                    error: 'Failed to parse AI response',
                    message: parseError.message,
                    hint: 'The AI returned malformed JSON'
                });
            }
        }

        console.log('Successfully parsed AI response');
        return res.status(200).json(parsed);

    } catch (error) {
        console.error('=== Unexpected Error ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            type: error.name,
            hint: 'An unexpected error occurred. Check Vercel function logs for details.'
        });
    }
}