import axios from "axios";
import { inngest } from "./client";
import { createClient } from "@deepgram/sdk"; 
import { GenerateImageScript } from "@/app/configs/AiModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const ImagePromptScript = `Generate Image prompt of {style} style with all details for each scene for 30 seconds video : script: {script}
- Just Give specific image prompt depends on the story line
- do not give camera angle image prompt
- Follow the Following schema and return JSON data (Max 4-5 Images)
- [
    {
        imagePrompt:'',
        sceneContent: ' <Script Content>'
    }
]`;

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

const BASE_URL = 'https://aigurulab.tech';

export const GenerateVideoData = inngest.createFunction(
  { id: 'generate-video-data' },
  { event: 'generate-video-data' },
  async ({ event, step }) => {
    const { script, topic, title, caption, videoStyle, voice, recordId } = event?.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Generate Audio file mp3
    const GenerateAudioFile = await step.run("GenerateAudioFile", async () => {
        try {
          const result = await axios.post(
            BASE_URL + "/api/text-to-speech",
            {
              input: script,
              voice: voice,
            },
            {
              headers: {
                "x-api-key": process.env.NEXT_PUBLIC_AIGURULAB_API_KEY,
                "Content-Type": "application/json",
              },
            }
          );
          return result.data.audio;
        } catch (err) {
          // ✅ Bubble the error with full details back to the CLI
          throw new Error(
            `Aigurulab TTS request failed: ${
              err.response?.data?.message || JSON.stringify(err.response?.data) || err.message
            }`
          );
        }
      });
      
      

    // Generate Captions
    const GenerateCaptions = await step.run("generateCaptions", async () => {
      try {
        const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
        const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
          { url: GenerateAudioFile },
          { model: "nova-3" }
        );
        if (error) throw new Error(error);
        return result.results?.channels[0]?.alternatives[0]?.words;
      } catch (err) {
        console.error("❌ Error in generating captions:", err.message);
        throw err;
      }
    });

    // Generate Image Prompts from Script
    const GenerateImagePrompts = await step.run("generateImagePrompt", async () => {
      try {
        const FINAL_PROMPT = ImagePromptScript
          .replace('{style}', videoStyle)
          .replace('{script}', script);
        const result = await GenerateImageScript.sendMessage(FINAL_PROMPT);
        const text = await result.response.text();
        const resp = JSON.parse(text);
        return resp;
      } catch (err) {
        console.error("❌ Error parsing image prompts:", err.message);
        throw err;
      }
    });

    // Generate Images using AI
    const GenerateImages = await step.run("generateImages", async () => {
      try {
        const images = await Promise.all(
          GenerateImagePrompts.map(async (element) => {
            try {
              const result = await axios.post(
                BASE_URL + '/api/generate-image',
                {
                  width: 1024,
                  height: 1024,
                  input: element?.imagePrompt,
                  model: 'sdxl',
                  aspectRatio: "1:1"
                },
                {
                  headers: {
                    'x-api-key': process.env.NEXT_PUBLIC_AIGURULAB_API_KEY,
                    'Content-Type': 'application/json',
                  },
                }
              );
              console.log("✅ Image generated:", result.data.image);
              return result.data.image;
            } catch (err) {
              console.error("❌ Error generating image:", err.response?.data || err.message);
              throw err;
            }
          })
        );
        return images;
      } catch (err) {
        console.error("❌ Error in generateImages step:", err.message);
        throw err;
      }
    });

    // Save All Data to DB
    const UpdateDB = await step.run("UpdateDB", async () => {
      try {
        const result = await convex.mutation(api.videoData.UpdateVideoRecord, {
          recordId: recordId,
          audioUrl: GenerateAudioFile,
          captionJson: GenerateCaptions,
          images: GenerateImages
        });
        return result;
      } catch (err) {
        console.error("❌ Error updating DB:", err.message);
        throw err;
      }
    });

    return '✅ Executed Successfully!';
  }
);
