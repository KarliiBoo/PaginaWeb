// ============ Utilidades de conjuntos ============
function parseSet(input) {
    // Convierte "1, 2,3, 3" => ["1","2","3"] sin repetidos
    const arr = input
        .split(",")
        .map(x => x.trim())
        .filter(x => x.length > 0);

    return [...new Set(arr)];
}

function union(A, B) {
    return [...new Set([...A, ...B])];
}

function intersect(A, B) {
    return A.filter(x => B.includes(x));
}

function diff(A, B) {
    return A.filter(x => !B.includes(x));
}

function symDiff(A, B) {
    return [...new Set([...diff(A, B), ...diff(B, A)])];
}

function complement(A, U) {
    // Complemento de A respecto al conjunto universal U
    // A' = U - A (elementos en U que no están en A)
    return U.filter(x => !A.includes(x));
}

function formatSet(arr) {
    return `{ ${arr.join(", ")} }`;
}

// ============ Render de MATLAB (texto) ============
function matlabCodeFor(op, A, B) {
    const A_mat = A.map(x => isFinite(Number(x)) ? Number(x) : `'${x}'`).join(" ");
    const B_mat = B.map(x => isFinite(Number(x)) ? Number(x) : `'${x}'`).join(" ");

    // Nota: si usas strings en MATLAB, normalmente sería con arrays/celdas,
    // pero para el proyecto es suficiente mostrar el concepto con números.
    const header = `A = [${A_mat}];\nB = [${B_mat}];\n`;

    switch (op) {
        case "union":
            return header + `U = union(A,B)\n% U = A ∪ B`;
        case "intersect":
            return header + `I = intersect(A,B)\n% I = A ∩ B`;
        case "diffAB":
            return header + `D = setdiff(A,B)\n% D = A - B`;
        case "diffBA":
            return header + `D = setdiff(B,A)\n% D = B - A`;
        case "symDiff":
            return header + `SD = union(setdiff(A,B), setdiff(B,A))\n% SD = A △ B (Diferencia Simétrica)`;
        case "complementA":
            const A_complement = A.map(x => isFinite(Number(x)) ? Number(x) : `'${x}'`).join(" ");
            return header + `Ac = setdiff(U,A)\n% Ac = A' (Complemento de A respecto a U)`;
        default:
            return "—";
    }
}

