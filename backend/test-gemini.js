require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
   apiKey: process.env.GEMINI_API_KEY
});

async function testGemini() {
   try {
      console.log("Testing Gemini API...");

      const interaction = await ai.interactions.create({
         model: "gemini-3.6-flash",
         input: "Give me one JavaScript technical interview question."
      });

      console.log("\nGemini response:");
      console.log(interaction.output_text);

   } catch (error) {
      console.error("\nGemini API error:");
      console.error(error.message);
   }
}

testGemini();