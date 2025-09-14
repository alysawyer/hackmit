import * as pdfjsLib from 'pdfjs-dist';

// Set worker source - use jsDelivr which is more reliable for this version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please try a different file.');
  }
}
