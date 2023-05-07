import { readFile } from "node:fs/promises";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

export async function page2Text(page: pdfjsLib.PDFPageProxy) {
    const textContent = await page.getTextContent({ includeMarkedContent: false });
    let lastY = 0;
    let text = "";
    for (const item of textContent.items as Array<{ str: string; transform: number[] }>) {
        const currY = item.transform[5];
        if (lastY === currY || !lastY) {
            text += item.str;
        } else {
            text += "\n" + item.str;
        }
        lastY = currY;
    }
    return text;
}

export async function pdf2Text(pdfPath: string) {
    const buffer = await readFile(pdfPath);
    const doc = await pdfjsLib.getDocument(new Uint8Array(buffer)).promise;
    const texts = await Promise.all(
        Array.from({ length: doc.numPages }, (_, i) => i + 1).map(async (i) => {
            const page = await doc.getPage(i);
            const text = page2Text(page);
            return text;
        })
    );
    const text = texts.join("\n\n") + "\n";
    return text;
}
