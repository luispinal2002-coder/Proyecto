// ===================================
// 1. CONFIGURACIÓN Y ESTADO DEL JUEGO
// ===================================

let nivelActual = 1;
let puntuacionTotal = 0;
let respuestasCorrectasNivel = 0; 
let respuestaCorrecta = 0; 

// Referencias al DOM (sin cambios)
const nivelDOM = document.getElementById('nivel-actual');
const puntuacionDOM = document.getElementById('puntuacion');
const problemaDOM = document.getElementById('problema-matematico');
const estrellasDOM = document.querySelectorAll('.estrella');
const opcionesDOM = [
    document.getElementById('opcion-1'),
    document.getElementById('opcion-2'),
    document.getElementById('opcion-3')
];
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaFinal = document.getElementById('pantalla-final');
const puntuacionFinalDOM = document.getElementById('puntuacion-final');
const botonReiniciar = document.getElementById('reiniciar-juego');

// Configuración de los 10 niveles (maxP: 1 para avance inmediato)
const configuracionNiveles = {
    1: { op: '+', maxP: 1, min: 1, max: 10 },    // Suma simple
    2: { op: '-', maxP: 1, min: 5, max: 15 },    // Resta simple
    3: { op: ['+', '-'], maxP: 1, min: 10, max: 25 }, // Suma y Resta mixta
    4: { op: '*', maxP: 1, min: 1, max: 10 },    // Multiplicación
    5: { op: '/', maxP: 1, min: 10, max: 50 },    // División
    6: { op: ['+', '-'], maxP: 1, min: 20, max: 99 }, // Suma/Resta con decenas
    7: { op: '*', maxP: 1, min: 10, max: 15 },   // Multiplicación avanzada
    8: { op: '/', maxP: 1, min: 50, max: 150 },   // División avanzada
    9: { op: ['*', '/'], maxP: 1, min: 10, max: 20 }, // Multiplicación y División mixta
    10: { op: ['+', '-', '*', '/'], maxP: 1, min: 1, max: 100 } // TODAS las operaciones
};

// ===================================
// 2. FUNCIONES DE LÓGICA (Sin cambios en el flujo, pero ahora usa maxP=1)
// ===================================

function generarAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarNuevoProblema() {
    const config = configuracionNiveles[nivelActual];
    let num1, num2, operador, problemaTexto, resultado;

    if (!config) {
        mostrarPantallaFinal();
        return;
    }

    if (Array.isArray(config.op)) {
        operador = config.op[Math.floor(Math.random() * config.op.length)];
    } else {
        operador = config.op;
    }

    do {
        num1 = generarAleatorio(config.min, config.max);
        num2 = generarAleatorio(config.min, config.max);
        
        if (operador === '/' && num2 === 0) continue;
        
        if (operador === '-') {
            if (num1 < num2) [num1, num2] = [num2, num1];
        }

        if (operador === '/') {
            // Asegurar que la división sea exacta
            let tempResultado = generarAleatorio(config.min > 1 ? config.min / 2 : 1, config.max / 2);
            num2 = generarAleatorio(2, 10); // Divisor simple
            num1 = tempResultado * num2;
        }

    } while (false);

    switch (operador) {
        case '+': resultado = num1 + num2; break;
        case '-': resultado = num1 - num2; break;
        case '*': resultado = num1 * num2; break;
        case '/': resultado = num1 / num2; break;
    }

    problemaTexto = `${num1} ${operador} ${num2} = ?`;
    respuestaCorrecta = resultado;

    let opciones = new Set();
    opciones.add(resultado);

    while (opciones.size < 3) {
        let incorrecta = generarAleatorio(resultado - 5, resultado + 5);
        if (incorrecta < 0) incorrecta = 0;
        if (!opciones.has(incorrecta)) {
            opciones.add(incorrecta);
        }
    }

    let opcionesArray = Array.from(opciones);
    opcionesArray.sort(() => Math.random() - 0.5);

    problemaDOM.textContent = problemaTexto;
    opcionesDOM.forEach((btn, index) => {
        btn.textContent = opcionesArray[index];
    });
}

function actualizarInterfaz() {
    nivelDOM.textContent = `Nivel ${nivelActual}`;
    puntuacionDOM.textContent = `Puntuación: ${puntuacionTotal}`;

    // La lógica de las estrellas aún funciona, pero solo se encenderá una
    // antes de pasar al siguiente nivel y reiniciarse.
    estrellasDOM.forEach((estrella, index) => {
        if (index < respuestasCorrectasNivel) {
            estrella.classList.add('activa');
        } else {
            estrella.classList.remove('activa');
        }
    });
}

function verificarAvanceNivel() {
    const configActual = configuracionNiveles[nivelActual];

    if (respuestasCorrectasNivel >= configActual.maxP) { // maxP es 1
        
        nivelActual++;
        respuestasCorrectasNivel = 0;

        if (configuracionNiveles[nivelActual]) {
            actualizarInterfaz();
            generarNuevoProblema(); 
        } else {
            mostrarPantallaFinal();
        }
    }
}

function mostrarPantallaFinal() {
    pantallaJuego.classList.add('oculto');
    pantallaFinal.classList.remove('oculto');
    puntuacionFinalDOM.textContent = puntuacionTotal;
}


// ===================================
// 3. MANEJO DE EVENTOS
// ===================================

function manejarRespuesta(event) {
    const respuestaUsuario = parseInt(event.target.textContent);
    const boton = event.target;

    if (respuestaUsuario === respuestaCorrecta) {
        // Respuesta Correcta
        puntuacionTotal += 10; 
        respuestasCorrectasNivel++; // Se convierte en 1

        boton.style.backgroundColor = 'rgba(76, 175, 80, 0.4)'; // Verde
        
        // La actualización de interfaz y el avance se ejecutan después de un pequeño retraso
        setTimeout(() => {
            boton.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; // Resetear color
            actualizarInterfaz();
            verificarAvanceNivel(); // Esto lleva inmediatamente al siguiente nivel
            
            // Si no se mostró la pantalla final, genera un nuevo problema
            if (nivelActual <= Object.keys(configuracionNiveles).length) {
                generarNuevoProblema();
            }
        }, 500);

    } else {
        // Respuesta Incorrecta (permanece en el mismo nivel, penaliza y genera un nuevo problema)
        puntuacionTotal = Math.max(0, puntuacionTotal - 5); 
        
        boton.style.backgroundColor = 'rgba(255, 0, 0, 0.4)'; // Rojo
        setTimeout(() => {
            boton.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            actualizarInterfaz();
            generarNuevoProblema(); // Generar un nuevo problema del mismo nivel
        }, 500);
    }
}

function iniciarJuego() {
    nivelActual = 1;
    puntuacionTotal = 0;
    respuestasCorrectasNivel = 0;
    
    pantallaJuego.classList.remove('oculto');
    pantallaFinal.classList.add('oculto');
    
    opcionesDOM.forEach(btn => {
        btn.removeEventListener('click', manejarRespuesta);
        btn.addEventListener('click', manejarRespuesta);
    });

    actualizarInterfaz();
    generarNuevoProblema();
}

botonReiniciar.addEventListener('click', iniciarJuego);
window.onload = iniciarJuego;