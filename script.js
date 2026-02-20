pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const PDF_PATH = "assets/pdfs/LIBRO.pdf";

console.log("═══════════════════════════════════════════");
console.log("✅ Script cargado correctamente");
console.log("📁 Ruta del PDF configurada:", PDF_PATH);
console.log("🔧 PDF.js Worker URL:", pdfjsLib.GlobalWorkerOptions.workerSrc);
console.log("🌐 PDF.js versión:", pdfjsLib.version || "No disponible");
console.log("📱 User Agent:", navigator.userAgent);
console.log("🖥️ Ancho de ventana:", window.innerWidth, "px");
console.log("═══════════════════════════════════════════");

// afterPage = después de qué página PDF se inserta la página de video
const videoPagesConfig = [
    { afterPage: 57, videoId: "Fiq-YWi2yzw",  title: "Ecoacción",          autoplay: true },
    { afterPage: 59, videoId: "iXkLMzDr5h8",  title: "Clara Mía",          autoplay: true },
    { afterPage: 60, videoId: "67ELIRWpA8A",  title: "CARNIFER BIOEXPORT", autoplay: true },
    { afterPage: 61, videoId: "eFYCqwn4m6c",  title: "CONCALLUA",          autoplay: true },
    { afterPage: 64, videoId: "qpFj0cF-cfQ",  title: "Fruturú",            autoplay: true },
    { afterPage: 65, videoId: "dBlVl2ycyfw",  title: "MANDO",              autoplay: true },
    { afterPage: 66, videoId: "EGQMTJQBnBs",  title: "Byte",               autoplay: true },
    { afterPage: 67, videoId: "3ZJay045efg",  title: "Azul Sostenible",    autoplay: true },
    { afterPage: 72, videoId: "o5E1ffeBdSk",  title: "HANDIN",             autoplay: true },
    { afterPage: 75, videoId: "UHhfQyrAnqM",  title: "BRIXSAN",             autoplay: true },
    { afterPage: 77, videoId: "6ZiEiVrfYrQ",  title: "Doña Gallina",       autoplay: true },
    { afterPage: 79, videoId: "pc9R2JGTA_s",  title: "Cata's Boutique",    autoplay: true }
];

const sectionsConfig = [
    { title: "Portada",                                   page: 1  },
    { title: "Introducción",                              page: 3  },
    { title: "Historia de Cajamarca Incuba",              page: 5  },
    { title: "Puertas de ingreso",                        page: 13 },
    { title: "Diagnóstico actual",                        page: 31 },
    { title: "Servicios brindados",                       page: 42 },
    { title: "Sostenibilidad financiera",                 page: 50 },
    { title: "Experiencia de emprender",                  page: 56 },
    { title: "Casos de éxito",                            page: 70 },
    { title: "Lecciones y propuestas",                    page: 83 }
];


let pdfDoc         = null;
let totalPages     = 0;
let pageNum        = 1;
let isAnimating    = false;
let isMobile       = false;
let isZooming      = false;
let touchStartDistance = 0;
let initialTouches     = 0;

let pageMap      = [];
let virtualTotal = 0;

const book                = document.getElementById("book");
const flipper             = document.getElementById("flipper");
const loader              = document.getElementById("loader");
const leftCanvas          = document.getElementById("leftCanvas");
const rightCanvas         = document.getElementById("rightCanvas");
const flipFrontCanvas     = document.getElementById("flipFrontCanvas");
const flipBackCanvas      = document.getElementById("flipBackCanvas");
const leftVideoLayer      = document.getElementById("leftVideoLayer");
const rightVideoLayer     = document.getElementById("rightVideoLayer");
const flipFrontVideoLayer = document.getElementById("flipFrontVideoLayer");
const flipBackVideoLayer  = document.getElementById("flipBackVideoLayer");
const leftNumEl           = document.getElementById("leftPageNum");
const rightNumEl          = document.getElementById("rightPageNum");
const flipFrontNumEl      = document.getElementById("flipFrontNum");
const flipBackNumEl       = document.getElementById("flipBackNum");
const prevBtn             = document.getElementById("prevBtn");
const nextBtn             = document.getElementById("nextBtn");
const pageIndicator       = document.getElementById("pageIndicator");
const progressFill        = document.getElementById("progressFill");
const mobilePrev          = document.getElementById("mobilePrev");
const mobileNext          = document.getElementById("mobileNext");
const mobilePageIndicator = document.getElementById("mobilePageIndicator");
const videoSelect         = document.getElementById("videoSelect");
const sectionSelect       = document.getElementById("sectionSelect");

