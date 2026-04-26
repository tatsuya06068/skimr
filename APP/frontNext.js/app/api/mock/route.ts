import { NextResponse } from "next/server";

const mockData = {
  feeling: "落ち着きたい",
  imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  caption: "深い青とやわらかな光で、静かな夜の余韻を描きます。",
};

export async function GET() {
  return NextResponse.json(mockData);
}
