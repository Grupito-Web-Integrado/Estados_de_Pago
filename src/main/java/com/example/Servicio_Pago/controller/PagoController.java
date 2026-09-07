package com.example.Servicio_Pago.controller;

import com.example.Servicio_Pago.model.EstadoPago;
import com.example.Servicio_Pago.model.Pago;
import com.example.Servicio_Pago.service.PagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    // Lista todos los pagos disponibles en el sistema.
    @GetMapping
    public List<Pago> listarPagos() {
        return pagoService.obtenerTodos();
    }

    // Obtiene un pago por su ID.
    @GetMapping("/{id}")
    public Pago obtenerPago(@PathVariable Long id) {
        return pagoService.obtenerPorId(id);
    }

    // Crea un pago nuevo a partir del monto enviado por el cliente.
    @PostMapping
    public Pago crearPago(@RequestParam Double monto) {
        return pagoService.crearPago(monto);
    }

    // Actualiza manualmente el estado de un pago.
    @PatchMapping("/{id}/estado")
    public Pago actualizarEstado(@PathVariable Long id, @RequestParam EstadoPago estado) {
        return pagoService.actualizarEstado(id, estado);
    }

    // Endpoint para confirmar un pago.
    @PostMapping("/{id}/confirmar")
    public Pago confirmarPago(@PathVariable Long id) {
        return pagoService.confirmarPago(id);
    }

    // Endpoint para cancelar un pago.
    @PostMapping("/{id}/cancelar")
    public Pago cancelarPago(@PathVariable Long id) {
        return pagoService.cancelarPago(id);
    }

    // Recibe un webhook de Mercado Pago y actualiza el estado del pago.
    @PostMapping("/{id}/webhook/mercadopago")
    public ResponseEntity<Pago> webhookMercadoPago(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        Pago pago = pagoService.procesarWebhookMercadoPago(id, status);
        return ResponseEntity.ok(pago);
    }
}