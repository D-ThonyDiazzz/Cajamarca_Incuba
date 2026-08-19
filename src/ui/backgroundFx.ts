import gsap from "gsap";

/**
 * Ambientación: entrada suave del header + blobs de fondo, deriva orgánica
 * infinita y paralaje sutil con el mouse. Reemplaza el efecto anterior de
 * partículas "burbuja" y blobs que rebotaban en 3 pasos con CSS keyframes.
 *
 * xPercent/yPercent (deriva) y x/y (paralaje) son propiedades de transform
 * distintas para GSAP, así que ambas animaciones conviven en el mismo
 * elemento sin pisarse una a la otra.
 */
export function initBackgroundFx(): void {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector<HTMLElement>(".book-header");
    const blobs = [...document.querySelectorAll<HTMLElement>(".ambient-blob")];
    if (reducedMotion || !header || blobs.length === 0) return;

    gsap.set(blobs, { opacity: 0 });
    gsap.set(header, { opacity: 0, y: -16 });

    gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(blobs, { opacity: 1, duration: 1.6, stagger: 0.2, clearProps: "opacity" })
        .to(header, { opacity: 1, y: 0, duration: 0.7 }, "-=1.3");

    blobs.forEach((blob, i) => {
        gsap.to(blob, {
            xPercent: i % 2 === 0 ? 9 : -8,
            yPercent: i % 2 === 0 ? -7 : 8,
            duration: 26 + i * 5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
        });
    });

    if (window.matchMedia("(pointer: fine)").matches) {
        const setters = blobs.map((blob, i) => ({
            setX: gsap.quickTo(blob, "x", { duration: 1.4, ease: "power3.out" }),
            setY: gsap.quickTo(blob, "y", { duration: 1.4, ease: "power3.out" }),
            factor: i % 2 === 0 ? 1 : -1,
        }));
        window.addEventListener("mousemove", e => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            setters.forEach(({ setX, setY, factor }) => {
                setX(nx * 36 * factor);
                setY(ny * 28 * factor);
            });
        });
    }
}
