import { NextRequest, NextResponse } from "next/server";

type GenerateRequest = {
  input: string;
  state?: string;
};

type GenerateResponse = {
  image: string;
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const body: GenerateRequest = await request.json();

    if (!body.input || typeof body.input !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'input'" }, { status: 400 });
    }

    const prompt = `Create an abstract wallpaper image representing the feeling: ${body.input}. ${
      body.state ? `Desired state: ${body.state}. ` : ""
    }The image should be abstract only, no real-world objects, no people, no landscape. Minimal, calm, soft gradient. Dark mode friendly. Leave top space for phone clock. No text inside image.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json({ error: `Failed to generate image: ${errorData.error?.message || 'Unknown error'}` }, { status: 500 });
    }

    const data = await openaiResponse.json();
    const imageUrl = data.data[0].url;

    const response: GenerateResponse = { image: imageUrl };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}