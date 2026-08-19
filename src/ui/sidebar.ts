export interface SidebarController {
    toggle(): void;
    close(): void;
}

export function createSidebar(
    sidebarEl: HTMLElement,
    overlayEl: HTMLElement,
    toggleBtn: HTMLElement | null,
    closeBtn: HTMLElement | null,
): SidebarController {
    function toggle(): void {
        sidebarEl.classList.toggle("active");
        overlayEl.classList.toggle("active");
    }

    function close(): void {
        sidebarEl.classList.remove("active");
        overlayEl.classList.remove("active");
    }

    toggleBtn?.addEventListener("click", toggle);
    closeBtn?.addEventListener("click", close);
    overlayEl.addEventListener("click", close);

    return { toggle, close };
}
