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

    const prompt = `Abstract painting expressing exhaustion as continuous life without answers. Not a background but a quiet oppressive artwork.
Rough brush strokes with strong vertical streaks like rain or dripping walls. Uneven layered paint. No smooth gradients.
Composition: Asymmetrical with vertical depth. Top faint/distant, middle blurred and sinking inward, bottom darkest/heaviest. Downward flow.
Structure: Include faint human-like silhouettes, elongated and vertical, partially dissolved into the background. Not clear figures.
Space: Enclosed and deep. Sides darker than center.
Emotion: Heavy, slow, ongoing. Shapes dissolve and sink but do not disappear.
Texture: Mix thick and thin paint with visible streaks.
Color: Very low saturation, dark gray, black, muted blue/green, slight dull red. No bright tones.
Avoid: Flat fill, smooth blending, symmetry, decorative look.
Output: Dark textured scene with vertical flow and vague human shadows.
motion: ${body.input}${body.state ? ` (${body.state})` : ""}`;

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