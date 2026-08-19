import "../Styles.css";
import { buildPageMap, virtualTotal } from "./core/pageMap";
import { loadPdf } from "./core/pdfSource";
import { registerPageDom, type PageDom } from "./core/renderWindow";
import { createBookFlip, type BookFlipController } from "./core/bookFlip";
import { createSidebar } from "./ui/sidebar";
import { createToc } from "./ui/toc";
import { createControls } from "./ui/controls";
import { createLoader } from "./ui/loader";

const DEBUG = /[?&]debug=1\b/.test(location.search);
const log = DEBUG ? console.log.bind(console) : () => {};

const PDF_PATH = "assets/pdfs/LIBRO.pdf";

const book = document.getElementById("book")!;
const loaderEl = document.getElementById("loader")!;

let isMobile = false;
let bookFlip: BookFlipController | undefined;
let controls: ReturnType<typeof createControls> | undefined;

function checkMobile(): void {
    isMobile = window.innerWidth <= 768;
}

const sidebar = createSidebar(
    document.getElementById("sidebar")!,
    document.getElementById("sidebarOverlay")!,
    document.getElementById("toggleMenu"),
    document.getElementById("closeSidebar"),
);

const toc = createToc(document.getElementById("tableOfContents")!, vpos => {
    bookFlip?.goTo(vpos);
    sidebar.close();
});

const loader = createLoader(loaderEl);

/**
 * Crea un <div class="page"> por cada posición virtual (PDF o video) y lo
 * registra en renderWindow.ts para que syncWindow() sepa a qué canvas/layer
 * pintar. Los ~171 divs quedan vacíos hasta que la ventana de renderizado
 * los alcanza — StPageFlip solo necesita que existan en el DOM desde el
 * inicio, no que ya tengan contenido.
 */
function buildPageElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const doms: PageDom[] = [];

    for (let pos = 1; pos <= virtualTotal; pos++) {
        const pageEl = document.createElement("div");
        pageEl.className = "page";
        pageEl.dataset.density = "soft";

        const content = document.createElement("div");
        content.className = "page-content";

        const canvas = document.createElement("canvas");
        const videoLayer = document.createElement("div");
        videoLayer.className = "video-layer";
        const footer = document.createElement("div");
        footer.className = "page-footer";
        const numEl = document.createElement("span");
        footer.appendChild(numEl);

        content.append(canvas, videoLayer, footer);
        pageEl.appendChild(content);
        book.appendChild(pageEl);

        elements.push(pageEl);
        doms.push({ canvas, videoLayer, numEl });
    }

    registerPageDom(doms);
    return elements;
}

function setupControls(): void {
    controls = createControls(
        {
            prevBtn: document.getElementById("prevBtn") as HTMLButtonElement,
            nextBtn: document.getElementById("nextBtn") as HTMLButtonElement,
            mobilePrev: document.getElementById("mobilePrev") as HTMLButtonElement,
            mobileNext: document.getElementById("mobileNext") as HTMLButtonElement,
            pageIndicator: document.getElementById("pageIndicator"),
            mobilePageIndicator: document.getElementById("mobilePageIndicator"),
            progressFill: document.getElementById("progressFill"),
            videoSelect: document.getElementById("videoSelect") as HTMLSelectElement,
            sectionSelect: document.getElementById("sectionSelect") as HTMLSelectElement,
            gotoInput: document.getElementById("gotoPageInput") as HTMLInputElement,
            gotoBtn: document.getElementById("gotoPageBtn") as HTMLButtonElement,
        },
        {
            next: () => bookFlip?.next(),
            prev: () => bookFlip?.prev(),
            first: () => {
                bookFlip?.first();
            },
            last: () => {
                bookFlip?.last();
            },
            goTo: target => {
                bookFlip?.goTo(target);
            },
            closeSidebar: () => sidebar.close(),
            isMobile: () => isMobile,
            getCurrentLeftVpos: () => bookFlip?.getCurrentVpos() ?? 1,
        },
        toc,
    );
}

let resizeTimeout: ReturnType<typeof setTimeout>;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        checkMobile();
        bookFlip?.update();
        controls?.updateControls();
    }, 300);
});

async function init(): Promise<void> {
    log("Iniciando carga del PDF...");
    try {
        const pdfDoc = await loadPdf(PDF_PATH, (loaded, total) => {
            loader.setProgress(total ? (loaded / total) * 100 : 0);
        });
        const totalPages = pdfDoc.numPages;
        log("PDF cargado - páginas:", totalPages);

        buildPageMap(totalPages);
        log(`Mapa: ${virtualTotal} posiciones`);

        checkMobile();
        const pageElements = buildPageElements();

        bookFlip = createBookFlip(book, pageElements, vpos => {
            controls?.updateControls();
            toc.highlightActive(vpos);
        });

        setupControls();
        loader.hide();

        controls?.updateControls();
        toc.render();
        toc.highlightActive(bookFlip.getCurrentVpos());

        log("Inicialización completa");
    } catch (error) {
        console.error("ERROR CRÍTICO:", error);
        loader.showError(error instanceof Error ? error.message : String(error));
    }
}

init();
