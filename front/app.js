
const API_URL = "http://localhost:3000/api";

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
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
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

    if (!cartelera || cartelera.length === 0) {
        cuerpoCartelera.innerHTML = `
            <tr>
                <td colspan="4">No hay películas en cartelera.</td>
            </tr>
        `;
        return;
    }

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

    if (!funciones || funciones.length === 0) {
        listadoFunciones.innerHTML = `
            <p class="sin-resultados">
                No hay funciones programadas.
            </p>
        `;
        return;
    }

    funciones.forEach(funcion => {
        const agotada = funcion.disponibles <= 0;

        const porcentaje = funcion.capacidad > 0
            ? Math.min(
                100,
                Math.round((funcion.vendidas / funcion.capacidad) * 100)
            )
            : 0;

        listadoFunciones.innerHTML += `
            <div class="tarjeta ${agotada ? "agotada" : ""}">
                
                <div class="cabecera-tarjeta">
                    <h3>${funcion.pelicula}</h3>
                    ${agotada ? '<span class="estado-agotada">AGOTADA</span>' : ''}
                </div>

                <div class="datos-funcion">
                    <p>
                        <strong>Sala ${funcion.sala}</strong>
                    </p>

                    <p>
                        ${formatoFuncion.format(new Date(funcion.fechaHora))}
                    </p>
                </div>

                <p class="precio">
                    ${formatoPrecio.format(funcion.precio)}
                    <span>por entrada</span>
                </p>

                <div class="barra">
                    <div
                        class="barra-relleno"
                        style="width: ${porcentaje}%">
                    </div>
                </div>

                <p class="ocupacion">
                    ${funcion.vendidas}/${funcion.capacidad} entradas vendidas
                    ${agotada
                ? ""
                : ` · ${funcion.disponibles} lugares disponibles`
            }
                </p>

                <div class="compra">
                    <label for="cant-${funcion.idFuncion}">
                        Cantidad
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="${funcion.disponibles}"
                        value="1"
                        id="cant-${funcion.idFuncion}"
                        aria-label="Cantidad de entradas"
                        ${agotada ? "disabled" : ""}
                    >

                    <button
                        data-id="${funcion.idFuncion}"
                        ${agotada ? "disabled" : ""}
                    >
                        ${agotada ? "Agotada" : "Comprar entradas"}
                    </button>
                </div>
            </div>
        `;
    });
}

async function comprar(idFuncion) {
    const cliente = inputCliente.value.trim();
    const campoCantidad = document.querySelector(`#cant-${idFuncion}`);

    if (!cliente) {
        mostrarMensaje(
            "Primero escribí el nombre del cliente.",
            "error"
        );
        inputCliente.focus();
        return;
    }

    if (!campoCantidad) {
        mostrarMensaje(
            "No se pudo obtener la cantidad de entradas.",
            "error"
        );
        return;
    }

    const cantidad = Number(campoCantidad.value);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
        mostrarMensaje(
            "La cantidad debe ser de al menos 1 entrada.",
            "error"
        );
        campoCantidad.focus();
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/entradas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idFuncion,
                cliente,
                cantidad
            })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                data.mensaje || "No se pudo realizar la compra."
            );
        }

        mostrarMensaje(
            `${data.mensaje} — Total: ${formatoPrecio.format(data.total)}`,
            "ok"
        );

        inputCliente.value = "";

        setTimeout(() => {
            mensaje.textContent = "";
            mensaje.className = "mensaje";
        }, 3000);

        await cargarInicio();

    } catch (error) {
        mostrarMensaje(
            `Error: ${error.message}`,
            "error"
        );
        console.error(error);
    }
}

listadoFunciones.addEventListener("click", evento => {
    const boton = evento.target.closest("button[data-id]");

    if (!boton || boton.disabled) {
        return;
    }

    comprar(Number(boton.dataset.id));
});

async function correrDemo(modo) {
    btnSecuencial.disabled = true;
    btnParalelo.disabled = true;

    resultadoLab.innerHTML += `
        <div class="medicion ${modo === "secuencial" ? "lenta" : "rapida"}">
            ⏱ Midiendo en ${modo}...
        </div>
    `;

    const medicion = resultadoLab.lastElementChild;

    try {
        const respuesta = await fetch(`${API_URL}/demo/${modo}`);
        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                data.mensaje || "Error al ejecutar la demo."
            );
        }

        medicion.textContent =
            `${modo === "secuencial" ? "🐢" : "🐇"} ` +
            `3 consultas de 1 segundo en ${modo.toUpperCase()}: ` +
            `${data.milisegundos} ms`;

    } catch (error) {
        medicion.textContent = "Error al correr la demo.";
        console.error(error);

    } finally {
        btnSecuencial.disabled = false;
        btnParalelo.disabled = false;
    }
}

btnSecuencial.addEventListener(
    "click",
    () => correrDemo("secuencial")
);

btnParalelo.addEventListener(
    "click",
    () => correrDemo("paralelo")
);

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}

cargarInicio();
