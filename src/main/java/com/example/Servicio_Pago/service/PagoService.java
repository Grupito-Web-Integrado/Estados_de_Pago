package com.example.Servicio_Pago.service;

import com.example.Servicio_Pago.model.EstadoPago;
import com.example.Servicio_Pago.model.Pago;
import com.example.Servicio_Pago.repository.PagoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;

    public PagoService(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    // Obtiene todos los pagos que existen en la base de datos.
    public List<Pago> obtenerTodos() {
        return pagoRepository.findAll();
    }

    // Busca un pago por su identificador.
    public Pago obtenerPorId(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
    }

    // Crea un pago nuevo con estado inicial EN_PROCESO.
    public Pago crearPago(Double monto) {
        if (monto == null || monto <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a 0");
        }
        Pago pago = new Pago(monto, EstadoPago.EN_PROCESO);
        return pagoRepository.save(pago);
    }

    // Cambia el estado de cualquier pago por el nuevo valor recibido.
    public Pago actualizarEstado(Long id, EstadoPago nuevoEstado) {
        Pago pago = obtenerPorId(id);
        pago.setEstado(nuevoEstado);
        return pagoRepository.save(pago);
    }

    // Confirma un pago y lo deja en estado PAGADO.
    public Pago confirmarPago(Long id) {
        return actualizarEstado(id, EstadoPago.PAGADO);
    }

    // Cancela un pago y lo deja en estado CANCELADO.
    public Pago cancelarPago(Long id) {
        return actualizarEstado(id, EstadoPago.CANCELADO);
    }

    // Procesa la respuesta del webhook de Mercado Pago y actualiza el estado.
    public Pago procesarWebhookMercadoPago(Long id, String status) {
        if (status == null) {
            throw new IllegalArgumentException("El status no puede ser nulo");
        }

        String normalized = status.trim().toLowerCase();
        if ("approved".equals(normalized) || "paid".equals(normalized)) {
            return confirmarPago(id);
        }
        if ("rejected".equals(normalized) || "cancelled".equals(normalized) || "refunded".equals(normalized)) {
            return cancelarPago(id);
        }

        throw new IllegalArgumentException("Status de pago no soportado: " + status);
    }
}