// ============ Generador de Diagramas de Venn SVG ============
function createVennDiagram(A, B, operation) {
    const svg = document.getElementById("vennSVG");
    svg.innerHTML = ""; // Limpiar SVG anterior
    
    const width = 250;
    const height = 250;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 70;
    
    // Calcular elementos en cada región
    const intersection = intersect(A, B);
    const onlyA = diff(A, B);
    const onlyB = diff(B, A);
    
    // Fondo
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", width);
    bg.setAttribute("height", height);
    bg.setAttribute("fill", "#FAF3E0");
    svg.appendChild(bg);
    
    // Crear defs para masks
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // ClipPath para A (para usar en intersección)
    const clipA = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    clipA.setAttribute("id", "clipA");
    const circleClipA = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleClipA.setAttribute("cx", centerX - 30);
    circleClipA.setAttribute("cy", centerY);
    circleClipA.setAttribute("r", radius);
    clipA.appendChild(circleClipA);
    defs.appendChild(clipA);
    
    // Mask para A - B (todo A excepto donde está B)
    const maskAMinusB = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    maskAMinusB.setAttribute("id", "maskAMinusB");
    const rectMaskA = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectMaskA.setAttribute("x", 0);
    rectMaskA.setAttribute("y", 0);
    rectMaskA.setAttribute("width", width);
    rectMaskA.setAttribute("height", height);
    rectMaskA.setAttribute("fill", "white");
    maskAMinusB.appendChild(rectMaskA);
    const circleMaskB1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleMaskB1.setAttribute("cx", centerX + 30);
    circleMaskB1.setAttribute("cy", centerY);
    circleMaskB1.setAttribute("r", radius);
    circleMaskB1.setAttribute("fill", "black");
    maskAMinusB.appendChild(circleMaskB1);
    defs.appendChild(maskAMinusB);
    
    // Mask para B - A (todo B excepto donde está A)
    const maskBMinusA = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    maskBMinusA.setAttribute("id", "maskBMinusA");
    const rectMaskB = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectMaskB.setAttribute("x", 0);
    rectMaskB.setAttribute("y", 0);
    rectMaskB.setAttribute("width", width);
    rectMaskB.setAttribute("height", height);
    rectMaskB.setAttribute("fill", "white");
    maskBMinusA.appendChild(rectMaskB);
    const circleMaskA1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleMaskA1.setAttribute("cx", centerX - 30);
    circleMaskA1.setAttribute("cy", centerY);
    circleMaskA1.setAttribute("r", radius);
    circleMaskA1.setAttribute("fill", "black");
    maskBMinusA.appendChild(circleMaskA1);
    defs.appendChild(maskBMinusA);
    
    svg.appendChild(defs);
    
    // Crear círculos coloreados según la operación
    if (operation === "union") {
        // Unión: colorear ambos círculos completos
        const circleA = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleA.setAttribute("cx", centerX - 30);
        circleA.setAttribute("cy", centerY);
        circleA.setAttribute("r", radius);
        circleA.setAttribute("class", "union");
        svg.appendChild(circleA);
        
        const circleB = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleB.setAttribute("cx", centerX + 30);
        circleB.setAttribute("cy", centerY);
        circleB.setAttribute("r", radius);
        circleB.setAttribute("class", "union");
        svg.appendChild(circleB);
    } 
    else if (operation === "intersect") {
        // Intersección: colorear solo donde se solapan (B clipeado a A)
        const circleInter = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleInter.setAttribute("cx", centerX + 30);
        circleInter.setAttribute("cy", centerY);
        circleInter.setAttribute("r", radius);
        circleInter.setAttribute("class", "inter");
        circleInter.setAttribute("clip-path", "url(#clipA)");
        svg.appendChild(circleInter);
    }
    else if (operation === "diffAB") {
        // Diferencia A - B: colorear solo A sin B
        const circleA = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleA.setAttribute("cx", centerX - 30);
        circleA.setAttribute("cy", centerY);
        circleA.setAttribute("r", radius);
        circleA.setAttribute("class", "diffA");
        circleA.setAttribute("mask", "url(#maskAMinusB)");
        svg.appendChild(circleA);
    }
    else if (operation === "diffBA") {
        // Diferencia B - A: colorear solo B sin A
        const circleB = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleB.setAttribute("cx", centerX + 30);
        circleB.setAttribute("cy", centerY);
        circleB.setAttribute("r", radius);
        circleB.setAttribute("class", "diffB");
        circleB.setAttribute("mask", "url(#maskBMinusA)");
        svg.appendChild(circleB);
    }
    else if (operation === "symDiff") {
        // Diferencia Simétrica: colorear A - B y B - A (sin intersección)
        const circleA = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleA.setAttribute("cx", centerX - 30);
        circleA.setAttribute("cy", centerY);
        circleA.setAttribute("r", radius);
        circleA.setAttribute("class", "sym");
        circleA.setAttribute("mask", "url(#maskAMinusB)");
        svg.appendChild(circleA);
        
        const circleB = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleB.setAttribute("cx", centerX + 30);
        circleB.setAttribute("cy", centerY);
        circleB.setAttribute("r", radius);
        circleB.setAttribute("class", "sym");
        circleB.setAttribute("mask", "url(#maskBMinusA)");
        svg.appendChild(circleB);
    }
    else if (operation === "complementA") {
        // Complemento: colorear todo excepto A
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", 0);
        rect.setAttribute("y", 0);
        rect.setAttribute("width", width);
        rect.setAttribute("height", height);
        rect.setAttribute("class", "set-B");
        svg.appendChild(rect);
        
        // Crear un "agujero" en A usando un círculo blanco
        const hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        hole.setAttribute("cx", centerX - 30);
        hole.setAttribute("cy", centerY);
        hole.setAttribute("r", radius);
        hole.setAttribute("fill", "#FAF3E0");
        svg.appendChild(hole);
    }
    
    // Agregar contornos para que sean visibles
    const outlineA = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    outlineA.setAttribute("cx", centerX - 30);
    outlineA.setAttribute("cy", centerY);
    outlineA.setAttribute("r", radius);
    outlineA.setAttribute("class", "stroke");
    svg.appendChild(outlineA);
    
    const outlineB = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    outlineB.setAttribute("cx", centerX + 30);
    outlineB.setAttribute("cy", centerY);
    outlineB.setAttribute("r", radius);
    outlineB.setAttribute("class", "stroke");
    svg.appendChild(outlineB);
    
    // Función para distribuir texto alrededor de un círculo
    function addTextAroundCircle(cx, cy, items, isLeftSide) {
        if (items.length === 0) return;
        
        const itemStr = items.slice(0, 3).join(",");
        
        if (isLeftSide) {
            // Para A: distribuir a la izquierda, evitando la intersección (derecha)
            const positions = [
                { x: cx - 45, y: cy - 25 },
                { x: cx - 50, y: cy },
                { x: cx - 45, y: cy + 25 }
            ];
            
            positions.forEach((pos, idx) => {
                if (idx < items.length) {
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute("x", pos.x);
                    text.setAttribute("y", pos.y);
                    text.setAttribute("text-anchor", "middle");
                    text.setAttribute("dy", "0.3em");
                    text.setAttribute("font-size", "10");
                    text.setAttribute("font-weight", "bold");
                    text.setAttribute("fill", "#5A3E2B");
                    text.textContent = items[idx];
                    svg.appendChild(text);
                }
            });
        } else {
            // Para B: distribuir a la derecha, evitando la intersección (izquierda)
            const positions = [
                { x: cx + 45, y: cy - 25 },
                { x: cx + 50, y: cy },
                { x: cx + 45, y: cy + 25 }
            ];
            
            positions.forEach((pos, idx) => {
                if (idx < items.length) {
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute("x", pos.x);
                    text.setAttribute("y", pos.y);
                    text.setAttribute("text-anchor", "middle");
                    text.setAttribute("dy", "0.3em");
                    text.setAttribute("font-size", "10");
                    text.setAttribute("font-weight", "bold");
                    text.setAttribute("fill", "#5A3E2B");
                    text.textContent = items[idx];
                    svg.appendChild(text);
                }
            });
        }
    }
    
    // Agregar texto - Elementos solo en A (distribuidos en el lado izquierdo)
    addTextAroundCircle(centerX - 30, centerY, onlyA, true);
    
    // Agregar texto - Elementos solo en B (distribuidos en el lado derecho)
    addTextAroundCircle(centerX + 30, centerY, onlyB, false);
    
    // Texto - Intersección (distribuidos en el centro)
    if (intersection.length > 0) {
        // Posiciones para distribuir los números de la intersección
        const interPositions = [
            { x: centerX - 10, y: centerY - 8 },
            { x: centerX + 10, y: centerY - 8 },
            { x: centerX, y: centerY + 12 }
        ];
        
        intersection.slice(0, 3).forEach((item, idx) => {
            const textInt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textInt.setAttribute("x", interPositions[idx].x);
            textInt.setAttribute("y", interPositions[idx].y);
            textInt.setAttribute("text-anchor", "middle");
            textInt.setAttribute("dy", "0.3em");
            textInt.setAttribute("font-size", "10");
            textInt.setAttribute("font-weight", "bold");
            textInt.setAttribute("fill", "#5A3E2B");
            textInt.textContent = item;
            svg.appendChild(textInt);
        });
    }
    
    // Etiquetas A y B
    const labelA = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelA.setAttribute("x", centerX - 50);
    labelA.setAttribute("y", 18);
    labelA.setAttribute("font-size", "14");
    labelA.setAttribute("font-weight", "bold");
    labelA.setAttribute("fill", "#6D4C41");
    labelA.textContent = "A";
    svg.appendChild(labelA);
    
    const labelB = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelB.setAttribute("x", centerX + 50);
    labelB.setAttribute("y", 18);
    labelB.setAttribute("font-size", "14");
    labelB.setAttribute("font-weight", "bold");
    labelB.setAttribute("fill", "#6D4C41");
    labelB.textContent = "B";
    svg.appendChild(labelB);
    
    // Título con la operación
    const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
    title.setAttribute("x", centerX);
    title.setAttribute("y", 235);
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("font-size", "12");
    title.setAttribute("font-weight", "bold");
    title.setAttribute("fill", "#6D4C41");
    
    switch(operation) {
        case "union":
            title.textContent = "A ∪ B";
            break;
        case "intersect":
            title.textContent = "A ∩ B";
            break;
        case "diffAB":
            title.textContent = "A − B";
            break;
        case "diffBA":
            title.textContent = "B − A";
            break;
        case "symDiff":
            title.textContent = "A Δ B";
            break;
        case "complementA":
            title.textContent = "A'";
            break;
    }
    
    svg.appendChild(title);
}

