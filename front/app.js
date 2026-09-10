
const API_URL = "http://localhost:3000/api";

// Elementos del DOM
const inputCliente = document.querySelector("#cliente");
const listadoFunciones = document.querySelector("#listadoFunciones");
const cuerpoCartelera = document.querySelector("#tablaCartelera tbody");
const kpiEntradas = document.querySelector("#kpiEntradas");
const kpiRecaudado = document.querySelector("#kpiRecaudado");
const kpiFunciones = document.querySelector("#kpiFunciones");
const mensaje = document.querySelector("#mensaje");
const btnSecuencial = document.querySelector("#btnSecuencial");
const btnParalelo = document.querySelector("#btnParalelo");
const resultadoLab = document.querySelector("#resultadoLab");

const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

const formatoFuncion = new Intl.DateTimeFormat("es-AR", {
    weekday: "short", day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit"
});


async function cargarInicio() {
    try {
        const respuesta = await fetch(`${API_URL}/inicio`);

        if (!respuesta.ok) {
            throw new Error("Error al cargar la pantalla de inicio");
        }

        const datos = await respuesta.json();

        mostrarResumen(datos.resumen);
        mostrarCartelera(datos.cartelera);
        mostrarFunciones(datos.funciones);

    } catch (error) {
        mostrarMensaje("No se pudo conectar con la API.", "error");
        console.error(error);
    }
}

function mostrarResumen(resumen) {
    kpiEntradas.textContent = resumen.entradasVendidas;
    kpiRecaudado.textContent = formatoPrecio.format(resumen.recaudado);
    kpiFunciones.textContent = resumen.funcionesProximas;
}

function mostrarCartelera(cartelera) {
    cuerpoCartelera.innerHTML = "";

    cartelera.forEach(pelicula => {
        cuerpoCartelera.innerHTML += `
            <tr>
                <td>${pelicula.titulo}</td>
                <td>${pelicula.genero}</td>
                <td class="numero">${pelicula.duracionMin} min</td>
                <td class="numero">${pelicula.funcionesProximas}</td>
            </tr>
        `;
    });
}

function mostrarFunciones(funciones) {
    listadoFunciones.innerHTML = "";

    if (funciones.length === 0) {
        listadoFunciones.innerHTML = '<p class="sin-resultados">No hay funciones programadas.</p>';
        return;
    }

    funciones.forEach(funcion => {
        const agotada = funcion.disponibles <= 0;
        const porcentaje = Math.round((funcion.vendidas / funcion.capacidad) * 100);

        listadoFunciones.innerHTML += `
            <div class="tarjeta ${agotada ? "agotada" : ""}">
                <h3>${funcion.pelicula}</h3>
                <p>Sala ${funcion.sala} · ${formatoFuncion.format(new Date(funcion.fechaHora))} hs</p>
                <p>${formatoPrecio.format(funcion.precio)} por entrada</p>
                <div class="barra">
                    <div class="barra-relleno" style="width: ${porcentaje}%"></div>
                </div>
                <p class="ocupacion">
                    ${funcion.vendidas}/${funcion.capacidad} vendidas
                    ${agotada ? "· <strong>AGOTADA</strong>" : `· ${funcion.disponibles} libres`}
                </p>
                <div class="compra">
                    <input type="number" min="1" value="2" id="cant-${funcion.idFuncion}"
                           aria-label="Cantidad" ${agotada ? "disabled" : ""}>
                    <button data-id="${funcion.idFuncion}" ${agotada ? "disabled" : ""}>
                        ${agotada ? "Agotada" : "Comprar"}
                    </button>
                </div>
            </div>
        `;
    });
}

async function comprar(idFuncion) {
    const cliente = inputCliente.value.trim();
    const cantidad = Number(document.querySelector(`#cant-${idFuncion}`).value);

    if (!cliente) {
        mostrarMensaje("Primero escribí el nombre del cliente.", "error");
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/entradas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idFuncion, cliente, cantidad })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.mensaje);
        }

        mostrarMensaje(`${data.mensaje} — total: ${formatoPrecio.format(data.total)}`, "ok");
        cargarInicio();

    } catch (error) {
        mostrarMensaje(`Error: ${error.message}`, "error");
        console.error(error);
    }
}

listadoFunciones.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-id]");
    if (!boton || boton.disabled) return;
    comprar(Number(boton.dataset.id));
});


async function correrDemo(modo) {
    btnSecuencial.disabled = true;
    btnParalelo.disabled = true;
    resultadoLab.innerHTML += `<div class="medicion ${modo === "secuencial" ? "lenta" : "rapida"}">⏱ Midiendo en ${modo}...</div>`;

    try {
        const respuesta = await fetch(`${API_URL}/demo/${modo}`);
        const data = await respuesta.json();

        // Reemplaza el "midiendo" por el resultado real
        resultadoLab.lastElementChild.textContent =
            `${modo === "secuencial" ? "🐢" : "🐇"} 3 consultas de 1 segundo en ${modo.toUpperCase()}: ${data.milisegundos} ms`;

    } catch (error) {
        resultadoLab.lastElementChild.textContent = "Error al correr la demo.";
        console.error(error);
    } finally {
        btnSecuencial.disabled = false;
        btnParalelo.disabled = false;
    }
}

btnSecuencial.addEventListener("click", () => correrDemo("secuencial"));
btnParalelo.addEventListener("click", () => correrDemo("paralelo"));


function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}


cargarInicio();