import { FunctionDeclaration, GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_MESSAGE } from "../handleSendText";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

export async function Agent(prompt: string): Promise<any> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_MESSAGE,
      tools: [{
        functionDeclarations: masjidToolDeclarations,
      }],
    }
  });
  return response;
}




export const masjidToolDeclarations: FunctionDeclaration[] = [
  {
    name: "getListCountries",
    description: "Fetches a list of all countries available in the database.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "getCitiesByCountryId",
    description: "Fetches a list of cities given a specific Country ID.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        countryId: {
          type: Type.NUMBER,
          description: "The unique ID of the country to fetch cities for.",
        },
      },
      required: ["countryId"],
    },
  },
  {
    name: "searchMasjidByLocation",
    description: "Searches for Masjids (mosques) within a specified Country and City.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        countryId: {
          type: Type.NUMBER,
          description: "The unique ID of the country.",
        },
        cityId: {
          type: Type.NUMBER,
          description: "The unique ID of the city.",
        },
      },
      required: ["countryId", "cityId"],
    },
  },
  {
    name: "getOneWeekMultiSalahTimings",
    description: "Fetches the Salah (prayer) timings for one week for a specific Masjid, using its GUID.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        day: {
          type: Type.NUMBER,
          description: "The starting day of the month (1-31).",
        },
        month: {
          type: Type.NUMBER,
          description: "The month (1-12).",
        },
        guidId: {
          type: Type.STRING,
          description: "The unique GUID identifier of the Masjid.",
        },
      },
      required: ["day", "month", "guidId"],
    },
  },
  // Note: getPublicFilteredMasjid is omitted as it seems more complex for simple function calling.
];