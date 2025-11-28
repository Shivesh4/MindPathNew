import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, system } = body || {};

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const systemMessage =
      system ||
      'You are MindPath, a friendly, concise academic assistant. Help students and tutors with explanations, study guidance, and document summaries. Use clear, structured answers.';

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 512,
    });

    const choice = completion.choices?.[0]?.message;
    const reply = choice?.content?.trim?.() || 'I was not able to generate a response.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error calling Groq:', error);
    return NextResponse.json(
      { error: 'Failed to call AI assistant' },
      { status: 500 }
    );
  }
}


