import { pageMap, virtualTotal } from "./pageMap";
import { renderPage } from "./pdfSource";
import { clearVideoLayer } from "./videoLayer";

const RENDER_RADIUS = 3;
const VIDEO_RADIUS = 1;

export interface PageDom {
    canvas: HTMLCanvasElement;
    videoLayer: HTMLElement;
    numEl: HTMLElement | null;
}

let pageDomByPos: PageDom[] = [];
const renderedSet = new Set<number>();
const videoActiveSet = new Set<number>();
const pendingSet = new Set<number>();

export function registerPageDom(doms: PageDom[]): void {
    pageDomByPos = doms;
}

function rangeAround(center: number, radius: number): Set<number> {
    const set = new Set<number>();
    const from = Math.max(1, center - radius);
    const to = Math.min(virtualTotal, center + radius);
    for (let p = from; p <= to; p++) set.add(p);
    return set;
}

function releaseCanvas(canvas: HTMLCanvasElement): void {
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
}

/**
 * Mantiene con píxeles reales solo una ventana de posiciones alrededor del
 * centro actual (radio distinto para PDF y para video, ya que un iframe de
 * YouTube autoplay es mucho más caro que un canvas cacheado). El resto de
 * los ~171 <div> de página permanecen vacíos hasta que el usuario se acerca.
 */
export async function syncWindow(centerVpos: number): Promise<void> {
    if (!pageDomByPos.length || virtualTotal === 0) return;

    const wantedPdf = rangeAround(centerVpos, RENDER_RADIUS);
    const wantedVideo = rangeAround(centerVpos, VIDEO_RADIUS);

    for (const pos of wantedPdf) {
        if (renderedSet.has(pos) || pendingSet.has(pos)) continue;
        const entry = pageMap[pos - 1];
        if (entry.type === "video" && !wantedVideo.has(pos)) continue;

        pendingSet.add(pos);
        const dom = pageDomByPos[pos - 1];
        await renderPage(pos, dom.canvas, dom.videoLayer, dom.numEl);
        pendingSet.delete(pos);
        renderedSet.add(pos);
        if (entry.type === "video") videoActiveSet.add(pos);
    }

    for (const pos of [...renderedSet]) {
        if (wantedPdf.has(pos)) continue;
        const dom = pageDomByPos[pos - 1];
        releaseCanvas(dom.canvas);
        clearVideoLayer(dom.videoLayer);
        renderedSet.delete(pos);
        videoActiveSet.delete(pos);
    }

    for (const pos of [...videoActiveSet]) {
        if (wantedVideo.has(pos)) continue;
        const dom = pageDomByPos[pos - 1];
        clearVideoLayer(dom.videoLayer);
        videoActiveSet.delete(pos);
        renderedSet.delete(pos);
    }
}
