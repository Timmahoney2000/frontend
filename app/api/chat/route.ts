import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `You are a helpful assistant that answers questions about Leon Noel's 100Devs coding bootcamp videos.

${context ? `Here is context from the video transcripts:
${context}

Use this context to answer questions accurately. Reference specific videos and timestamps when relevant.` : 'Help users find information about Leon Noel\'s 100Devs videos.'}

Be conversational, helpful, and encouraging. If you don't know something, suggest what the user should search for.`;

    const result = await streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      messages: messages,
      system: systemPrompt,
      temperature: 0.7,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Failed to generate response', { status: 500 });
  }
}