// ============ Interacción de operaciones ============
const setAEl = document.getElementById("setA");
const setBEl = document.getElementById("setB");
const resultEl = document.getElementById("result");
const matlabEl = document.getElementById("matlabCode");

document.querySelectorAll("button[data-op]").forEach(btn => {
    btn.addEventListener("click", () => {
        const A = parseSet(setAEl.value);
        const B = parseSet(setBEl.value);

        const op = btn.dataset.op;
        let res = [];

        if (op === "union") res = union(A, B);
        if (op === "intersect") res = intersect(A, B);
        if (op === "diffAB") res = diff(A, B);
        if (op === "diffBA") res = diff(B, A);
        if (op === "symDiff") res = symDiff(A, B);
        if (op === "complementA") {
            // El conjunto universal U es la unión de A y B
            const U = union(A, B);
            res = complement(A, U);
        }

        resultEl.textContent = formatSet(res);
        matlabEl.textContent = matlabCodeFor(op, A, B);
        createVennDiagram(A, B, op);
    });
});

// ============ QUIZ (10 preguntas) ============
const quizData = [
    {
        q: "¿Qué describe mejor a un conjunto?",
        options: [
            "Una lista ordenada con repetición",
            "Una colección de elementos sin repetición (el orden no importa)",
            "Una tabla de valores",
            "Un número con decimales"
        ],
        correct: 1,
        why: "Un conjunto es una colección de elementos donde el orden no importa y no se repiten."
    },
    {
        q: "Si A = {1,2,3} y B = {3,4}, entonces A ∪ B es:",
        options: ["{1,2,3,4}", "{3}", "{1,2}", "{1,2,3}"],
        correct: 0,
        why: "La unión reúne todos los elementos de A y B sin repetir."
    },
    {
        q: "Si A = {1,2,3} y B = {3,4}, entonces A ∩ B es:",
        options: ["{1,2,4}", "{3}", "{1,2,3,4}", "∅"],
        correct: 1,
        why: "La intersección contiene solo los elementos comunes: 3."
    },
    {
        q: "Si A = {1,2,3} y B = {3,4}, entonces A − B es:",
        options: ["{4}", "{1,2}", "{3}", "{1,2,3,4}"],
        correct: 1,
        why: "A − B son los elementos que están en A y no están en B."
    },
    {
        q: "¿Cuál es el resultado de intersect([1 2 3],[2 3 5]) en MATLAB?",
        options: ["[1 5]", "[2 3]", "[1 2 3 5]", "[]"],
        correct: 1,
        why: "intersect devuelve los elementos comunes: 2 y 3."
    },
    {
        q: "¿Qué hace union(A,B) en MATLAB?",
        options: [
            "Devuelve elementos comunes",
            "Devuelve todos los elementos sin repetir",
            "Elimina todos los elementos de A",
            "Ordena B de mayor a menor"
        ],
        correct: 1,
        why: "union une ambos conjuntos sin repetir elementos."
    },
    {
        q: "El conjunto vacío se representa como:",
        options: ["{ } o ∅", "{0}", "[] siempre", "{null}"],
        correct: 0,
        why: "El conjunto vacío es ∅ o { } (no tiene elementos)."
    },
    {
        q: "Si A ⊆ B significa:",
        options: [
            "A es igual a B",
            "A es subconjunto de B",
            "A y B no tienen elementos comunes",
            "B es subconjunto de A"
        ],
        correct: 1,
        why: "A ⊆ B significa que todo elemento de A también está en B."
    },
    {
        q: "En conjuntos, el orden de los elementos:",
        options: [
            "Siempre cambia el significado",
            "No afecta al conjunto",
            "Solo importa si son números",
            "Depende del símbolo ∪"
        ],
        correct: 1,
        why: "En conjuntos el orden no importa: {1,2} = {2,1}."
    },
    {
        q: "setdiff(A,B) en MATLAB devuelve:",
        options: [
            "A ∩ B",
            "A ∪ B",
            "A − B",
            "B − A siempre"
        ],
        correct: 2,
        why: "setdiff(A,B) devuelve los elementos de A que no están en B."
    },
];

