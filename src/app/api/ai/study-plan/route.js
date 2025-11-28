import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    if (req.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can generate AI study plans' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      subject,
      focusArea,
      weeks: requestedWeeks = 2,
      hoursPerWeek = 6,
      difficulty = 'medium',
    } = body || {};

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const weeks = Math.max(1, Math.min(Number(requestedWeeks) || 2, 4));

    const systemMessage =
      'You are MindPath, an AI study planner. You design concise, structured weekly study plans for students preparing for exams or mastering topics. ' +
      'You MUST follow the requested JSON shape and keep output compact: no more than 3 tasks per week and 2 sub-tasks per task.';

    const userPrompt = `
Create a personalized study plan for the following student:

- Subject: ${subject}
- Focus area / goal: ${focusArea || 'Not specified, infer a sensible focus'}
- Number of weeks: ${weeks}
- Approximate hours per week: ${hoursPerWeek}
- Difficulty: ${difficulty} (easy / medium / hard)

Return ONLY valid JSON with this exact shape (no markdown, no commentary):
{
  "id": "url-safe-plan-id",
  "subject": "Subject name",
  "focusArea": "Short description of the focus",
  "overallProgress": 0,
  "weeklyPlans": [
    {
      "week": 1,
      "title": "Week 1 title",
      "tasks": [
        {
          "id": "unique-task-id",
          "title": "Short task title",
          "day": "Day of week (e.g. Monday)",
          "completed": false,
          "subTasks": [
            {
              "id": "unique-subtask-id",
              "description": "Concrete sub-task the student should do",
              "completed": false
            }
          ]
        }
      ]
    }
  ]
}

Keep tasks concrete, time-bounded, and balanced across the weeks and days.
    `.trim();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_completion_tokens: 2048,
    });

    const raw = completion.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      // Some models may wrap JSON in markdown fences or add commentary.
      // Try to extract the JSON object between the first "{" and the last "}".
      let jsonText = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonText = jsonText.slice(firstBrace, lastBrace + 1);
      }

      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI study plan JSON:', parseError, raw);
      return NextResponse.json(
        {
          error:
            'The AI-generated plan was too large or malformed to parse. Try using fewer weeks or simplifying your request.',
        },
        { status: 500 }
      );
    }

    // Basic validation / normalization
    if (!parsed || !Array.isArray(parsed.weeklyPlans)) {
      return NextResponse.json(
        { error: 'AI response did not contain a valid weekly plan structure.' },
        { status: 500 }
      );
    }

    const normalizedPlan = {
      id: parsed.id || `${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      subject: parsed.subject || subject,
      focusArea: parsed.focusArea || focusArea || `AI-generated plan for ${subject}`,
      overallProgress: 0,
      weeklyPlans: parsed.weeklyPlans.map((week, index) => ({
        week: typeof week.week === 'number' ? week.week : index + 1,
        title: week.title || `Week ${index + 1}`,
        tasks: Array.isArray(week.tasks)
          ? week.tasks.map((task, taskIndex) => ({
              id:
                task.id ||
                `w${index + 1}-task-${taskIndex + 1}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`,
              title: task.title || 'Study task',
              day: task.day || 'To be scheduled',
              completed: false,
              subTasks: Array.isArray(task.subTasks)
                ? task.subTasks.map((st, stIndex) => ({
                    id:
                      st.id ||
                      `w${index + 1}-t${taskIndex + 1}-st${stIndex + 1}-${Math.random()
                        .toString(36)
                        .slice(2, 8)}`,
                    description: st.description || 'Sub-task',
                    completed: false,
                  }))
                : [],
            }))
          : [],
      })),
    };

    return NextResponse.json({ plan: normalizedPlan });
  } catch (error) {
    console.error('Error generating AI study plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI study plan' },
      { status: 500 }
    );
  }
}


