package com.example.Servicio_Pago;

import com.example.Servicio_Pago.model.EstadoPago;
import com.example.Servicio_Pago.model.Pago;
import com.example.Servicio_Pago.service.PagoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PagoServiceTest {

    @Autowired
    private PagoService pagoService;

    @Test
    void crearPago_iniciaEnEstadoEnProceso() {
        Pago pago = pagoService.crearPago(150.00);

        assertNotNull(pago.getId());
        assertEquals(150.00, pago.getMonto());
        assertEquals(EstadoPago.EN_PROCESO, pago.getEstado());
    }

    @Test
    void confirmarPago_cambiaEstadoAPagado() {
        Pago pago = pagoService.crearPago(200.00);

        Pago actualizado = pagoService.confirmarPago(pago.getId());

        assertEquals(EstadoPago.PAGADO, actualizado.getEstado());
    }

    @Test
    void cancelarPago_cambiaEstadoACancelado() {
        Pago pago = pagoService.crearPago(75.50);

        Pago actualizado = pagoService.cancelarPago(pago.getId());

        assertEquals(EstadoPago.CANCELADO, actualizado.getEstado());
    }

    @Test
    void webhookMercadoPago_approved_actualizaEstadoPagado() {
        Pago pago = pagoService.crearPago(500.00);

        Pago actualizado = pagoService.procesarWebhookMercadoPago(pago.getId(), "approved");

        assertEquals(EstadoPago.PAGADO, actualizado.getEstado());
    }

    @Test
    void webhookMercadoPago_rejected_actualizaEstadoCancelado() {
        Pago pago = pagoService.crearPago(300.00);

        Pago actualizado = pagoService.procesarWebhookMercadoPago(pago.getId(), "rejected");

        assertEquals(EstadoPago.CANCELADO, actualizado.getEstado());
    }
}
