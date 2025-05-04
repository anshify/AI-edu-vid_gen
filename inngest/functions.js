import axios from "axios";
import { inngest } from "./client";
import { createClient } from "@deepgram/sdk";
import { GenerateImageScript } from "@/app/configs/AiModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const BASE_URL = 'https://aigurulab.tech';

export const GenerateVideoData = inngest.createFunction(
  { id: 'generate-video-data' },
  { event: 'generate-video-data' },
  async ({ event, step }) => {
    const { script, topic, title, caption, videoStyle, voice, recordId } = event?.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Step 1: Generate Audio file mp3
    const GenerateAudioFile = await step.run("GenerateAudioFile", async () => {
      const result = await axios.post(
        `${BASE_URL}/api/text-to-speech`,
        { input: script, voice },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_AIGURULAB_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      return result.data.audio;
    });

    // Step 2: Generate Captions + Duration
    const { captions, durationSec } = await step.run("generateCaptions", async () => {
      const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
      const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        { url: GenerateAudioFile },
        { model: "nova-3" }
      );
      if (error) throw new Error(error);

      const words = result.results?.channels[0]?.alternatives[0]?.words;
      const startTime = words[0]?.start || 0;
      const endTime = words[words.length - 1]?.end || 0;
      const duration = endTime - startTime;

      return { captions: words, durationSec: duration };
    });

    // Step 3: Generate Image Prompts (adaptive to duration)
    const GenerateImagePrompts = await step.run("generateImagePrompt", async () => {
      const numberOfScenes = Math.ceil(durationSec / 7); // 1 image every ~7 seconds
      const dynamicPrompt = `
        Generate ${numberOfScenes} unique image prompts of "${videoStyle}" style based on the following script:
        ----
        ${script}
        ----
        Return the result in JSON array format as:
        [
          {
            "imagePrompt": "<prompt for AI image>",
            "sceneContent": "<related part of the script>"
          }
        ]
        Don't include camera angles or styles like close-up, only focus on detailed visuals from story.
      `;
      const result = await GenerateImageScript.sendMessage(dynamicPrompt);
      const text = await result.response.text();
      return JSON.parse(text);
    });

    // Step 4: Generate Images
    const GenerateImages = await step.run("generateImages", async () => {
      const images = await Promise.all(
        GenerateImagePrompts.map(async (element) => {
          const res = await axios.post(
            `${BASE_URL}/api/generate-image`,
            {
              width: 1024,
              height: 1024,
              input: element.imagePrompt,
              model: 'sdxl',
              aspectRatio: "1:1"
            },
            {
              headers: {
                "x-api-key": process.env.NEXT_PUBLIC_AIGURULAB_API_KEY,
                "Content-Type": "application/json",
              },
            }
          );
          return res.data.image;
        })
      );
      return images;
    });

    // Step 5: Save to DB
    const UpdateDB = await step.run("UpdateDB", async () => {
      const result = await convex.mutation(api.videoData.UpdateVideoRecord, {
        recordId,
        audioUrl: GenerateAudioFile,
        captionJson: captions,
        images: GenerateImages,
      });
      return result;
    });

    return '✅ Executed Successfully!';
  }
);