console.log("═══════════════════════════════════════════");
console.log("🔍 VERIFICACIÓN DE ELEMENTOS DOM:");
console.log("  ✓ book:",        book        ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ loader:",      loader      ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ leftCanvas:",  leftCanvas  ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ rightCanvas:", rightCanvas ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ prevBtn:",     prevBtn     ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ nextBtn:",     nextBtn     ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("═══════════════════════════════════════════");

// Inserta cada video DESPUÉS de su página PDF correspondiente
function buildPageMap() {
    pageMap = [];

    const videoAfterMap = new Map();
    videoPagesConfig.forEach(v => {
        if (!videoAfterMap.has(v.afterPage)) videoAfterMap.set(v.afterPage, []);
        videoAfterMap.get(v.afterPage).push(v);
    });

    for (let p = 1; p <= totalPages; p++) {
        pageMap.push({ type: "pdf", pdfPage: p });
        if (videoAfterMap.has(p)) {
            videoAfterMap.get(p).forEach(config => {
                pageMap.push({ type: "video", config });
            });
        }
    }

    virtualTotal = pageMap.length;
    console.log(`📚 Mapa construido: ${virtualTotal} posiciones (${totalPages} PDF + ${videoPagesConfig.length} video)`);
}

function pdfPageToVPos(pdfPage) {
    const idx = pageMap.findIndex(e => e.type === "pdf" && e.pdfPage === pdfPage);
    return idx === -1 ? 1 : idx + 1;
}

function getVideoVPos(title) {
    const idx = pageMap.findIndex(e => e.type === "video" && e.config.title === title);
    return idx === -1 ? -1 : idx + 1;
}

function getPositionLabel(pos) {
    if (pos < 1 || pos > virtualTotal) return "—";
    const e = pageMap[pos - 1];
    return e.type === "video" ? `📹 ${e.config.title}` : String(e.pdfPage);
}

function stopAllVideos() {
    document.querySelectorAll(".video-layer").forEach(layer => {
        layer.innerHTML = "";
        layer.style.display = "none";
        layer.className = "video-layer";
    });
}

function clearFlipperLayers() {
    [flipFrontVideoLayer, flipBackVideoLayer].forEach(layer => {
        layer.innerHTML = "";
        layer.style.display = "none";
        layer.className = "video-layer";
    });
}

function setVideoPageOnLayer(layerEl, config, canvasEl) {
    layerEl.innerHTML = "";
    layerEl.className = "video-layer active replace-mode";
    layerEl.style.display = "flex";
    if (canvasEl) canvasEl.style.display = "none";

    const badge = document.createElement("div");
    badge.className = "video-badge";
    badge.innerHTML = '<i class="fas fa-video"></i> TESTIMONIO';
    layerEl.appendChild(badge);

    const vidContainer = document.createElement("div");
    vidContainer.className = "video-container";

    if (!config.videoId) {
        vidContainer.innerHTML = `
            <div class="video-placeholder">
                <div class="video-placeholder-icon"><i class="fas fa-play-circle"></i></div>
                <div class="video-placeholder-text">${config.title}</div>
                <div class="video-placeholder-subtitle">Video próximamente disponible</div>
            </div>`;
    } else {
        const baseParams    = "rel=0&modestbranding=1&color=white&playsinline=1&controls=1&enablejsapi=1";
        const autoplayParam = config.autoplay ? "&autoplay=1" : "";
        vidContainer.innerHTML = `
            <div class="video-header">
                <h3 class="video-main-title">
                    <i class="fas fa-store"></i> ${config.title}
                </h3>
            </div>
            <div class="video-responsive">
                <iframe
                    src="https://www.youtube.com/embed/${config.videoId}?${baseParams}${autoplayParam}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    loading="lazy"
                    title="${config.title}"
                ></iframe>
            </div>`;
    }

    layerEl.appendChild(vidContainer);
}

async function renderPage(position, canvas, videoLayer, numEl) {
    const ctx = canvas.getContext("2d");

    if (position < 1 || position > virtualTotal) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = "block";
        if (videoLayer) {
            videoLayer.innerHTML = "";
            videoLayer.style.display = "none";
            videoLayer.className = "video-layer";
        }
        if (numEl) numEl.innerText = "";
        return;
    }

    const entry = pageMap[position - 1];

    if (entry.type === "video") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (numEl) numEl.innerText = entry.config.title;
        if (videoLayer) setVideoPageOnLayer(videoLayer, entry.config, canvas);
        return;
    }

    canvas.style.display = "block";
    if (videoLayer) {
        videoLayer.innerHTML = "";
        videoLayer.style.display = "none";
        videoLayer.className = "video-layer";
    }
    if (numEl) numEl.innerText = entry.pdfPage;

    console.log(`📄 Renderizando PDF p.${entry.pdfPage} (posición virtual ${position})`);

    try {
        const page     = await pdfDoc.getPage(entry.pdfPage);
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        console.log(`✅ PDF p.${entry.pdfPage} renderizada`);
    } catch (error) {
        console.error(`❌ Error PDF p.${entry.pdfPage}:`, error);
    }
}

