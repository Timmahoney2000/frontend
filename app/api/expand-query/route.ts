import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `You are helping search through coding bootcamp videos. The user searched for: "${query}"

If this query is vague or could be improved, expand it to include related terms and concepts that would help find relevant videos.
If the query is already specific and clear, return it as-is.

Examples:
- "jobs" → "how to get a software engineering job, job search strategies, interview preparation, resume tips, networking for employment"
- "CSS" → "CSS styling, CSS flexbox, CSS grid, CSS layouts, CSS properties"
- "how to network effectively" → "how to network effectively" (already specific)

Return ONLY the expanded query text, nothing else.`,
      temperature: 0.3,
    });

    return NextResponse.json({ expandedQuery: result.text.trim() });
  } catch (error) {
    console.error('Query expansion error:', error);
    // Return original query if expansion fails
    const { query } = await req.json();
    return NextResponse.json({ expandedQuery: query });
  }
}