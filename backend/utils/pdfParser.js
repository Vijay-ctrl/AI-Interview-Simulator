const fs = require("fs");
const { PDFParse } = require("pdf-parse");

/**
 * Normalize and clean text extracted from a PDF.
 */
const cleanExtractedText = (text) => {
   if (
      !text ||
      typeof text !== "string"
   ) {
      return "";
   }

   let cleaned = text;

   // Normalize line endings
   cleaned = cleaned
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");

   // Remove zero-width and BOM characters
   cleaned = cleaned.replace(
      /[\u200B-\u200D\uFEFF]/g,
      ""
   );

   // Normalize special spaces
   cleaned = cleaned
      .replace(/\u00A0/g, " ")
      .replace(/\u202F/g, " ");

   // Normalize horizontal whitespace
   cleaned = cleaned.replace(
      /[ \t]+/g,
      " "
   );

   // Clean individual lines while preserving
   // the original document structure.
   cleaned = cleaned
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");

   // Prevent excessive blank lines
   cleaned = cleaned.replace(
      /\n{3,}/g,
      "\n\n"
   );

   return cleaned.trim();
};

/**
 * Validate that a file begins with the PDF signature.
 */
const isPDFFile = (buffer) => {
   if (
      !Buffer.isBuffer(buffer) ||
      buffer.length < 5
   ) {
      return false;
   }

   return buffer
      .subarray(0, 5)
      .toString("ascii") === "%PDF-";
};

/**
 * Extract text from a PDF file.
 */
const extractTextFromPDF = async (filePath) => {

   if (!filePath) {
      throw new Error(
         "PDF file path is required"
      );
   }

   if (!fs.existsSync(filePath)) {
      throw new Error(
         "PDF file does not exist"
      );
   }

   const stats = fs.statSync(filePath);

   if (!stats.isFile()) {
      throw new Error(
         "Provided PDF path is not a file"
      );
   }

   const dataBuffer = fs.readFileSync(
      filePath
   );

   if (
      !dataBuffer ||
      dataBuffer.length === 0
   ) {
      throw new Error(
         "PDF file is empty"
      );
   }

   if (!isPDFFile(dataBuffer)) {
      throw new Error(
         "Invalid PDF file"
      );
   }

   let parser;

   try {

      parser = new PDFParse({
         data: dataBuffer
      });

      const result =
         await parser.getText();

      const extractedText =
         result &&
            typeof result.text === "string"
            ? result.text
            : "";

      const cleanedText =
         cleanExtractedText(
            extractedText
         );

      // Handle scanned/image-only PDFs
      if (!cleanedText) {
         throw new Error(
            "No readable text could be extracted from the PDF. The PDF may be scanned or image-based."
         );
      }

      return cleanedText;

   } catch (error) {

      // Preserve our own meaningful errors
      if (
         error.message ===
         "No readable text could be extracted from the PDF. The PDF may be scanned or image-based." ||
         error.message ===
         "Invalid PDF file"
      ) {
         throw error;
      }

      console.error(
         "PDF text extraction error:",
         error.message
      );

      throw new Error(
         "Failed to extract text from PDF"
      );

   } finally {

      if (parser) {

         try {

            await parser.destroy();

         } catch (error) {

            console.error(
               "PDF parser cleanup error:",
               error.message
            );

         }

      }

   }

};

module.exports = extractTextFromPDF;