## Preguntas del laboratorio

### 1. ¿Por qué el laboratorio paralelo tarda ~1 segundo y no ~3, si las tres consultas duermen 1 segundo cada una?

Porque las tres consultas se hacen al mismo tiempo usando `Promise.all()`. Entonces no tengo que esperar 1 segundo por cada una, sino aproximadamente 1 segundo en total.

### 2. ¿Por qué la compra de la farmacia (venta → detalle → stock) NO podría usar `Promise.all`?

Porque las operaciones dependen una de la otra y tienen que hacerse en orden. Primero se registra la venta, después el detalle y por último se actualiza el stock. No se pueden hacer todas juntas porque una necesita el resultado de la anterior.

### 3. ¿Qué pasaría si llamaras a `comprar()` sin `await` y sin `catch`, y la base rechazara la compra?

La compra devolvería una Promise rechazada y como no tendría `await` ni `catch` para controlar el error, quedaría sin manejar. Se mostraría un error en la consola y el usuario podría no saber que la compra falló.