const quizForm = document.getElementById("quizForm");
const summaryEl = document.getElementById("quizSummary");
const btnReview = document.getElementById("btnReview");
const btnReset = document.getElementById("btnReset");
const btnsContainer = document.getElementById("quizButtons");
const quizContainer = document.getElementById("quizContainer");
const quizTitle = document.getElementById("quizTitle"); 
const quizIntro = document.getElementById("quizIntro"); 
const quizSection = document.getElementById("quizSection");

// Array para mantener las preguntas en orden aleatorio
let shuffledQuizData = [];

// Función para barajar un array (Fisher-Yates shuffle)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function renderQuiz() {
    quizForm.innerHTML = "";
    shuffledQuizData.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = "q";
        div.innerHTML = `
      <h4>${item.q}
        <span class="matlabBadge" data-badge="matlab">
          MATLAB
          <span class="bubble">
            En esta pregunta se relaciona teoría con funciones MATLAB (union/intersect/setdiff).
          </span>
        </span>
      </h4>
      <div class="opts">
        ${item.options.map((opt, i) => `
          <label class="opt">
            <input type="radio" name="q${idx}" value="${i}">
            <span>${opt}</span>
          </label>
        `).join("")}
      </div>
      <div class="feedback hidden" id="fb${idx}"></div>
    `;
        quizForm.appendChild(div);
    });
}

