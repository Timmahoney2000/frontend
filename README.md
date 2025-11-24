This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Leon Noel Video Search

A semantic search application that allows users to search through Leon Noel's YouTube video library and find specific timestamps where topics are discussed. Built with Next.js, Tailwind CSS, Python, and Pinecone vector database.

## 🎯 Overview

This application helps learners quickly find relevant content from Leon Noel's extensive educational video library (100Devs). Instead of manually scrubbing through hours of content, users can simply ask questions in natural language and get directed to the exact moments in videos where those topics are covered.

## ✨ Features

- **Semantic Search**: Natural language queries to find relevant video content
- **Timestamped Results**: Direct links to specific moments in videos
- **Video Thumbnails**: Visual preview of each video result
- **Resource Hub**: Quick access to Leon Noel's resources and learning platforms
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Multiple Timestamps**: Each video shows multiple relevant segments

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **Python** - Backend API
- **FastAPI** - Modern Python web framework (recommended)
- **Pinecone** - Vector database for semantic search
- **Anthropic Claude API** - AI-powered natural language understanding
- **YouTube Transcript API** - Extract video transcripts

### Data Processing
- **OpenAI Embeddings** - Convert text to vector embeddings
- **Text Chunking** - Semantic segmentation with timestamp preservation

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- Pinecone account and API key
- Anthropic API key (for Claude)
- OpenAI API key (for embeddings)

## 🚀 Getting Started

### Frontend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd leon-noel-search
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Install required packages**
```bash
npm install lucide-react
```

4. **Configure Tailwind CSS** (if not already set up)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies**
```bash
pip install fastapi uvicorn pinecone-client anthropic openai youtube-transcript-api python-dotenv
```

4. **Create `.env` file**
```bash
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
```

5. **Run the backend server**
```bash
uvicorn main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).

## 📊 Data Pipeline

### 1. Extract Video Transcripts
```python
from youtube_transcript_api import YouTubeTranscriptApi

def get_transcript(video_id):
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    return transcript
```

### 2. Chunk and Process Transcripts
```python
def create_chunks(transcript, chunk_size=500):
    chunks = []
    current_chunk = []
    current_length = 0
    start_time = transcript[0]['start']
    
    for segment in transcript:
        text = segment['text']
        current_chunk.append(text)
        current_length += len(text)
        
        if current_length >= chunk_size:
            chunks.append({
                'text': ' '.join(current_chunk),
                'start': start_time,
                'end': segment['start'] + segment['duration']
            })
            current_chunk = []
            current_length = 0
            start_time = segment['start']
    
    return chunks
```

### 3. Generate Embeddings and Store in Pinecone
```python
import openai
from pinecone import Pinecone

pc = Pinecone(api_key="your-api-key")
index = pc.Index("leon-noel-videos")

def generate_embedding(text):
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response['data'][0]['embedding']

def store_in_pinecone(video_id, title, chunks):
    for i, chunk in enumerate(chunks):
        embedding = generate_embedding(chunk['text'])
        index.upsert([(
            f"{video_id}_{i}",
            embedding,
            {
                'video_id': video_id,
                'title': title,
                'text': chunk['text'],
                'timestamp_start': chunk['start'],
                'timestamp_end': chunk['end'],
                'url': f"https://youtube.com/watch?v={video_id}&t={int(chunk['start'])}s"
            }
        )])
```

## 🔌 API Endpoints

### POST `/api/search`

Search for videos based on a natural language query.

**Request Body:**
```json
{
  "query": "how to network for jobs"
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "1",
      "videoId": "gQojMIhELvM",
      "title": "100Devs - Networking & Getting Hired",
      "thumbnail": "https://img.youtube.com/vi/gQojMIhELvM/maxresdefault.jpg",
      "timestamps": [
        {
          "start": 320,
          "text": "How to network effectively at meetups"
        }
      ]
    }
  ]
}
```

## 📁 Project Structure
```
leon-noel-search/
├── app/
│   ├── page.tsx           # Main search page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   └── Header.tsx         # Navigation header
├── backend/
│   ├── main.py           # FastAPI application
│   ├── search.py         # Search logic
│   ├── embeddings.py     # Embedding generation
│   └── data_pipeline.py  # Data processing scripts
├── public/
├── .env.local            # Frontend environment variables
├── .env                  # Backend environment variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### Frontend Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Environment Variables

Create `.env`:
```
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
```

## 🎨 Customization

### Styling
All styling uses Tailwind CSS utility classes. Main color scheme:
- Background: `bg-black`
- Cards: `bg-zinc-900`
- Borders: `border-zinc-800`
- Accent: `text-blue-500`

### Search Results
Modify the number of results and relevance threshold in `backend/search.py`:
```python
results = index.query(
    vector=query_embedding,
    top_k=10,  # Number of results
    include_metadata=True
)
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Railway/Render)
1. Create a new service
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Leon Noel** - For creating the amazing 100Devs community and content
- **100Devs Community** - For inspiration and support

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

## 🔗 Resources

- [100Devs Website](https://100devs.org)
- [Leon Noel's YouTube](https://www.youtube.com/@leonnoel)
- [100Devs Discord](https://leonnoel.com/discord)
- [Next.js Documentation](https://nextjs.org/docs)
- [Pinecone Documentation](https://docs.pinecone.io)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
