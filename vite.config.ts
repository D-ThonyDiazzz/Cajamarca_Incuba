import { defineConfig } from "vite";

// GitHub Pages sirve este repo en /Cajamarca_Incuba/, no en la raíz del
// dominio, así que Vite necesita saberlo para anteponer el prefijo a todas
// las rutas de assets que genera en el build.
export default defineConfig({
    base: "/Cajamarca_Incuba/",
});
