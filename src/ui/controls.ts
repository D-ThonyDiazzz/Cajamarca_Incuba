import { pageMap, virtualTotal, getVideoVPos, pdfPageToVPos } from "../core/pageMap";
import { videoPagesConfig } from "../config/videoConfig";
import { sectionsConfig } from "../config/sectionConfig";
import { icon } from "./icons";
import type { TocController } from "./toc";

export interface ControlsCallbacks {
    next(): void;
    prev(): void;
    first(): void;
    last(): void;
    goTo(target: number): void;
    closeSidebar?(): void;
    isMobile(): boolean;
    getCurrentLeftVpos(): number;
}

export interface ControlsElements {
    prevBtn: HTMLButtonElement | null;
    nextBtn: HTMLButtonElement | null;
    mobilePrev: HTMLButtonElement | null;
    mobileNext: HTMLButtonElement | null;
    pageIndicator: HTMLElement | null;
    mobilePageIndicator: HTMLElement | null;
    progressFill: HTMLElement | null;
    videoSelect: HTMLSelectElement | null;
    sectionSelect: HTMLSelectElement | null;
    gotoInput: HTMLInputElement | null;
    gotoBtn: HTMLButtonElement | null;
}

export interface ControlsController {
    updateControls(): void;
}

export function flashInvalidInput(input: HTMLElement | null): void {
    if (!input) return;
    input.classList.add("goto-invalid");
    setTimeout(() => input.classList.remove("goto-invalid"), 600);
}

export function createControls(
    els: ControlsElements,
    cb: ControlsCallbacks,
    toc?: TocController,
): ControlsController {
    function updateControls(): void {
        const pageNum = cb.getCurrentLeftVpos();
        const isMobile = cb.isMobile();
        const leftEntry = pageNum >= 1 && pageNum <= virtualTotal ? pageMap[pageNum - 1] : null;
        const rightEntry = pageNum + 1 <= virtualTotal ? pageMap[pageNum] : null;

        const leftNum = leftEntry ? (leftEntry.type === "video" ? "▶" : leftEntry.pdfPage) : "—";
        const rightNum = rightEntry ? (rightEntry.type === "video" ? "▶" : rightEntry.pdfPage) : "—";

        if (els.pageIndicator) {
            els.pageIndicator.innerHTML = `${icon("book")} ${
                isMobile ? leftNum : `${leftNum} · ${rightNum}`
            }`;
        }

        if (isMobile) {
            if (els.mobilePrev) els.mobilePrev.disabled = pageNum <= 1;
            if (els.mobileNext) els.mobileNext.disabled = pageNum >= virtualTotal;
            if (els.mobilePageIndicator) els.mobilePageIndicator.innerText = `${pageNum} / ${virtualTotal}`;
        } else {
            if (els.prevBtn) els.prevBtn.disabled = pageNum <= 1;
            if (els.nextBtn) els.nextBtn.disabled = pageNum >= virtualTotal;
        }

        if (els.progressFill) {
            const displayed = isMobile ? pageNum : Math.min(pageNum + 1, virtualTotal);
            els.progressFill.style.width = `${(displayed / virtualTotal) * 100}%`;
        }

        toc?.highlightActive(pageNum);
    }

    function goToPageValidated(target: number | string): void {
        const t = typeof target === "string" ? parseInt(target, 10) : target;
        if (Number.isNaN(t) || t < 1 || t > virtualTotal) {
            flashInvalidInput(els.gotoInput);
            return;
        }
        cb.goTo(t);
        if (els.gotoInput) {
            els.gotoInput.value = "";
            els.gotoInput.blur();
        }
    }

    els.prevBtn?.addEventListener("click", () => cb.prev());
    els.nextBtn?.addEventListener("click", () => cb.next());
    els.mobilePrev?.addEventListener("click", () => cb.prev());
    els.mobileNext?.addEventListener("click", () => cb.next());

    if (els.videoSelect) {
        els.videoSelect.innerHTML = '<option value="">Ir a video...</option>';
        videoPagesConfig.forEach(v => {
            const vPos = getVideoVPos(v.title);
            if (vPos < 1) return;
            const opt = document.createElement("option");
            opt.value = String(vPos);
            opt.textContent = v.title;
            els.videoSelect!.appendChild(opt);
        });
        els.videoSelect.addEventListener("change", () => {
            if (!els.videoSelect!.value) return;
            goToPageValidated(els.videoSelect!.value);
            els.videoSelect!.value = "";
        });
    }

    if (els.sectionSelect) {
        els.sectionSelect.innerHTML = '<option value="">Ir a sección...</option>';
        sectionsConfig.forEach(sec => {
            const vPos = pdfPageToVPos(sec.page);
            const opt = document.createElement("option");
            opt.value = String(vPos);
            opt.textContent = sec.title;
            els.sectionSelect!.appendChild(opt);
        });
        els.sectionSelect.addEventListener("change", () => {
            if (!els.sectionSelect!.value) return;
            goToPageValidated(els.sectionSelect!.value);
            els.sectionSelect!.value = "";
        });
    }

    els.gotoBtn?.addEventListener("click", () => {
        if (els.gotoInput?.value) goToPageValidated(els.gotoInput.value);
    });

    if (els.gotoInput) {
        els.gotoInput.max = String(virtualTotal);
        els.gotoInput.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (els.gotoInput!.value) goToPageValidated(els.gotoInput!.value);
            }
        });
        els.gotoInput.addEventListener("focus", () => {
            if (virtualTotal > 0) els.gotoInput!.max = String(virtualTotal);
        });
    }

    document.addEventListener("keydown", e => {
        if (document.activeElement === els.gotoInput) return;
        if (e.key === "ArrowRight" || e.key === "PageDown") {
            e.preventDefault();
            cb.next();
        } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
            e.preventDefault();
            cb.prev();
        } else if (e.key === "Home") {
            e.preventDefault();
            cb.first();
        } else if (e.key === "End") {
            e.preventDefault();
            cb.last();
        } else if (e.key === "Escape") {
            cb.closeSidebar?.();
        }
    });

    return { updateControls };
}
