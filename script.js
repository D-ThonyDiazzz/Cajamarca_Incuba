// ================================
// CONFIGURACIÓN PDF.JS
// ================================
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const PDF_PATH = "assets/pdfs/LIBRO.pdf";

// ================================
// 🔍 DEBUG CONSOLA - VERIFICACIÓN INICIAL
// ================================
console.log("═══════════════════════════════════════════");
console.log("✅ Script cargado correctamente");
console.log("📁 Ruta del PDF configurada:", PDF_PATH);
console.log("🔧 PDF.js Worker URL:", pdfjsLib.GlobalWorkerOptions.workerSrc);
console.log("🌐 PDF.js versión:", pdfjsLib.version || "No disponible");
console.log("📱 User Agent:", navigator.userAgent);
console.log("🖥️ Ancho de ventana:", window.innerWidth, "px");
console.log("═══════════════════════════════════════════");

// ================================
// CONFIGURACIÓN DE VIDEOS
// ================================
const videoPagesConfig = [
    {
        page: 70,
        videoId: "3ZJay045efg",
        title: "Azul Sostenible",
        autoplay: true,
        replaceContent: true
    }
];

console.log("🎬 Videos configurados:", videoPagesConfig.length);

// ================================
// VARIABLES GLOBALES
// ================================
let pdfDoc = null;
let totalPages = 0;
let pageNum = 1;
let isAnimating = false;
let isMobile = false;

// ================================
// ELEMENTOS DEL DOM
// ================================
const book = document.getElementById("book");
const flipper = document.getElementById("flipper");
const loader = document.getElementById("loader");

// Canvas
const leftCanvas = document.getElementById("leftCanvas");
const rightCanvas = document.getElementById("rightCanvas");
const flipFrontCanvas = document.getElementById("flipFrontCanvas");
const flipBackCanvas = document.getElementById("flipBackCanvas");

// Capas de video
const leftVideoLayer = document.getElementById("leftVideoLayer");
const rightVideoLayer = document.getElementById("rightVideoLayer");
const flipFrontVideoLayer = document.getElementById("flipFrontVideoLayer");
const flipBackVideoLayer = document.getElementById("flipBackVideoLayer");

// Números de página
const leftNumEl = document.getElementById("leftPageNum");
const rightNumEl = document.getElementById("rightPageNum");
const flipFrontNumEl = document.getElementById("flipFrontNum");
const flipBackNumEl = document.getElementById("flipBackNum");

// Botones y controles
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageIndicator = document.getElementById("pageIndicator");
const progressFill = document.getElementById("progressFill");

// Móvil
const mobilePrev = document.getElementById("mobilePrev");
const mobileNext = document.getElementById("mobileNext");
const mobilePageIndicator = document.getElementById("mobilePageIndicator");

// 🔍 DEBUG - Verificar elementos DOM
console.log("═══════════════════════════════════════════");
console.log("🔍 VERIFICACIÓN DE ELEMENTOS DOM:");
console.log("  ✓ book:", book ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ loader:", loader ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ leftCanvas:", leftCanvas ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ rightCanvas:", rightCanvas ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ prevBtn:", prevBtn ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("  ✓ nextBtn:", nextBtn ? "✅ Encontrado" : "❌ NO ENCONTRADO");
console.log("═══════════════════════════════════════════");

// ================================
// FUNCIONES DE VIDEO
// ================================
function getVideoConfigForPage(pageNumber) {
    return videoPagesConfig.find(v => v.page === pageNumber);
}

function setVideoOnLayer(layerEl, pageNumber, canvasEl) {
    layerEl.innerHTML = "";
    layerEl.className = "video-layer";
    layerEl.classList.remove("active", "replace-mode");

    const config = getVideoConfigForPage(pageNumber);

    if (!config) {
        layerEl.style.display = "none";
        if (canvasEl) canvasEl.style.display = "block";
        return;
    }

    console.log("🎬 Cargando video en página", pageNumber, ":", config.title);

    layerEl.style.display = "flex";
    layerEl.classList.add("active");

    if (config.replaceContent) {
        if (canvasEl) canvasEl.style.display = "none";
        layerEl.classList.add("replace-mode");
    } else {
        if (canvasEl) canvasEl.style.display = "block";
    }

    // Badge
    const badge = document.createElement("div");
    badge.className = "video-badge";
    badge.innerHTML = '<i class="fas fa-video"></i> TESTIMONIO';
    layerEl.appendChild(badge);

    // Contenedor principal
    const vidContainer = document.createElement("div");
    vidContainer.className = "video-container";

    if (!config.videoId) {
        vidContainer.innerHTML = `
            <div class="video-placeholder">
                <div class="video-placeholder-icon"><i class="fas fa-play-circle"></i></div>
                <div class="video-placeholder-text">${config.title}</div>
                <div class="video-placeholder-subtitle">Video próximamente disponible</div>
            </div>
        `;
    } else {
        const autoplayParams = config.autoplay ? "&mute=1&autoplay=1" : "";
        vidContainer.innerHTML = `
            <div class="video-header">
                <h3 class="video-main-title">
                    <i class="fas fa-store"></i> ${config.title}
                </h3>
            </div>
            
            <div class="video-responsive">
                <iframe
                    src="https://www.youtube.com/embed/${config.videoId}?rel=0&modestbranding=1&color=white&playsinline=1${autoplayParams}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    loading="lazy"
                    title="${config.title}"
                ></iframe>
            </div>
        `;
    }

    layerEl.appendChild(vidContainer);
}

// ================================
// RENDERIZADO DE PDF
// ================================
async function renderPage(pageNumber, canvas, videoLayer, numEl) {
    const ctx = canvas.getContext("2d");

    if (pageNumber < 1 || pageNumber > totalPages) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (videoLayer) videoLayer.style.display = "none";
        if (numEl) numEl.innerText = "";
        return;
    }

    console.log(`📄 Renderizando página ${pageNumber}`);

    if (numEl) numEl.innerText = pageNumber;
    if (videoLayer) setVideoOnLayer(videoLayer, pageNumber, canvas);

    const config = getVideoConfigForPage(pageNumber);
    if (config && config.replaceContent) return;

    try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        console.log(`✅ Página ${pageNumber} renderizada correctamente`);
    } catch (error) {
        console.error(`❌ Error renderizando página ${pageNumber}:`, error);
    }
}

