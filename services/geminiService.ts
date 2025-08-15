
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Handles errors from the Gemini API, providing user-friendly messages for common issues.
 * @param error The error object caught.
 * @param context A string describing the action that was attempted (e.g., "generate image").
 * @throws An error with a user-friendly message.
 */
const handleAndThrowApiError = (error: unknown, context: string): never => {
    console.error(`Error during ${context}:`, error);

    // Convert the error to a string representation for inspection.
    const errorString = (error instanceof Error) ? error.message : JSON.stringify(error);

    // Prioritize the most common, user-facing error.
    if (errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('429')) {
        throw new Error("API Quota Exceeded. You've made too many requests. Please check your plan and billing details, or try again later.");
    }

    // Try to extract a more specific message from a potential JSON payload.
    try {
        const jsonStartIndex = errorString.indexOf('{');
        if (jsonStartIndex > -1) {
            const jsonString = errorString.substring(jsonStartIndex);
            const parsedError = JSON.parse(jsonString);
            if (parsedError.error?.message) {
                // Prepend context to the specific API message.
                throw new Error(`API Error: ${parsedError.error.message}`);
            }
        }
    } catch (e) {
        // JSON parsing failed or the structure was unexpected. Fall through to generic error.
    }

    // If it's a regular Error object with a simple message, use it.
    if (error instanceof Error) {
        throw new Error(`An error occurred while trying to ${context}: ${error.message}`);
    }

    // Generic fallback for all other cases.
    throw new Error(`An API error occurred while trying to ${context}. Check the browser console for details.`);
};


/**
 * Parses an ImageScript string and converts it into a coherent prompt.
 * @param script The ImageScript code.
 * @returns A string prompt for the image generation model.
 */
export const parseImageScript = (script: string): string => {
  const cleanedScript = script.replace(/\/\/.*/g, '').replace(/[\r\n]+/g, ' ');

  const parts = {
    subject: '',
    subjectDescription: [] as string[],
    scene: '',
    sceneDescription: [] as string[],
    style: [] as string[],
    camera: [] as string[],
    palette: [] as string[],
  };

  const getValues = (content: string): string[] => {
      const regex = /:\s*"([^"]+)"/g;
      const values = [];
      let match;
      while((match = regex.exec(content)) !== null) {
          values.push(match[1]);
      }
      return values;
  }

  // Find create blocks e.g. create creature "dragon" { ... }
  const createRegex = /create\s+\w+\s+"([^"]+)"\s*\{([^}]+)\}/g;
  let createMatch = createRegex.exec(cleanedScript);
  if (createMatch) {
    parts.subject = `A ${createMatch[1]}`;
    parts.subjectDescription = getValues(createMatch[2]);
  }

  // Find set blocks e.g. set scene "forest" { ... } or set style { ... }
  const setRegex = /set\s+(\w+)(?:\s+"([^"]+)")?\s*\{([^}]+)\}/g;
  let setMatch;
  while ((setMatch = setRegex.exec(cleanedScript)) !== null) {
    const type = setMatch[1];
    const name = setMatch[2];
    const content = setMatch[3];
    const values = getValues(content);

    switch(type) {
      case 'scene':
        if(name) parts.scene = `in a ${name}`;
        parts.sceneDescription.push(...values);
        break;
      case 'style':
        parts.style.push(...values);
        break;
      case 'camera':
        parts.camera.push(...values);
        break;
      case 'palette':
        parts.palette.push(...values);
        break;
    }
  }

  const promptArray: string[] = [];

  if (parts.subject) {
      promptArray.push(parts.subject);
      if (parts.subjectDescription.length) promptArray.push(parts.subjectDescription.join(', '));
  } else {
    // If no create block, maybe there's a subject in a scene block name
    const sceneSubjectRegex = /set\s+scene\s+"([^"]+)"/g;
    const sceneSubjectMatch = sceneSubjectRegex.exec(cleanedScript);
    if (sceneSubjectMatch) {
      promptArray.push(`A scene of ${sceneSubjectMatch[1]}`);
    }
  }
  
  if (parts.scene) {
      promptArray.push(parts.scene);
  }
  
  if (parts.sceneDescription.length) {
      promptArray.push(...parts.sceneDescription);
  }

  const finalDetails: string[] = [];
  if (parts.style.length > 0) finalDetails.push(`style: (${parts.style.join(', ')})`);
  if (parts.camera.length > 0) finalDetails.push(`camera details: (${parts.camera.join(', ')})`);
  if (parts.palette.length > 0) finalDetails.push(`color palette: (${parts.palette.join(', ')})`);

  if(finalDetails.length > 0) promptArray.push(finalDetails.join(', '));
  
  let finalPrompt = promptArray.filter(p => p.trim().length > 0).join(', ');
  // clean up extra commas and spaces
  finalPrompt = finalPrompt.replace(/, ,/g, ',').replace(/,\s*,/g, ',');

  return finalPrompt || script; // fallback to script if parsing fails
};


