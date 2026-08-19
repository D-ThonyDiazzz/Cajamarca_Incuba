import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { pageMap, virtualTotal, type PageMapEntry } from "./pageMap";
import { setVideoPageOnLayer, clearVideoLayer } from "./videoLayer";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const RENDER_SCALE = 1.5;
const DPR_CAP = 2;
const PAGE_CACHE_MAX = 12;
const pageCache = new Map<string, ImageBitmap>();

function cacheGet(key: string): ImageBitmap | null {
    if (!pageCache.has(key)) return null;
    const v = pageCache.get(key)!;
    pageCache.delete(key);
    pageCache.set(key, v);
    return v;
}

function cacheSet(key: string, bitmap: ImageBitmap): void {
    if (pageCache.has(key)) pageCache.delete(key);
    pageCache.set(key, bitmap);
    while (pageCache.size > PAGE_CACHE_MAX) {
        const oldest = pageCache.keys().next().value as string;
        const b = pageCache.get(oldest);
        pageCache.delete(oldest);
        b?.close();
    }
}

export let pdfDoc: PDFDocumentProxy | null = null;

export async function loadPdf(
    path: string,
    onProgress?: (loaded: number, total: number) => void,
): Promise<PDFDocumentProxy> {
    const loadingTask = pdfjsLib.getDocument({ url: path });
    if (onProgress) {
        loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) =>
            onProgress(loaded, total || 0);
    }
    pdfDoc = await loadingTask.promise;
    return pdfDoc;
}

export async function renderPage(
    position: number,
    canvas: HTMLCanvasElement,
    videoLayer: HTMLElement | null,
    numEl: HTMLElement | null,
): Promise<void> {
    const ctx = canvas.getContext("2d")!;

    if (position < 1 || position > virtualTotal) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = "block";
        if (videoLayer) clearVideoLayer(videoLayer);
        if (numEl) numEl.innerText = "";
        return;
    }

    const entry: PageMapEntry = pageMap[position - 1];

    if (entry.type === "video") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (numEl) numEl.innerText = entry.config.title;
        if (videoLayer) setVideoPageOnLayer(videoLayer, entry.config, canvas);
        return;
    }

    canvas.style.display = "block";
    if (videoLayer) clearVideoLayer(videoLayer);
    if (numEl) numEl.innerText = String(entry.pdfPage);

    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const cacheKey = `${entry.pdfPage}@${dpr}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
        canvas.width = cached.width;
        canvas.height = cached.height;
        ctx.drawImage(cached, 0, 0);
        return;
    }

    try {
        const page = await pdfDoc!.getPage(entry.pdfPage);
        const viewport = page.getViewport({ scale: RENDER_SCALE * dpr });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        if (typeof createImageBitmap === "function") {
            createImageBitmap(canvas).then(bmp => cacheSet(cacheKey, bmp)).catch(() => {});
        }
    } catch (error) {
        console.error(`Error PDF p.${entry.pdfPage}:`, error);
    }
}
