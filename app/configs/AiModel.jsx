const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const fs = require("node:fs");
  const mime = require("mime-types");
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseModalities: [
    ],
    responseMimeType: "application/json",
  };
  

    export const generateScript = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "write a two different script for 30 seconds video on topic: kids story,\n-do not add scene description\n-do not add anything in braces, just return the plain story in text\n-give me response in JSON format and follow the schema\n-{\n  scripts:[\n  {\n  content:\"\n  },\n  ],\n }"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"scripts\": [\n    {\n      \"content\": \"Narrator: Once upon a time, in a land filled with candy trees, lived a little gingerbread man. He loved to play hide-and-seek, but he was so delicious, everyone could always find him! One day, he met a friendly gumdrop who taught him how to camouflage himself with sprinkles. Now, he's the best hider in the whole candy land! Everyone laughs! The end.\"\n    },\n    {\n      \"content\": \"Lily: I wish I could fly like a bird! Mom: Close your eyes, Lily. Imagine you have wings. Narrator: Lily imagined feathery wings sprouting from her back. Lily: I'm flying! I can see the whole world! Narrator: Even though it was just pretend, Lily felt the wind in her hair and the joy of soaring high above the trees. Mom: See? Believing can make anything possible. \"\n    }\n  ]\n}\n```"},
          ],
        },
      ],
    });
    
    export const GenerateImageScript = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "Generate Image prompt of cinematic style with all details for each scene for 30 seconds video : script: Meet Droplet! Droplet loves the sun! The sun heats Droplet up, and Droplet floats into the air! That’s evaporation! Droplet joins other droplets making a big fluffy cloud. It's getting crowded! All the droplets bump together and get heavy. Uh oh! Here comes the rain! Droplet falls back to earth, helping plants grow. Eventually, Droplet makes it back to the ocean and starts the journey again!\n\nJust Give specific image prompt depends on the story line\n\ndo not give camera angle image prompt\n\nFollow the Following schema and return JSON data (Max 4-5 Images)\n\n[\n{\nimagePrompt:'',\nsceneContent: ' <Script Content>'\n\n}\n]\ndon't give any text in the beginning\n"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n[\n  {\n    \"imagePrompt\": \"A cheerful, animated water droplet character named Droplet, with big, friendly eyes, sparkling in the sunlight. The background is a vibrant, sunny meadow with a clear blue sky.\",\n    \"sceneContent\": \"Meet Droplet! Droplet loves the sun!\"\n  },\n  {\n    \"imagePrompt\": \"Droplet transforming into vapor and floating upwards, depicted as a translucent, shimmering version of itself. The background shows the meadow shrinking below, with heat waves emanating from the ground.\",\n    \"sceneContent\": \"The sun heats Droplet up, and Droplet floats into the air! That’s evaporation!\"\n  },\n  {\n    \"imagePrompt\": \"A fluffy, white cumulus cloud in a bright blue sky. Droplet is among many other droplets, all smiling and bumping into each other. The overall feeling is crowded and jovial.\",\n    \"sceneContent\": \"Droplet joins other droplets making a big fluffy cloud. It's getting crowded! All the droplets bump together and get heavy.\"\n  },\n  {\n    \"imagePrompt\": \"Heavy rain pouring down on a lush green landscape. Droplet is shown as a larger, heavier raindrop, falling towards the earth. There's a sense of urgency and release.\",\n    \"sceneContent\": \"Uh oh! Here comes the rain! Droplet falls back to earth, helping plants grow.\"\n  },\n  {\n    \"imagePrompt\": \"Droplet, now back in its original form, merging with the vast ocean. The ocean is sparkling and blue, with gentle waves. The overall feeling is peaceful and cyclical.\",\n    \"sceneContent\": \"Eventually, Droplet makes it back to the ocean and starts the journey again!\"\n  }\n]\n```"},
          ],
        },
      ],
    });
    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // // TODO: Following code needs to be updated for client-side apps.
    // const candidates = result.response.candidates;
    // for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
    //   for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
    //     const part = candidates[candidate_index].content.parts[part_index];
    //     if(part.inlineData) {
    //       try {
    //         const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
    //         fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
    //         console.log(`Output written to: ${filename}`);
    //       } catch (err) {
    //         console.error(err);
    //       }
    //     }
    //   }
    // }
    // console.log(result.response.text());