/**
 * Describes an image using Gemini to generate a base prompt.
 * @param base64Image The base64 encoded image string.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to a text description of the image.
 */
export const describeImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };

    const textPart = {
      text: "Describe this image in a short, descriptive phrase to be used as a prompt for a new image generation. Focus on the main subject, its key attributes, the background, and the overall style. Be concise but comprehensive.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    handleAndThrowApiError(error, "describe image");
  }
};

/**
 * Generates an image using Imagen from a text prompt.
 * @param prompt The text prompt for image generation.
 * @param aspectRatio The desired aspect ratio for the generated image.
 * @returns A promise that resolves to the base64 encoded string of the generated image.
 */
export const generateImage = async (prompt: string, aspectRatio: string = '1:1'): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error)
 {
    handleAndThrowApiError(error, "generate image");
  }
};

/**
 * Generates a podcast script from a text prompt using Gemini.
 * @param basePrompt The base text prompt, usually a description of an image.
 * @returns A promise that resolves to the generated podcast script as a string.
 */
export const generatePodcastScript = async (basePrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a creative and engaging podcast host. Based on the following scene description, write a short, one-minute podcast script. Make it descriptive and imaginative. Scene: "${basePrompt}"`,
    });
    
    return response.text;
  } catch (error) {
    handleAndThrowApiError(error, "generate podcast script");
  }
};

/**
 * Expands a simple prompt into a more vivid and creative one using Gemini.
 * @param basePrompt The simple text prompt to expand.
 * @returns A promise that resolves to the enhanced, creative prompt.
 */
export const enhancePrompt = async (basePrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a world-class creative assistant for a text-to-image AI. Your task is to take a user's simple prompt and expand it into a rich, descriptive, and highly imaginative paragraph. Infuse it with surprising details, dramatic lighting, and a strong sense of atmosphere. Do not add any conversational text, just output the new prompt.

User's prompt: "${basePrompt}"`,
    });
    
    return response.text.trim();
  } catch (error) {
    handleAndThrowApiError(error, "enhance prompt");
  }
};

/**
 * Generates a sequence of prompts for creating an animation.
 * @param basePrompt The description of the initial scene/subject.
 * @param animationInstruction The description of the animation to perform.
 * @param frameCount The number of frames to generate prompts for.
 * @returns A promise that resolves to an array of image generation prompts.
 */
export const generateAnimationPrompts = async (basePrompt: string, animationInstruction: string, frameCount: number): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following scene and animation instruction, generate a sequence of ${frameCount} distinct prompts to create a smooth animation. Each prompt should describe a single frame. The first prompt should be very similar to the base scene, and the last prompt should fully complete the action. The prompts should transition logically between each other.

Base Scene: "${basePrompt}"
Animation Instruction: "${animationInstruction}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompts: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'A detailed prompt for a single animation frame.'
              }
            }
          }
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    
    if (parsed.prompts && Array.isArray(parsed.prompts)) {
      return parsed.prompts;
    } else {
      throw new Error("Invalid response format from AI. Expected a 'prompts' array.");
    }
  } catch (error) {
    handleAndThrowApiError(error, "generate animation prompts");
  }
};

/**
 * Generates an HTML/Tailwind component from a text prompt using Gemini.
 * @param prompt The description of the UI to generate.
 * @returns A promise that resolves to the generated HTML string.
 */
export const generateUI = async (prompt: string): Promise<string> => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt cannot be empty.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert web designer who creates single-page component mockups using HTML and Tailwind CSS. Create a component based on the following prompt.
      - Only respond with the raw HTML code for the component.
      - Do NOT include \`<html>\`, \`<body>\`, or \`\`\`html markdown tags.
      - Use placeholder images from unsplash if needed: \`https://source.unsplash.com/random/800x600?query\`.
      - The design should be clean, modern, and aesthetically pleasing.
      - Use the Manrope font for headings and Inter for body text.
      - Ensure the generated component is self-contained and ready to be rendered.
      
      Prompt: "${prompt}"`,
    });
    
    return response.text.trim();
  } catch (error) {
    handleAndThrowApiError(error, "generate UI component");
  }
};