// ================================
// INICIALIZACIÓN
// ================================
async function init() {
    console.log("═══════════════════════════════════════════");
    console.log("🚀 INICIANDO CARGA DEL PDF...");
    console.log("═══════════════════════════════════════════");

    try {
        console.log("📥 Intentando cargar:", PDF_PATH);
        
        const loadingTask = pdfjsLib.getDocument(PDF_PATH);
        
        console.log("⏳ Esperando respuesta del PDF...");
        
        pdfDoc = await loadingTask.promise;
        
        console.log("✅ PDF CARGADO EXITOSAMENTE");
        
        totalPages = pdfDoc.numPages;
        
        console.log("═══════════════════════════════════════════");
        console.log("📚 INFORMACIÓN DEL LIBRO:");
        console.log("  📖 Total de páginas:", totalPages);
        console.log("  📄 Página actual:", pageNum);
        console.log("═══════════════════════════════════════════");

        const gotoInput = document.getElementById("gotoPageInput");
        if (gotoInput) {
            gotoInput.max = totalPages;
        }

        console.log("📱 Detectando tipo de dispositivo...");
        checkMobile();
        console.log("  Dispositivo:", isMobile ? "📱 MÓVIL" : "🖥️ ESCRITORIO");

        console.log("🎨 Renderizando páginas iniciales...");
        await renderSpreadState(pageNum);

        console.log("✨ Ocultando loader...");
        setTimeout(() => {
            loader.classList.add("hidden");
            console.log("✅ Loader oculto - LIBRO LISTO");
        }, 500);

        updateControls();
        generateTOC();
        generateVideoList();

        console.log("═══════════════════════════════════════════");
        console.log("🎉 INICIALIZACIÓN COMPLETA - LIBRO FUNCIONAL");
        console.log("═══════════════════════════════════════════");

    } catch (error) {
        console.log("═══════════════════════════════════════════");
        console.error("❌ ERROR CRÍTICO AL CARGAR EL PDF:");
        console.error("📁 Ruta intentada:", PDF_PATH);
        console.error("🔴 Tipo de error:", error.name);
        console.error("💬 Mensaje:", error.message);
        console.error("📋 Detalles completos:", error);
        console.log("═══════════════════════════════════════════");
        
        console.log("🔍 POSIBLES SOLUCIONES:");
        console.log("  1. Verifica que la carpeta sea 'assets/pdf/' o 'assets/pdfs/'");
        console.log("  2. Verifica que el archivo se llame exactamente 'LIBRO.pdf'");
        console.log("  3. Verifica que el archivo exista en la ruta correcta");
        console.log("  4. Abre la consola Network (Red) para ver el error HTTP");
        console.log("═══════════════════════════════════════════");
        
        alert("❌ ERROR: No se pudo cargar el PDF\n\n" + 
              "Ruta: " + PDF_PATH + "\n" +
              "Error: " + error.message + "\n\n" +
              "Abre la consola (F12) para más detalles.");
        
        loader.style.display = "none";
    }
}

// ================================
// DETECTAR MÓVIL
// ================================
function checkMobile() {
    isMobile = window.innerWidth <= 768;
}

