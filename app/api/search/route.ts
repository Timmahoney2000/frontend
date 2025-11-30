import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { NextResponse } from 'next/server';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const MIN_SCORE = 0.35;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('Search query:', query);

    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    console.log('Generated embedding');

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    const searchResults = await index.query({
      vector: embedding,
      topK: 50,
      includeMetadata: true,
    });

    console.log(`Found ${searchResults.matches.length} total matches from Pinecone`);

    // DEBUG: Log actual scores
    if (searchResults.matches.length > 0) {
      console.log('Top 5 match scores:', searchResults.matches.slice(0, 5).map(m => m.score));
    }

    const filteredMatches = searchResults.matches.filter(
      match => match.score && match.score >= MIN_SCORE
    );

    console.log(`After filtering (score >= ${MIN_SCORE}): ${filteredMatches.length} high-quality matches`);

    if (filteredMatches.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'No relevant results found. Try rephrasing your search.'
      });
    }

    const videosMap = new Map();

    for (const match of filteredMatches) {
      const metadata = match.metadata as any;
      const videoId = metadata.video_id;

      if (!videosMap.has(videoId)) {
        videosMap.set(videoId, {
          id: videoId,
          videoId: videoId,
          title: metadata.title || 'Unknown Video',
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          timestamps: [],
        });
      }

      const video = videosMap.get(videoId);
      video.timestamps.push({
        start: Math.floor(metadata.timestamp_start || 0),
        text: (metadata.text || '').substring(0, 200),
        score: match.score || 0,
      });
    }

    const results = Array.from(videosMap.values());
    console.log(`Returning ${results.length} unique videos`);

    return NextResponse.json({
      results,
      total: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}