import { generateScript } from "@/app/configs/AiModel";
import { NextResponse } from "next/server";

const SCRIPT_PROMPT = `You are a creative educational script writer. 
Write two different scripts for a 27-second educational video on the topic: {topic}, tailored for the age group: {ageGroup}.

Instructions:
- Do not use dialogue format (no "Teen 1", "Narrator", etc).
- Use simple, clear, and age-appropriate language.
- Write it as a short engaging explanation or story in paragraph format.
- Do not add scene descriptions or anything in parentheses/braces.
Give me response in JSON format and follow the schema:
{
  scripts:[
    {
      content:""
    }
  ]
}`;

export async function POST(req) {
    const { topic, ageGroup } = await req.json();  // ✅ Extract ageGroup from request
    
    // Replace placeholders with actual values
    const PROMPT = SCRIPT_PROMPT.replace('{topic}', topic).replace('{ageGroup}', ageGroup);

    const result = await generateScript.sendMessage(PROMPT);
    const resp = result?.response?.text();

    return NextResponse.json(JSON.parse(resp));
}
