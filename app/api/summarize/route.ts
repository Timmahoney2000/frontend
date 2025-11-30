import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { query, results } = await req.json();

    const context = results
      .slice(0, 5)
      .map((video: any, i: number) => {
        const timestamps = video.timestamps
          .slice(0, 3)
          .map((t: any) => 
            `[${Math.floor(t.start / 60)}:${(t.start % 60).toString().padStart(2, '0')}] ${t.text.substring(0, 100)}`
          )
          .join('\n  ');
        return `${i + 1}. "${video.title}"\n  ${timestamps}`;
      })
      .join('\n\n');

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      prompt: `User searched for: "${query}"

Here are relevant video segments from Leon Noel's 100Devs bootcamp:
${context}

Provide a brief, helpful summary (under 100 words) highlighting:
- The most relevant videos found
- What topics they cover
- When in the videos to find this information

Be conversational and encouraging.`,
      temperature: 0.7,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Summary error:', error);
    return new Response('Failed to generate summary', { status: 500 });
  }
}