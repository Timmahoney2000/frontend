import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const relatedTopicsSchema = z.object({
  topics: z.array(z.object({
    query: z.string(),
    reason: z.string(),
  })),
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: relatedTopicsSchema,
      prompt: `Given this search query about coding/web development: "${query}"

Generate 4-5 related search queries that someone learning from Leon Noel's 100Devs bootcamp might also be interested in.

Each suggestion should:
- Be specific and actionable
- Build on or complement the original query
- Be relevant to web development/coding careers
- Have a brief reason why it's related

Example:
Query: "JavaScript arrays"
Related: 
- "JavaScript array methods" - "Learn map, filter, reduce"
- "JavaScript objects" - "Often used with arrays"
- "JavaScript loops" - "Common way to iterate arrays"`,
      temperature: 0.7,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error('Related topics error:', error);
    return NextResponse.json({ topics: [] }, { status: 500 });
  }
}