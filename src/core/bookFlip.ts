import { PageFlip } from "page-flip";
import type { FlipSetting, SizeType } from "page-flip";
import { virtualTotal } from "./pageMap";
import { syncWindow } from "./renderWindow";

export function vposToFlipIndex(vpos: number): number {
    return vpos - 1;
}

export function flipIndexToVpos(idx: number): number {
    return idx + 1;
}

export interface BookFlipController {
    next(): void;
    prev(): void;
    first(): Promise<void>;
    last(): Promise<void>;
    goTo(vpos: number): Promise<void>;
    getCurrentVpos(): number;
    update(): void;
}

const DEFAULT_SETTINGS: Partial<FlipSetting> = {
    width: 450,
    height: 636,
    size: "stretch" as SizeType,
    minWidth: 250,
    maxWidth: 1000,
    minHeight: 350,
    maxHeight: 1400,
    showCover: false,
    usePortrait: true,
    autoSize: true,
    drawShadow: true,
    maxShadowOpacity: 0.5,
    useMouseEvents: true,
    mobileScrollSupport: true,
};

export function createBookFlip(
    container: HTMLElement,
    pageElements: HTMLElement[],
    onPageChange: (vpos: number) => void,
    settings: Partial<FlipSetting> = {},
): BookFlipController {
    const pageFlip = new PageFlip(container, { ...DEFAULT_SETTINGS, ...settings });

    pageFlip.on("init", e => {
        const data = e.data as { page: number };
        const vpos = flipIndexToVpos(data.page);
        void syncWindow(vpos);
        onPageChange(vpos);
    });

    pageFlip.on("flip", e => {
        const vpos = flipIndexToVpos(Number(e.data));
        void syncWindow(vpos);
        onPageChange(vpos);
    });

    pageFlip.loadFromHTML(pageElements);

    function next(): void {
        pageFlip.flipNext();
    }

    function prev(): void {
        pageFlip.flipPrev();
    }

    async function goTo(vpos: number): Promise<void> {
        await syncWindow(vpos);
        pageFlip.flip(vposToFlipIndex(vpos));
    }

    async function first(): Promise<void> {
        await goTo(1);
    }

    async function last(): Promise<void> {
        await goTo(virtualTotal);
    }

    function getCurrentVpos(): number {
        return flipIndexToVpos(pageFlip.getCurrentPageIndex());
    }

    function update(): void {
        pageFlip.update();
    }

    return { next, prev, first, last, goTo, getCurrentVpos, update };
}
