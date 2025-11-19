import { FunctionDeclaration, GoogleGenAI, Type, Content, Part } from "@google/genai";
import { SYSTEM_MESSAGE } from "../handleSendText";
import {
  getListCountries,
  getCitiesByCountryId,
  searchMasjidByLocation,
  searchMasjid,
  getOneWeekMultiSalahTimings,
} from "./mymasjid";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

const toolsMap: Record<string, Function> = {
  getListCountries,
  getCitiesByCountryId,
  searchMasjidByLocation,
  searchMasjid,
  getOneWeekMultiSalahTimings,
};

export async function Agent(prompt: string): Promise<any> {
  let contents: Content[] = [{ role: "user", parts: [{ text: prompt }] }];

  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_MESSAGE,
        tools: [
          {
            functionDeclarations: masjidToolDeclarations,
          },
        ],
      },
    });

    const candidate = response.candidates?.[0];

    // Check for function calls
    const functionCalls = candidate?.content?.parts?.filter(
      (part: Part) => part.functionCall
    );

    if (functionCalls && functionCalls.length > 0) {
      // Add the model's response (with function call) to history
      if (candidate?.content) {
        contents.push(candidate.content);
      }

      // Execute all function calls
      for (const part of functionCalls) {
        const functionCall = part.functionCall!;
        const functionName = functionCall.name;
        const functionArgs = functionCall.args;

        if (!functionName) continue;

        console.log(`Calling function: ${functionName}`, functionArgs);

        let functionResponse;
        try {
          const fn = toolsMap[functionName];
          if (fn) {
            // Call function with proper parameter mapping based on function name
            if (functionName === 'getListCountries') {
              functionResponse = await fn();
            } else if (functionName === 'getCitiesByCountryId') {
              functionResponse = await fn(functionArgs?.countryId);
            } else if (functionName === 'searchMasjidByLocation') {
              functionResponse = await fn(functionArgs?.countryId, functionArgs?.cityId);
            } else if (functionName === 'searchMasjid') {
              functionResponse = await fn(functionArgs?.searchParam);
            } else if (functionName === 'getOneWeekMultiSalahTimings') {
              functionResponse = await fn(functionArgs?.day, functionArgs?.month, functionArgs?.guidId);
            } else {
              // Fallback for any other functions
              functionResponse = await fn(...Object.values(functionArgs || {}));
            }
            console.log(`Function ${functionName} returned:`, JSON.stringify(functionResponse, null, 2));
          } else {
            functionResponse = { error: `Function ${functionName} not found` };
          }
        } catch (error: any) {
          console.error(`Error calling ${functionName}:`, error);
          functionResponse = { error: error.message };
        }

        // Add function response to history
        contents.push({
          role: "tool",
          parts: [
            {
              functionResponse: {
                name: functionName,
                response: { result: functionResponse },
              },
            },
          ],
        });
      }
      // Loop back to get the model's next response
    } else {
      // No function calls, return the final response
      return response;
    }
  }
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
    description:
      "Searches for Masjids (mosques) within a specified Country and City using their IDs. Use this when you have country and city IDs.",
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
    name: "searchMasjid",
    description:
      "Searches for Masjids using a free-text search term. This is simpler and faster than searchMasjidByLocation. Use this when the user provides a location name or masjid name as a search query.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        searchParam: {
          type: Type.STRING,
          description: "The search term - can be a city name, country name, masjid name, or any combination.",
        },
      },
      required: ["searchParam"],
    },
  },
  {
    name: "getOneWeekMultiSalahTimings",
    description:
      "Fetches the Salah (prayer) timings for one week for a specific Masjid, using its GUID.",
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
];