// ... (resto del código igual)


// ================================
// RENDERIZAR DOBLE PÁGINA
// ================================
async function renderSpreadState(currentLeft) {
    if (isMobile) {
        await renderPage(currentLeft, leftCanvas, leftVideoLayer, leftNumEl);
        const ctx = rightCanvas.getContext("2d");
        ctx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    } else {
        await renderPage(currentLeft, leftCanvas, leftVideoLayer, leftNumEl);
        await renderPage(currentLeft + 1, rightCanvas, rightVideoLayer, rightNumEl);
    }
}

// ================================
// ANIMACIÓN FLIP SIGUIENTE
// ================================
async function flipNext() {
    if (isMobile) return mobileTurnPage(1);
    if (isAnimating || pageNum + 2 > totalPages + 1) return;

    isAnimating = true;

    await renderPage(pageNum + 1, flipFrontCanvas, flipFrontVideoLayer, flipFrontNumEl);
    await renderPage(pageNum + 2, flipBackCanvas, flipBackVideoLayer, flipBackNumEl);
    await renderPage(pageNum + 3, rightCanvas, rightVideoLayer, rightNumEl);

    flipper.style.display = "block";
    flipper.classList.add("animating");
    void flipper.offsetWidth;
    flipper.classList.add("flip-next-anim");

    setTimeout(async () => {
        pageNum += 2;
        await renderPage(pageNum, leftCanvas, leftVideoLayer, leftNumEl);

        flipper.classList.remove("animating", "flip-next-anim");
        flipper.style.display = "none";

        isAnimating = false;
        updateControls();
    }, 1200);
}

// ================================
// ANIMACIÓN FLIP ANTERIOR
// ================================
async function flipPrev() {
    if (isMobile) return mobileTurnPage(-1);
    if (isAnimating || pageNum <= 1) return;

    isAnimating = true;

    const targetLeft = pageNum - 2;

    await renderPage(pageNum, flipBackCanvas, flipBackVideoLayer, flipBackNumEl);
    await renderPage(pageNum - 1, flipFrontCanvas, flipFrontVideoLayer, flipFrontNumEl);
    await renderPage(targetLeft, leftCanvas, leftVideoLayer, leftNumEl);

    flipper.style.display = "block";
    flipper.classList.add("animating");
    void flipper.offsetWidth;
    flipper.classList.add("flip-prev-anim");

    setTimeout(async () => {
        pageNum -= 2;
        await renderPage(pageNum + 1, rightCanvas, rightVideoLayer, rightNumEl);

        flipper.classList.remove("animating", "flip-prev-anim");
        flipper.style.display = "none";

        isAnimating = false;
        updateControls();
    }, 1200);
}

// ================================
// NAVEGACIÓN MÓVIL
// ================================
async function mobileTurnPage(direction) {
    if (isAnimating) return;

    const targetPage = pageNum + direction;

    if (targetPage < 1 || targetPage > totalPages) return;

    isAnimating = true;
    pageNum = targetPage;
    await renderSpreadState(pageNum);
    isAnimating = false;
    updateControls();
}

// ================================
// IR A PRIMERA PÁGINA
// ================================
async function goFirst() {
    if (isAnimating) return;
    pageNum = 1;
    await renderSpreadState(pageNum);
    updateControls();
}

// ================================
// IR A ÚLTIMA PÁGINA
// ================================
async function goLast() {
    if (isAnimating) return;
    const lastLeft = totalPages % 2 === 0 ? totalPages - 1 : totalPages;
    pageNum = lastLeft;
    await renderSpreadState(pageNum);
    updateControls();
}

