export type TocLevel = "titulo" | "subtitulo" | "apartado";

export interface TocEntry {
    title: string;
    page: number;
    level: TocLevel;
}

export interface TocNode extends TocEntry {
    numbering: string;
    children: TocNode[];
}

// Lista plana en orden de aparición en el libro. "Lecciones y propuestas" (p.96)
// se corrige aquí de "apartado" a "titulo": en sectionsConfig.ts se trata como
// sección de nivel superior, y como "apartado" quedaba anidada incorrectamente
// bajo el subtítulo de casos de éxito anterior al construir el árbol.
const tocFlatConfig: TocEntry[] = [
    { title: "Portada",                                                      page: 1,   level: "titulo" },
    { title: "Aliados estratégicos",                                         page: 6,   level: "titulo" },
    { title: "Prólogo",                                                      page: 8,   level: "titulo" },
    { title: "Prólogo",                                                      page: 10,  level: "titulo" },
    { title: "Introducción",                                                 page: 11,  level: "titulo" },
    { title: "Índice",                                                       page: 14,  level: "titulo" },
    { title: "Historia de Cajamarca Incuba",                                 page: 16,  level: "titulo" },
    { title: "Cajamarca, su realidad emprendedora y el inicio del camino",   page: 19,  level: "subtitulo" },
    { title: "El Nacimiento de Cajamarca Incuba",                            page: 21,  level: "subtitulo" },
    { title: "Puertas de ingreso",                                           page: 23,  level: "titulo" },
    { title: "Descripción de las cinco puertas de acceso a Cajamarca Incuba", page: 25,  level: "subtitulo" },
    { title: "Puerta 1: Idea de negocio en etapa temprana",                  page: 26,  level: "apartado" },
    { title: "Puerta 2: Negocios validados con prototipo o piloto comercial", page: 27, level: "apartado" },
    { title: "Puerta 3: Empresas en marcha con potencial de escalamiento",   page: 28,  level: "apartado" },
    { title: "Puerta 4: Inversionistas y actores con excedentes de capital", page: 29,  level: "apartado" },
    { title: "Puerta 5: Formación de mentores empresariales",                page: 30,  level: "apartado" },
    { title: "Convocatorias: Un pulso constante con el talento",             page: 32,  level: "subtitulo" },
    { title: "Diagnóstico de los emprendimientos",                          page: 36,  level: "subtitulo" },
    { title: "Diagnóstico actual",                                          page: 41,  level: "titulo" },
    { title: "Situación institucional: Naturaleza y rol de Cajamarca Incuba", page: 42, level: "subtitulo" },
    { title: "Alcance institucional y ámbito de intervención: Nuestra huella en el territorio", page: 43, level: "subtitulo" },
    { title: "Crónica de la innovación en Cajamarca, trayectoria escalonada en hitos", page: 44, level: "subtitulo" },
    { title: "Talento humano que impulsa el desarrollo emprendedor",         page: 47,  level: "subtitulo" },
    { title: "Compromiso en acción",                                        page: 50,  level: "titulo" },
    { title: "Preincubación: Ideación, validación temprana y construcción de modelo de negocio", page: 51, level: "subtitulo" },
    { title: "Incubación: Acompañamiento técnico y empresarial",             page: 53,  level: "subtitulo" },
    { title: "Aceleración: Preparación para inversión y mercado",            page: 53,  level: "subtitulo" },
    { title: "Escalamiento: Vinculación con inversión, mercado y financiamiento", page: 56, level: "subtitulo" },
    { title: "El respaldo de la confianza: Financiamiento y fondo de garantía", page: 56, level: "subtitulo" },
    { title: "Rubros priorizados: Sectores estratégicos definidos por Cajamarca Incuba", page: 58, level: "subtitulo" },
    { title: "Sostenibilidad financiera",                                   page: 60,  level: "titulo" },
    { title: "Sostenibilidad y diversificación institucional",              page: 61,  level: "subtitulo" },
    { title: "Nuestras fuentes de financiamiento: Un esfuerzo compartido",   page: 62,  level: "subtitulo" },
    { title: "Estrategia de diversificación: El equilibrio que nos permite crecer", page: 63, level: "subtitulo" },
    { title: "Desafíos y horizontes: Transformando los retos en oportunidades", page: 64, level: "subtitulo" },
    { title: "Experiencia de emprender",                                    page: 65,  level: "titulo" },
    { title: "Ecoacción",                                                    page: 67,  level: "apartado" },
    { title: "Clara Mía",                                                    page: 68,  level: "apartado" },
    { title: "Carnifer Bioexport",                                           page: 69,  level: "apartado" },
    { title: "Azul Sostenible",                                              page: 70,  level: "apartado" },
    { title: "Concallua",                                                    page: 71,  level: "apartado" },
    { title: "Challwa de Oro",                                               page: 72,  level: "apartado" },
    { title: "Fruturú",                                                      page: 73,  level: "apartado" },
    { title: "Mando",                                                        page: 74,  level: "apartado" },
    { title: "Byte",                                                         page: 75,  level: "apartado" },
    { title: "Reflexiones finales",                                          page: 76,  level: "subtitulo" },
    { title: "Casos de éxito",                                               page: 78,  level: "titulo" },
    { title: "Caso de éxito de ganadores de fondos concursables.",           page: 80,  level: "subtitulo" },
    { title: "Handin",                                                       page: 81,  level: "apartado" },
    { title: "InkLop",                                                       page: 83,  level: "apartado" },
    { title: "Brixan",                                                       page: 85,  level: "apartado" },
    { title: "Guía Pateperro",                                               page: 87,  level: "apartado" },
    { title: "Caso de éxito de emprendedores de UNICA de NEWMONT ALAC.",     page: 89,  level: "subtitulo" },
    { title: "Doña Gallina",                                                 page: 89,  level: "apartado" },
    { title: "Caso de éxito de la Escuela de Emprendedores de Southern Perú.", page: 91, level: "subtitulo" },
    { title: "Cata's Boutique",                                              page: 91,  level: "apartado" },
    { title: "Ecoladrillos CCMA",                                            page: 93,  level: "apartado" },
    { title: "Reflexiones finales",                                          page: 95,  level: "apartado" },
    { title: "Lecciones y propuestas",                                       page: 96,  level: "titulo" },
    { title: "Hallazgos del Proceso: Resultados que Hablan de Compromiso",   page: 97,  level: "subtitulo" },
    { title: "Lecciones aprendidas institucionales",                        page: 98,  level: "subtitulo" },
    { title: "El sello de lo que funciona: Buenas prácticas y factores de éxito", page: 98, level: "subtitulo" },
    { title: "Propuestas de mejora operativas: Hacia una gestión más ágil y efectiva", page: 99, level: "subtitulo" },
    { title: "Propuestas de mejora estratégicas y de sostenibilidad",        page: 99,  level: "subtitulo" },
    { title: "Valor agregado y contribución de Cajamarca Incuba",           page: 101, level: "subtitulo" },
    { title: "Nivel de madurez del modelo de incubación",                   page: 102, level: "subtitulo" },
    { title: "Proyección institucional y recomendaciones finales",          page: 103, level: "subtitulo" },
    { title: "Anexos",                                                       page: 104, level: "titulo" },
];

