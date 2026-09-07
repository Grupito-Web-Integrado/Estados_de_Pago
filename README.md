# Servicio de Pagos

Microservicio desarrollado en Spring Boot para gestionar pagos con estados, validación de monto y simulación de webhook de Mercado Pago.

## Funcionalidades

- Crear pagos con un monto válido.
- Consultar todos los pagos.
- Consultar un pago por ID.
- Cambiar el estado del pago: EN_PROCESO, PAGADO o CANCELADO.
- Confirmar o cancelar pagos desde endpoints REST.
- Procesar eventos tipo webhook con estados `approved`, `paid`, `rejected`, `cancelled` y `refunded`.
- Interfaz web simple para probar el flujo visualmente.

## Estados de pago

- EN_PROCESO: pago creado pero aún no confirmado.
- PAGADO: pago aprobado.
- CANCELADO: pago rechazado o cancelado.

## Tecnologías

- Java 20
- Spring Boot 3.2.5
- Spring Web
- Spring Data JPA
- H2 Database
- HTML + CSS + JavaScript

## Ejecutar proyecto

Desde la carpeta del proyecto:

```powershell
cd "C:\Users\david\Downloads\Servicio-Pago-main\Servicio-Pago-main"
.\mvnw.cmd spring-boot:run
```

Luego abre en el navegador:

```text
http://localhost:8080
```

## Endpoints principales

### Crear pago

```powershell
curl -X POST "http://localhost:8080/api/pagos?monto=150"
```

### Listar pagos

```powershell
curl "http://localhost:8080/api/pagos"
```

### Confirmar pago

```powershell
curl -X POST "http://localhost:8080/api/pagos/1/confirmar"
```

### Cancelar pago

```powershell
curl -X POST "http://localhost:8080/api/pagos/1/cancelar"
```

### Webhook de Mercado Pago

```powershell
curl -X POST "http://localhost:8080/api/pagos/1/webhook/mercadopago" ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"approved\"}"
```

## Pruebas

```powershell
.\mvnw.cmd test
```

## Nota

Este proyecto usa una base de datos H2 en memoria, por lo que los datos se reinician cada vez que se inicia la aplicación.

