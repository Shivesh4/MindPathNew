import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdfParse(buffer);

  let text = (data.text || '').trim();

  const maxChars = 8000;
  if (text.length > maxChars) {
    text = text.slice(0, maxChars) + '\n\n[Truncated for length]';
  }

  return text;
}

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const action = formData.get('action') || 'Summarise';

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported right now' },
        { status: 400 }
      );
    }

    const extractedText = await extractPdfText(file);
    if (!extractedText) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }

    let userPrompt;
    if (action === 'Summarise') {
      userPrompt =
        'Summarise the following document for a student. Include key ideas and a short list of actionable study tips.\n\n' +
        extractedText;
    } else if (action === 'Quiz') {
      userPrompt =
        'Create a 5-question quiz (with brief answers) based on the following document. Target an undergraduate student.\n\n' +
        extractedText;
    } else {
      userPrompt =
        'Generate 8–12 Q/A style flashcards that help a student revise the key concepts in this document.\n\n' +
        extractedText;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are MindPath, a study assistant helping students with PDFs. Always respond in clear, structured text, using bullet lists or numbered lists where helpful.',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 512,
    });

    const choice = completion.choices?.[0]?.message;
    const reply =
      choice?.content?.trim?.() ||
      'I was not able to generate a response from the document.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error processing PDF document:', error);
    return NextResponse.json(
      { error: 'Failed to analyse document' },
      { status: 500 }
    );
  }
}