function getDistance(touch1, touch2) {
    const dx = touch1.screenX - touch2.screenX;
    const dy = touch1.screenY - touch2.screenY;
    return Math.sqrt(dx * dx + dy * dy);
}

async function init() {
    console.log("🚀 INICIANDO CARGA DEL PDF...");
    try {
        pdfDoc     = await pdfjsLib.getDocument(PDF_PATH).promise;
        totalPages = pdfDoc.numPages;
        console.log("✅ PDF cargado - Total páginas PDF:", totalPages);

        buildPageMap();

        const gotoInput = document.getElementById("gotoPageInput");
        if (gotoInput) gotoInput.max = virtualTotal;

        checkMobile();
        await renderSpreadState(pageNum);
        setTimeout(() => loader.classList.add("hidden"), 500);

        updateControls();
        generateTOC();
        generateVideoList();
        populateVideoSelect();
        populateSectionSelect();

        console.log("🎉 INICIALIZACIÓN COMPLETA");
    } catch (error) {
        console.error("❌ ERROR CRÍTICO:", error);
        alert("❌ ERROR: No se pudo cargar el PDF\nRuta: " + PDF_PATH + "\nError: " + error.message);
        loader.style.display = "none";
    }
}

function checkMobile() {
    isMobile = window.innerWidth <= 768;
}

async function renderSpreadState(currentLeft) {
    if (isMobile) {
        await renderPage(currentLeft, leftCanvas, leftVideoLayer, leftNumEl);
        rightCanvas.getContext("2d").clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    } else {
        await renderPage(currentLeft,     leftCanvas,  leftVideoLayer,  leftNumEl);
        await renderPage(currentLeft + 1, rightCanvas, rightVideoLayer, rightNumEl);
    }
}

async function flipNext() {
    if (isMobile) return mobileTurnPage(1);
    if (isAnimating || pageNum + 2 > virtualTotal + 1) return;

    isAnimating = true;
    stopAllVideos();

    await renderPage(pageNum + 1, flipFrontCanvas,    flipFrontVideoLayer, flipFrontNumEl);
    await renderPage(pageNum + 2, flipBackCanvas,     flipBackVideoLayer,  flipBackNumEl);
    await renderPage(pageNum + 3, rightCanvas,        rightVideoLayer,     rightNumEl);

    flipper.style.display = "block";
    flipper.classList.add("animating");
    void flipper.offsetWidth;
    flipper.classList.add("flip-next-anim");

    setTimeout(async () => {
        pageNum += 2;
        clearFlipperLayers();
        await renderPage(pageNum, leftCanvas, leftVideoLayer, leftNumEl);
        flipper.classList.remove("animating", "flip-next-anim");
        flipper.style.display = "none";
        isAnimating = false;
        updateControls();
    }, 1200);
}

async function flipPrev() {
    if (isMobile) return mobileTurnPage(-1);
    if (isAnimating || pageNum <= 1) return;

    isAnimating = true;
    stopAllVideos();

    const targetLeft = pageNum - 2;

    await renderPage(pageNum,     flipBackCanvas,  flipBackVideoLayer,  flipBackNumEl);
    await renderPage(pageNum - 1, flipFrontCanvas, flipFrontVideoLayer, flipFrontNumEl);
    await renderPage(targetLeft,  leftCanvas,      leftVideoLayer,      leftNumEl);

    flipper.style.display = "block";
    flipper.classList.add("animating");
    void flipper.offsetWidth;
    flipper.classList.add("flip-prev-anim");

    setTimeout(async () => {
        pageNum -= 2;
        clearFlipperLayers();
        await renderPage(pageNum + 1, rightCanvas, rightVideoLayer, rightNumEl);
        flipper.classList.remove("animating", "flip-prev-anim");
        flipper.style.display = "none";
        isAnimating = false;
        updateControls();
    }, 1200);
}