function reviewQuiz() {
    let score = 0;

    shuffledQuizData.forEach((item, idx) => {
        const chosen = quizForm.querySelector(`input[name="q${idx}"]:checked`);
        const fb = document.getElementById(`fb${idx}`);
        fb.classList.remove("hidden", "good", "bad");

        if (!chosen) {
            fb.classList.add("bad");
            fb.textContent = `No respondiste esta pregunta. Correcta: "${item.options[item.correct]}". ${item.why}`;
            return;
        }

        const val = Number(chosen.value);
        if (val === item.correct) {
            score++;
            fb.classList.add("good");
            fb.textContent = `✅ Correcto. ${item.why}`;
        } else {
            fb.classList.add("bad");
            fb.textContent = `❌ Incorrecto. Correcta: "${item.options[item.correct]}". ${item.why}`;
        }
    });

    summaryEl.classList.remove("hidden");
    summaryEl.innerHTML = `
    <h3>Resultado final</h3>
    <p><b>Puntaje:</b> ${score} / ${quizData.length}</p>
    <p>${score === 10 ? "¡Perfecto!" : "Revisa el feedback para mejorar."}</p>
  `;

    // baja al resumen
    summaryEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetQuiz() {
    // Barajar las preguntas nuevamente
    shuffledQuizData = shuffleArray(quizData);
    
    quizForm.reset();
    shuffledQuizData.forEach((_, idx) => {
        const fb = document.getElementById(`fb${idx}`);
        if (fb) {
            fb.classList.add("hidden");
            fb.classList.remove("good", "bad");
            fb.textContent = "";
        }
    });
    summaryEl.classList.add("hidden");
    summaryEl.innerHTML = "";
    
    // Re-renderizar el quiz con las preguntas barajadas
    renderQuiz();
}

// Inicializar el quiz barajando las preguntas en el primer cargue
shuffledQuizData = shuffleArray(quizData);
renderQuiz();
btnReview.addEventListener("click", reviewQuiz);
btnReset.addEventListener("click", resetQuiz);