/**
 * Agrupa la lista plana en un árbol título -> subtítulo -> apartado, siguiendo
 * el orden de aparición: cada apartado cuelga del subtítulo más reciente bajo
 * el título actual (o del título directamente si aún no hubo subtítulo).
 */
export function buildTocTree(entries: TocEntry[] = tocFlatConfig): TocNode[] {
    const roots: TocNode[] = [];
    let currentTitulo: TocNode | null = null;
    let currentSubtitulo: TocNode | null = null;

    for (const entry of entries) {
        const node: TocNode = { ...entry, numbering: "", children: [] };

        if (entry.level === "titulo") {
            node.numbering = String(roots.length + 1);
            roots.push(node);
            currentTitulo = node;
            currentSubtitulo = null;
        } else if (entry.level === "subtitulo") {
            if (currentTitulo) {
                node.numbering = `${currentTitulo.numbering}.${currentTitulo.children.length + 1}`;
                currentTitulo.children.push(node);
            } else {
                // No debería ocurrir (la primera entrada siempre es "titulo"),
                // pero se cubre para que la función siga siendo total.
                node.numbering = String(roots.length + 1);
                roots.push(node);
            }
            currentSubtitulo = node;
        } else {
            const parent = currentSubtitulo ?? currentTitulo;
            if (parent) {
                node.numbering = `${parent.numbering}.${parent.children.length + 1}`;
                parent.children.push(node);
            } else {
                node.numbering = String(roots.length + 1);
                roots.push(node);
            }
        }
    }

    return roots;
}

export const tocTree: TocNode[] = buildTocTree();
