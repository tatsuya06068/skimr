import { NextRequest, NextResponse } from "next/server";

type TextRequest = {
  input: string;
};

type TextResponse = {
  text: string;
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const body: TextRequest = await request.json();

    if (!body.input || typeof body.input !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'input'" }, { status: 400 });
    }

    const prompt = `Generate a short Japanese phrase (max 15 characters) that gently and vaguely expresses the feeling: ${body.input}. No advice.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 20,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json({ error: `Failed to generate text: ${errorData.error?.message || 'Unknown error'}` }, { status: 500 });
    }

    const data = await openaiResponse.json();
    const text = data.choices[0].message.content.trim();

    const response: TextResponse = { text };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}