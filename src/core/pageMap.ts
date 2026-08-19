import { videoPagesConfig, type VideoPageConfig } from "../config/videoConfig";

export type PageMapEntry =
    | { type: "pdf"; pdfPage: number }
    | { type: "video"; config: VideoPageConfig };

export let pageMap: PageMapEntry[] = [];
export let virtualTotal = 0;

export function buildPageMap(totalPages: number): void {
    pageMap = [];

    const videoAfterMap = new Map<number, VideoPageConfig[]>();
    videoPagesConfig.forEach(v => {
        if (!videoAfterMap.has(v.afterPage)) videoAfterMap.set(v.afterPage, []);
        videoAfterMap.get(v.afterPage)!.push(v);
    });

    for (let p = 1; p <= totalPages; p++) {
        pageMap.push({ type: "pdf", pdfPage: p });
        const videos = videoAfterMap.get(p);
        if (videos) {
            videos.forEach(config => pageMap.push({ type: "video", config }));
        }
    }

    virtualTotal = pageMap.length;
}

export function pdfPageToVPos(pdfPage: number): number {
    const idx = pageMap.findIndex(e => e.type === "pdf" && e.pdfPage === pdfPage);
    return idx === -1 ? 1 : idx + 1;
}

export function getVideoVPos(title: string): number {
    const idx = pageMap.findIndex(e => e.type === "video" && e.config.title === title);
    return idx === -1 ? -1 : idx + 1;
}

export function getPositionLabel(pos: number): string {
    if (pos < 1 || pos > virtualTotal) return "—";
    const e = pageMap[pos - 1];
    return e.type === "video" ? `📹 ${e.config.title}` : String(e.pdfPage);
}
