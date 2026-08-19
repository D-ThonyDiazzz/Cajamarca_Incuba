import { icon } from "./icons";

export interface LoaderController {
    setProgress(pct: number): void;
    hide(): void;
    showError(message: string): void;
}

export function createLoader(loaderEl: HTMLElement): LoaderController {
    const progressEl = loaderEl.querySelector<HTMLElement>(".loader-progress");

    function setProgress(pct: number): void {
        if (progressEl) progressEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    }

    function hide(): void {
        setTimeout(() => loaderEl.classList.add("hidden"), 300);
    }

    function showError(message: string): void {
        const content = loaderEl.querySelector<HTMLElement>(".loader-content");
        if (content) {
            content.innerHTML = `
                <div class="loader-icon">${icon("exclamation-triangle", "loader-error-icon")}</div>
                <h3>No se pudo cargar el libro</h3>
                <p>Verifica tu conexión e inténtalo de nuevo.</p>
                <p style="font-size:0.75rem;opacity:0.7;margin-top:1rem">${message}</p>`;
        } else {
            loaderEl.style.display = "none";
        }
    }

    return { setProgress, hide, showError };
}
