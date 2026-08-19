import type { VideoPageConfig } from "../config/videoConfig";
import { icon } from "../ui/icons";

export function setVideoPageOnLayer(layerEl: HTMLElement, config: VideoPageConfig, canvasEl: HTMLCanvasElement | null): void {
    layerEl.innerHTML = "";
    layerEl.className = "video-layer active replace-mode";
    layerEl.style.display = "flex";
    if (canvasEl) canvasEl.style.display = "none";

    const vidContainer = document.createElement("div");
    vidContainer.className = "video-container";

    if (!config.videoId) {
        vidContainer.innerHTML = `
            <div class="video-placeholder">
                <div class="video-placeholder-icon">${icon("play-circle")}</div>
                <div class="video-placeholder-text">${config.title}</div>
                <div class="video-placeholder-subtitle">Video próximamente disponible</div>
            </div>`;
    } else {
        const baseParams = "rel=0&modestbranding=1&color=white&playsinline=1&controls=1&enablejsapi=1";
        const autoplayParam = config.autoplay ? "&autoplay=1" : "";
        vidContainer.innerHTML = `
            <div class="video-header">
                <h3 class="video-main-title">
                    ${icon("store")} ${config.title}
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

export function clearVideoLayer(layerEl: HTMLElement): void {
    layerEl.innerHTML = "";
    layerEl.style.display = "none";
    layerEl.className = "video-layer";
}
