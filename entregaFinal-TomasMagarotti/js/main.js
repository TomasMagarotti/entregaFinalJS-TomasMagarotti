class Producto {
    constructor(nombre, precioUnitario) {
        this.nombre = nombre;
        this.precioUnitario = precioUnitario;
        this.cantidad = 0;
    }

    agregarCantidad(cantidad) {
        this.cantidad += cantidad;
    }

    getCostoTotal() {
        return this.cantidad * this.precioUnitario;
    }
}
//Variables globales
let precios = {};
let imagenesProductos = {};
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

//Fetch para obtener datos de productos.json de forma asíncronica
const cargarProductos = async () => {
    try {
        const response = await fetch('./productos.json');
        
        const data = await response.json();
        precios = data.precios;
        imagenesProductos = data.imagenesProductos;

        // Generar tarjetas dinámicas
        const divProductos = document.getElementById('productos');
        divProductos.innerHTML = '';

        Object.keys(precios).forEach((nombreProducto) => {
            const card = document.createElement('div');
            card.className = 'card col-md-4 mb-4';
            card.innerHTML = `
                <img src="${imagenesProductos[nombreProducto]}" class="card-img-top imagen-producto" alt="${nombreProducto}">
                <div class="card-body">
                    <h5 class="card-title">${nombreProducto}</h5>
                    <p class="card-text">$${precios[nombreProducto].toFixed(2)}</p>
                    <input type="number" min="1" value="1" id="cantidad-${nombreProducto}" class="form-control mb-2">
                    <button class="btn btn-primary btn-agregar" data-nombre-producto="${nombreProducto}">Agregar</button>
                </div>
            `;
            divProductos.appendChild(card);
        });

        const botonesAgregar = document.querySelectorAll('.btn-agregar');
        botonesAgregar.forEach((boton) => {
            boton.addEventListener('click', () => {
                const nombreProducto = boton.dataset.nombreProducto;
                agregarAlCarrito(nombreProducto);
            });
        });
    } catch (error) {
        console.error('Error al cargar productos desde JSON:', error);
    } 
};
//Se crea elementos "li" para cada producto del carrito
const actualizarCarritoDOM = () => {
    const listaCarrito = document.getElementById('listaCarrito')
    listaCarrito.innerHTML = '';
    carrito.forEach((producto, index) => {
        const li = document.createElement('li')
        li.className = 'list-group-item'
        li.textContent = `${producto.nombre} - ${producto.cantidad} x $${producto.precioUnitario.toFixed(2)}`;
        listaCarrito.appendChild(li);
    });
};

const actualizarTotalCompra = () => {
    const totalCompra = carrito.reduce((total, producto) => total + producto.getCostoTotal(), 0);
    document.getElementById('totalCompra').textContent = totalCompra.toFixed(2);
};
//Calcular costo total y se actualiza DOM
const agregarAlCarrito = (nombreProducto) => {
    const cantidadInput = document.getElementById(`cantidad-${nombreProducto}`);
    const cantidad = parseInt(cantidadInput.value);

    if (cantidad > 0) {
        let productoEncontrado = carrito.find(p => p.nombre === nombreProducto);
        if (productoEncontrado) {
            productoEncontrado.agregarCantidad(cantidad);
        } else {
            const nuevoProducto = new Producto(nombreProducto, precios[nombreProducto]);
            nuevoProducto.agregarCantidad(cantidad);
            carrito.push(nuevoProducto);
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarritoDOM();
        actualizarTotalCompra();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Por favor, ingrese una cantidad válida.',
        })
    }
};
//Código para manear evento click con sweet alert
document.getElementById('finalizar').addEventListener('click', () => {
    if (carrito.length > 0) {
        Swal.fire({
            icon: 'success',
            title: '¡Compra finalizada con éxito!',
            showConfirmButton: true,
        });

        carrito = [];
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarritoDOM();
        actualizarTotalCompra();
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Su carrito está vacío.',
            showConfirmButton: false,
            timer: 1000
        });
    }
});

// Inicialización
cargarProductos();
actualizarCarritoDOM();
actualizarTotalCompra();
