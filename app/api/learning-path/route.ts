import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const learningPathSchema = z.object({
  title: z.string(),
  description: z.string(),
  estimatedTime: z.string(),
  videos: z.array(z.object({
    videoId: z.string(),
    title: z.string(),
    reason: z.string(),
    keyTopics: z.array(z.string()),
  })),
});

export async function POST(req: Request) {
  try {
    const { goal, availableVideos } = await req.json();
    
    console.log('Learning path request:', { goal, videoCount: availableVideos?.length });

    if (!availableVideos || availableVideos.length === 0) {
      return NextResponse.json({ error: 'No videos available' }, { status: 400 });
    }

    const videoContext = availableVideos
      .slice(0, 20) // Limit to first 20 videos to avoid token limits
      .map((v: any) => `- "${v.title}" (${v.videoId})`)
      .join('\n');

    console.log('Calling OpenAI API...');

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'), // Using GPT-4o-mini - cheaper and faster
      schema: learningPathSchema,
      prompt: `Create a personalized learning path for this goal: "${goal}"

Available videos from Leon Noel's 100Devs bootcamp:
${videoContext}

Create a structured learning path that:
1. Sequences 5-7 videos in a logical learning order
2. Explains why each video is included (1-2 sentences)
3. Lists 3-5 key topics to focus on in each video
4. Estimates total time needed
5. Is encouraging and practical for a beginner

Return a JSON object with: title, description, estimatedTime, and videos array.`,
    });

    console.log('Generated learning path:', object);

    return NextResponse.json(object);
  } catch (error) {
    console.error('Learning path error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate learning path',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}