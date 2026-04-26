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

    const prompt = `Abstract painting expressing exhaustion and melancholic heaviness. Not a background but a quiet, oppressive artwork.
        Brush strokes, rough textures, uneven paint. No smooth gradients.
        Composition: Asymmetrical with vertical depth (like bottom of a well). Top faint/distant, middle blurred/sinking inward, bottom darkest/heaviest. Clear contrast.
        Structure: One subtle off-center focal area like a distant opening. Surroundings heavier and enclosing.
        Space: Suggest enclosure (walls/ruins). Sides darker/heavier than center, feeling trapped.
        Emotion: Heavy, slow, blurred, oppressive with melancholic tone. Shapes dissolve or sink inward.
        Texture: Mix thick/thin paint, uneven density, heavier at bottom/sides.
        Color: Low saturation, gray/muted blue/dark brown, very limited dull red. No bright tones.
        Avoid: Uniform texture, flat color, gradients, symmetry, decorative look.
        Output: Quiet fatigue with depth, enclosure, and stillness.
        Emotion: ${body.input}${body.state ? ` (${body.state})` : ""}`;

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