async function mobileTurnPage(direction) {
    if (isAnimating) return;
    const targetPage = pageNum + direction;
    if (targetPage < 1 || targetPage > virtualTotal) return;
    isAnimating = true;
    stopAllVideos();
    pageNum = targetPage;
    await renderSpreadState(pageNum);
    isAnimating = false;
    updateControls();
}

async function goFirst() {
    if (isAnimating) return;
    stopAllVideos();
    pageNum = 1;
    await renderSpreadState(pageNum);
    updateControls();
}

async function goLast() {
    if (isAnimating) return;
    stopAllVideos();
    pageNum = virtualTotal % 2 === 0 ? virtualTotal - 1 : virtualTotal;
    await renderSpreadState(pageNum);
    updateControls();
}

async function goToPage(target) {
    if (isAnimating) return;
    target = parseInt(target);
    if (isNaN(target) || target < 1 || target > virtualTotal) {
        alert(`Por favor ingresa un número entre 1 y ${virtualTotal}`);
        return;
    }
    if (!isMobile && target % 2 === 0) target--;
    isAnimating = true;
    stopAllVideos();
    pageNum = target;
    await renderSpreadState(pageNum);
    isAnimating = false;
    updateControls();
    const input = document.getElementById("gotoPageInput");
    if (input) { input.value = ""; input.blur(); }
    book.scrollIntoView({ behavior: "smooth", block: "center" });
}

function updateControls() {
    const leftLabel  = getPositionLabel(pageNum);
    const rightLabel = getPositionLabel(pageNum + 1);

    pageIndicator.innerHTML = `<i class="fas fa-book"></i> ${
        isMobile ? leftLabel : `${leftLabel} · ${rightLabel}`
    }`;

    if (isMobile) {
        if (mobilePrev) mobilePrev.disabled = pageNum <= 1;
        if (mobileNext) mobileNext.disabled = pageNum >= virtualTotal;
        if (mobilePageIndicator) mobilePageIndicator.innerText = `${pageNum} / ${virtualTotal}`;
    } else {
        prevBtn.disabled = pageNum <= 1;
        nextBtn.disabled = pageNum + 1 >= virtualTotal;
    }

    if (progressFill) {
        const progress = isMobile
            ? (pageNum / virtualTotal) * 100
            : ((pageNum + 1) / virtualTotal) * 100;
        progressFill.style.width = `${progress}%`;
    }

    document.querySelectorAll(".toc-item").forEach(item => {
        item.classList.toggle("active", parseInt(item.dataset.leftPage, 10) === pageNum);
    });
}

function generateTOC() {
    const toc = document.getElementById("tableOfContents");
    if (!toc) return;
    toc.innerHTML = "";

    for (let pos = 1; pos <= virtualTotal; pos += 2) {
        const leftEntry  = pageMap[pos - 1];
        const rightEntry = pageMap[pos] || null;

        const item = document.createElement("div");
        item.className = "toc-item";
        item.dataset.leftPage = pos;

        const leftLabel = leftEntry.type === "video"
            ? `<i class="fas fa-play-circle"></i> ${leftEntry.config.title}`
            : `Páginas ${leftEntry.pdfPage}`;
        const rightLabel = rightEntry
            ? (rightEntry.type === "video" ? `📹 ${rightEntry.config.title}` : String(rightEntry.pdfPage))
            : "";

        item.innerHTML = `
            <span class="toc-title">${leftLabel}</span>
            <span class="toc-page">${rightLabel}</span>`;
        item.onclick = () => { goToPage(pos); closeSidebar(); };
        toc.appendChild(item);
    }
}

function generateVideoList() {
    const container = document.getElementById("videoPagesList");
    if (!container) return;
    container.innerHTML = "";
    if (videoPagesConfig.length === 0) {
        container.innerHTML = '<p style="padding:0.5rem;color:var(--text-light);font-size:0.9rem;">No hay videos configurados</p>';
        return;
    }
    videoPagesConfig.forEach(v => {
        const vPos = getVideoVPos(v.title);
        if (vPos < 1) return;
        const btn = document.createElement("button");
        btn.innerHTML = `<span>${v.title}</span><i class="fas fa-play-circle"></i>`;
        btn.addEventListener("click", async () => {
            const left = isMobile ? vPos : (vPos % 2 === 0 ? vPos - 1 : vPos);
            await goToPage(left);
            closeSidebar();
        });
        container.appendChild(btn);
    });
}