// ================================
// IR A PÁGINA ESPECÍFICA
// ================================
async function goToPage(target) {
    if (isAnimating) return;

    target = parseInt(target);
    if (isNaN(target) || target < 1 || target > totalPages) {
        alert(`Por favor ingresa un número entre 1 y ${totalPages}`);
        return;
    }

    // Ajustar para vista doble página en escritorio
    if (!isMobile && target % 2 === 0) {
        target--;
    }

    // Cambiar directamente SIN mostrar loader
    isAnimating = true;
    pageNum = target;
    await renderSpreadState(pageNum);
    isAnimating = false;
    updateControls();

    // Limpiar input
    const input = document.getElementById("gotoPageInput");
    if (input) {
        input.value = "";
        input.blur();
    }

    // Scroll suave al libro
    book.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

// ================================
// ACTUALIZAR CONTROLES
// ================================
function updateControls() {
    const lastPage = isMobile ? pageNum : Math.min(pageNum + 1, totalPages);

    pageIndicator.innerHTML = `<i class="fas fa-book"></i> ${
        isMobile
            ? `Página ${pageNum} de ${totalPages}`
            : `Páginas ${pageNum}-${lastPage} de ${totalPages}`
    }`;

    if (isMobile) {
        const canGoPrev = pageNum <= 1;
        const canGoNext = pageNum >= totalPages;

        if (mobilePrev) mobilePrev.disabled = canGoPrev;
        if (mobileNext) mobileNext.disabled = canGoNext;
        if (mobilePageIndicator) {
            mobilePageIndicator.innerText = `${pageNum} / ${totalPages}`;
        }
    } else {
        prevBtn.disabled = pageNum <= 1;
        nextBtn.disabled = pageNum + 1 >= totalPages;
    }

    if (progressFill) {
        const progress = isMobile
            ? (pageNum / totalPages) * 100
            : ((pageNum + 1) / totalPages) * 100;
        progressFill.style.width = `${progress}%`;
    }

    document.querySelectorAll(".toc-item").forEach(item => {
        const lp = parseInt(item.dataset.leftPage, 10);
        if (lp === pageNum) item.classList.add("active");
        else item.classList.remove("active");
    });
}

// ================================
// GENERAR ÍNDICE
// ================================
function generateTOC() {
    const toc = document.getElementById("tableOfContents");
    if (!toc) return;
    toc.innerHTML = "";

    for (let i = 1; i <= totalPages; i += 2) {
        const item = document.createElement("div");
        item.className = "toc-item";
        item.dataset.leftPage = i;
        item.innerHTML = `
            <span class="toc-title">Páginas ${i}-${Math.min(i + 1, totalPages)}</span>
            <span class="toc-page">${i}-${Math.min(i + 1, totalPages)}</span>
        `;
        item.onclick = () => {
            goToPage(i);
            closeSidebar();
        };
        toc.appendChild(item);
    }
}

// ================================
// GENERAR LISTA DE VIDEOS
// ================================
function generateVideoList() {
    const container = document.getElementById("videoPagesList");
    if (!container) return;
    container.innerHTML = "";

    if (videoPagesConfig.length === 0) {
        container.innerHTML = '<p style="padding: 0.5rem; color: var(--text-light); font-size: 0.9rem;">No hay videos configurados</p>';
        return;
    }

    videoPagesConfig.forEach(v => {
        const btn = document.createElement("button");
        btn.innerHTML = `
            <span>Página ${v.page}: ${v.title}</span>
            <i class="fas fa-play-circle"></i>
        `;
        btn.addEventListener("click", async () => {
            const left = v.page % 2 === 0 ? v.page - 1 : v.page;
            await goToPage(left);
            closeSidebar();
        });
        container.appendChild(btn);
    });
}

// ================================
// EVENT LISTENERS
// ================================
if (prevBtn) prevBtn.addEventListener("click", flipPrev);
if (nextBtn) nextBtn.addEventListener("click", flipNext);
if (mobilePrev) mobilePrev.addEventListener("click", flipPrev);
if (mobileNext) mobileNext.addEventListener("click", flipNext);

document.addEventListener("keydown", e => {
    const gotoInput = document.getElementById("gotoPageInput");
    if (document.activeElement === gotoInput) return;

    if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        flipNext();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        flipPrev();
    } else if (e.key === "Home") {
        e.preventDefault();
        goFirst();
    } else if (e.key === "End") {
        e.preventDefault();
        goLast();
    } else if (e.key === "Escape") {
        closeSidebar();
    }
});

const gotoInput = document.getElementById("gotoPageInput");
const gotoBtn = document.getElementById("gotoPageBtn");

if (gotoBtn) {
    gotoBtn.addEventListener("click", () => {
        if (gotoInput.value) goToPage(gotoInput.value);
    });
}

if (gotoInput) {
    gotoInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (gotoInput.value) goToPage(gotoInput.value);
        }
    });

    gotoInput.addEventListener("focus", () => {
        if (totalPages > 0) {
            gotoInput.max = totalPages;
        }
    });
}

// ================================
// SIDEBAR
// ================================
const toggleMenu = document.getElementById("toggleMenu");
const closeSidebarBtn = document.getElementById("closeSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebar = document.getElementById("sidebar");

function toggleSidebar() {
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
}

function closeSidebar() {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
}

if (toggleMenu) toggleMenu.addEventListener("click", toggleSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

// ================================
// GESTOS TÁCTILES
// ================================
let touchStartX = 0;
let touchEndX = 0;

book.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
});

book.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 60) {
        if (diff > 0) flipNext();
        else flipPrev();
    }
});

// ================================
// RESIZE
// ================================
let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const wasMobile = isMobile;
        checkMobile();
        if (wasMobile !== isMobile) {
            renderSpreadState(pageNum);
        }
        if (!isAnimating) renderSpreadState(pageNum);
    }, 300);
});

// ================================
// INICIAR
// ================================
init();
