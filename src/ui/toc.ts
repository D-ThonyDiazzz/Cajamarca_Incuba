import { tocTree, type TocNode } from "../config/tocConfig";
import { pdfPageToVPos } from "../core/pageMap";
import { icon } from "./icons";

export interface TocController {
    render(): void;
    highlightActive(currentLeftVpos: number): void;
}

export function createToc(
    container: HTMLElement,
    onNavigate: (vpos: number) => void,
): TocController {
    function renderNode(node: TocNode): HTMLElement {
        const wrapper = document.createElement("div");
        wrapper.className = "toc-node";

        const header = document.createElement("div");
        header.className = `toc-item toc-level-${node.level}`;
        header.dataset.leftPage = String(pdfPageToVPos(node.page));

        const hasChildren = node.children.length > 0;
        if (hasChildren) {
            const toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "toc-toggle";
            toggle.setAttribute("aria-label", "Expandir o colapsar sección");
            toggle.innerHTML = icon("chevron-right");
            toggle.addEventListener("click", e => {
                e.stopPropagation();
                wrapper.classList.toggle("expanded");
            });
            header.appendChild(toggle);
        } else {
            const spacer = document.createElement("span");
            spacer.className = "toc-toggle-spacer";
            header.appendChild(spacer);
        }

        const numbering = document.createElement("span");
        numbering.className = "toc-numbering";
        numbering.textContent = node.numbering;
        header.appendChild(numbering);

        const title = document.createElement("span");
        title.className = "toc-title";
        title.textContent = node.title;
        header.appendChild(title);

        const page = document.createElement("span");
        page.className = "toc-page";
        page.textContent = `Pág. ${node.page}`;
        header.appendChild(page);

        header.addEventListener("click", () => {
            onNavigate(Number(header.dataset.leftPage));
        });

        wrapper.appendChild(header);

        if (hasChildren) {
            const childrenEl = document.createElement("div");
            childrenEl.className = "toc-children";
            node.children.forEach(child => childrenEl.appendChild(renderNode(child)));
            wrapper.appendChild(childrenEl);
        }

        return wrapper;
    }

    function render(): void {
        container.innerHTML = "";
        tocTree.forEach(node => container.appendChild(renderNode(node)));
    }

    function highlightActive(currentLeftVpos: number): void {
        container.querySelectorAll<HTMLElement>(".toc-item").forEach(item => {
            item.classList.toggle("active", Number(item.dataset.leftPage) === currentLeftVpos);
        });

        const activeItem = container.querySelector<HTMLElement>(".toc-item.active");
        let node = activeItem?.closest(".toc-node")?.parentElement ?? null;
        while (node && node !== container) {
            if (node.classList.contains("toc-node")) node.classList.add("expanded");
            node = node.parentElement;
        }
    }

    return { render, highlightActive };
}