function populateVideoSelect() {
    if (!videoSelect) return;
    videoSelect.innerHTML = '<option value="">Ir a video...</option>';
    videoPagesConfig.forEach(v => {
        const vPos = getVideoVPos(v.title);
        if (vPos < 1) return;
        const opt = document.createElement("option");
        opt.value       = vPos;
        opt.textContent = v.title;
        videoSelect.appendChild(opt);
    });
}

function populateSectionSelect() {
    if (!sectionSelect) return;
    sectionSelect.innerHTML = '<option value="">Ir a sección...</option>';
    sectionsConfig.forEach(sec => {
        const vPos = pdfPageToVPos(sec.page);
        const opt = document.createElement("option");
        opt.value       = vPos;
        opt.textContent = sec.title;
        sectionSelect.appendChild(opt);
    });
}

if (prevBtn)    prevBtn.addEventListener("click", flipPrev);
if (nextBtn)    nextBtn.addEventListener("click", flipNext);
if (mobilePrev) mobilePrev.addEventListener("click", flipPrev);
if (mobileNext) mobileNext.addEventListener("click", flipNext);

if (videoSelect) {
    videoSelect.addEventListener("change", async () => {
        if (!videoSelect.value) return;
        const pos  = parseInt(videoSelect.value, 10);
        const left = isMobile ? pos : (pos % 2 === 0 ? pos - 1 : pos);
        await goToPage(left);
        videoSelect.value = "";
    });
}

if (sectionSelect) {
    sectionSelect.addEventListener("change", async () => {
        if (!sectionSelect.value) return;
        const pos  = parseInt(sectionSelect.value, 10);
        const left = isMobile ? pos : (pos % 2 === 0 ? pos - 1 : pos);
        await goToPage(left);
        sectionSelect.value = "";
    });
}

document.addEventListener("keydown", e => {
    const gotoInput = document.getElementById("gotoPageInput");
    if (document.activeElement === gotoInput) return;
    if      (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); flipNext(); }
    else if (e.key === "ArrowLeft"  || e.key === "PageUp"  ) { e.preventDefault(); flipPrev(); }
    else if (e.key === "Home")   { e.preventDefault(); goFirst(); }
    else if (e.key === "End")    { e.preventDefault(); goLast();  }
    else if (e.key === "Escape") { closeSidebar(); }
});

const gotoInput = document.getElementById("gotoPageInput");
const gotoBtn   = document.getElementById("gotoPageBtn");

if (gotoBtn) {
    gotoBtn.addEventListener("click", () => {
        if (gotoInput.value) goToPage(gotoInput.value);
    });
}

if (gotoInput) {
    gotoInput.addEventListener("keypress", e => {
        if (e.key === "Enter") { e.preventDefault(); if (gotoInput.value) goToPage(gotoInput.value); }
    });
    gotoInput.addEventListener("focus", () => {
        if (virtualTotal > 0) gotoInput.max = virtualTotal;
    });
}

const toggleMenu      = document.getElementById("toggleMenu");
const closeSidebarBtn = document.getElementById("closeSidebar");
const sidebarOverlay  = document.getElementById("sidebarOverlay");
const sidebar         = document.getElementById("sidebar");

function toggleSidebar() {
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
}

function closeSidebar() {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
}

if (toggleMenu)      toggleMenu.addEventListener("click", toggleSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
if (sidebarOverlay)  sidebarOverlay.addEventListener("click", closeSidebar);

let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;

book.addEventListener("touchstart", e => {
    initialTouches = e.touches.length;
    if (e.touches.length >= 2) {
        isZooming = true;
        touchStartDistance = getDistance(e.touches[0], e.touches[1]);
        return;
    }
    isZooming   = false;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

book.addEventListener("touchmove", e => {
    if (e.touches.length >= 2) isZooming = true;
}, { passive: true });

book.addEventListener("touchend", e => {
    if (isZooming || initialTouches >= 2) {
        setTimeout(() => { isZooming = false; initialTouches = 0; touchStartDistance = 0; }, 300);
        return;
    }
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
        if (diffX > 0) flipNext(); else flipPrev();
    }
    isZooming = false;
    initialTouches = 0;
}, { passive: true });

book.addEventListener("touchcancel", () => {
    isZooming = false; initialTouches = 0; touchStartDistance = 0;
}, { passive: true });

let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const wasMobile = isMobile;
        checkMobile();
        if (wasMobile !== isMobile) renderSpreadState(pageNum);
        if (!isAnimating) renderSpreadState(pageNum);
    }, 300);
});

init();
