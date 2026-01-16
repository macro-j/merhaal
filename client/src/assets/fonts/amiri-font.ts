// Amiri Arabic font for jsPDF
// This file contains the base64-encoded Amiri-Regular font

import { jsPDF } from 'jspdf';

export async function loadAmiriFont(): Promise<string> {
  const response = await fetch('/fonts/Amiri-Regular.ttf');
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function addAmiriFont(doc: jsPDF, fontData: string): void {
  doc.addFileToVFS('Amiri-Regular.ttf', fontData);
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
}
