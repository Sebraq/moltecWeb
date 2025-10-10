/* ============================================
   COMPONENTE CONTACTO - MOLTEC S.A.
   Formulario de contacto con validación y envío por EmailJS
   ============================================ */

import React, { useState, useRef } from "react";
import "./contacto2.css";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import contactoApi from "../services/contactoApi";

/**
 * Componente ContactForm
 * 
 * Formulario de contacto que:
 * - Valida todos los campos antes de enviar
 * - Registra al cliente silenciosamente en la base de datos
 * - Envía un email usando EmailJS
 * - Muestra notificaciones con react-toastify
 * 
 * @component
 * @returns {JSX.Element} Sección de contacto con formulario
 */
export default function ContactForm() {
  // ============================================
  // REFERENCIAS Y ESTADOS
  // ============================================
  
  // Referencia al formulario para resetear después del envío
  const form = useRef();
  
  // Estado que controla si el formulario está enviando
  const [enviando, setEnviando] = useState(false);
  
  // Estado que almacena los errores de validación por campo
  const [erroresValidacion, setErroresValidacion] = useState({});

  // ============================================
  // CONFIGURACIÓN DE EMAILJS
  // ✅ Verificar estos valores en tu panel de EmailJS
  // ============================================
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_6cyhn8r",    // ID del servicio de email
    TEMPLATE_ID: "template_desk90h",  // ID de la plantilla de email
    PUBLIC_KEY: "eiNZCr2xr_RZJzlWI",  // Clave pública de EmailJS
  };

  // ============================================
  // ESTADO DEL FORMULARIO
  // Almacena los valores de todos los campos
  // ============================================
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  // ============================================
  // FUNCIÓN: Manejar cambios en los campos
  // Se ejecuta cada vez que el usuario escribe en un campo
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // VALIDACIÓN ESPECIAL PARA TELÉFONO
    // Solo permite números y máximo 8 dígitos
    if (name === "telefono") {
      const numericValue = value.replace(/\D/g, ""); // Remueve todo lo que no sea número
      if (numericValue.length <= 8) {
        setFormData({ ...formData, [name]: numericValue });
      }
      // Si ya tiene 8 dígitos, no hace nada (no permite más caracteres)
    } else {
      // Para todos los demás campos, comportamiento normal
      setFormData({ ...formData, [name]: value });
    }

    // Limpia los errores cuando el usuario empieza a escribir
    setErroresValidacion({});
  };

  // ============================================
  // FUNCIÓN: Validar formulario
  // Verifica que todos los campos cumplan los requisitos
  // ============================================
  const validarFormulario = () => {
    const errores = {};

    // VALIDACIÓN: Nombre
    if (!formData.nombre.trim()) {
      errores.nombre = "El campo nombre no puede estar vacío.";
    } else if (formData.nombre.trim().length < 2) {
      errores.nombre = "Nombre muy corto.";
    }

    // VALIDACIÓN: Apellido
    if (!formData.apellido.trim()) {
      errores.apellido = "El campo apellido no puede estar vacío.";
    } else if (formData.apellido.trim().length < 2) {
      errores.apellido = "Apellido muy corto.";
    }

    // VALIDACIÓN: Email
    // Usa expresión regular para verificar formato correcto
    if (!formData.email.trim()) {
      errores.email = "El campo email no puede estar vacío.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errores.email = "Email inválido.";
    }

    // VALIDACIÓN: Teléfono
    // Debe tener exactamente 8 dígitos numéricos
    if (!formData.telefono.trim()) {
      errores.telefono = "El campo teléfono no puede estar vacío.";
    } else if (!/^\d+$/.test(formData.telefono)) {
      errores.telefono = "El teléfono debe contener solo números.";
    } else if (formData.telefono.length !== 8) {
      errores.telefono = "El teléfono debe tener exactamente 8 dígitos.";
    }

    // VALIDACIÓN: Mensaje
    if (!formData.mensaje.trim()) {
      errores.mensaje = "El campo mensaje no puede estar vacío.";
    } else if (formData.mensaje.trim().length < 10) {
      errores.mensaje = "Mensaje muy corto.";
    }

    return errores;
  };

  // ============================================
  // FUNCIÓN: Verificar configuración de EmailJS
  // Asegura que todas las credenciales estén configuradas
  // ============================================
  const verificarConfiguracion = () => {
    const configuracionFaltante = [];

    if (!EMAILJS_CONFIG.SERVICE_ID || EMAILJS_CONFIG.SERVICE_ID.includes("REEMPLAZAR")) {
      configuracionFaltante.push("Service ID");
    }

    if (!EMAILJS_CONFIG.TEMPLATE_ID || EMAILJS_CONFIG.TEMPLATE_ID.includes("REEMPLAZAR")) {
      configuracionFaltante.push("Template ID");
    }

    if (!EMAILJS_CONFIG.PUBLIC_KEY || EMAILJS_CONFIG.PUBLIC_KEY.includes("REEMPLAZAR")) {
      configuracionFaltante.push("Public Key");
    }

    return configuracionFaltante;
  };

  // ============================================
  // FUNCIÓN: Manejar envío del formulario
  // Proceso completo de validación y envío
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // 📝 PASO 1: VALIDAR FORMULARIO
    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setErroresValidacion(errores);
      toast.error("Por favor corrige los errores en el formulario", {
        autoClose: 3000,
      });
      return; // Detiene el envío si hay errores
    }

    // 🔧 PASO 2: VERIFICAR CONFIGURACIÓN DE EMAILJS
    const configuracionFaltante = verificarConfiguracion();
    if (configuracionFaltante.length > 0) {
      toast.error(
        `Configuración incompleta: ${configuracionFaltante.join(", ")}`,
        {
          autoClose: 5000,
        }
      );
      console.error("❌ Configuración de EmailJS incompleta:", configuracionFaltante);
      return;
    }

    // Inicia el estado de envío (deshabilita el formulario)
    setEnviando(true);

    try {
      console.log("📧 Iniciando proceso de envío...");

      // 🤫 PASO 3: REGISTRO SILENCIOSO DEL CLIENTE EN LA BASE DE DATOS
      // Intenta registrar al cliente, pero no detiene el proceso si falla
      try {
        console.log("🤫 Registrando cliente silenciosamente...");
        const registroResult = await contactoApi.registrarClienteDesdeContacto(formData);

        if (registroResult.existed) {
          console.log("ℹ️ Cliente ya existía en la base de datos");
        } else {
          console.log("✅ Cliente registrado exitosamente en la base de datos");
        }
      } catch (registroError) {
        console.warn("⚠️ Error en registro silencioso, continuando con email...", registroError);
        // No detiene el proceso, continúa con el envío del email
      }

      // 📧 PASO 4: ENVIAR EMAIL CON EMAILJS
      console.log("📧 Enviando email con EmailJS...");
      console.log("Configuración EmailJS:", EMAILJS_CONFIG);

      // Preparar datos para la plantilla de EmailJS
      const templateParams = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        mensaje: formData.mensaje,
      };

      console.log("📧 Datos a enviar:", templateParams);

      // Enviar email usando EmailJS
      const emailResult = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log("✅ EmailJS Response:", emailResult);

      // ✅ ÉXITO TOTAL
      toast.success(
        "¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.",
        {
          autoClose: 4000,
          toastId: "success-message",
        }
      );

      // Limpiar todos los campos del formulario
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        mensaje: "",
      });

      // Resetear la referencia del formulario
      if (form.current) {
        form.current.reset();
      }

    } catch (error) {
      console.error("❌ Error detallado:", error);

      // 🔍 ANÁLISIS DETALLADO DEL ERROR
      let mensajeError = "Error al enviar el mensaje. ";

      // Determinar el tipo de error según el código de estado
      if (error.status === 400) {
        mensajeError += "Configuración de EmailJS incorrecta.";
      } else if (error.status === 401) {
        mensajeError += "Credenciales de EmailJS inválidas.";
      } else if (error.status === 402) {
        mensajeError += "Límite de envíos de EmailJS alcanzado.";
      } else if (error.status === 404) {
        mensajeError += "Servicio o template de EmailJS no encontrado.";
      } else if (error.text) {
        mensajeError += `Error: ${error.text}`;
      } else {
        mensajeError += "Por favor intenta de nuevo más tarde.";
      }

      // Mostrar notificación de error
      toast.error(mensajeError, {
        autoClose: 6000,
        toastId: "error-message",
      });

      // Log detallado para debugging
      console.error("Error details:", {
        status: error.status,
        text: error.text,
        name: error.name,
        message: error.message,
      });

    } finally {
      // Siempre se ejecuta al final (éxito o error)
      setEnviando(false); // Reactiva el formulario
    }
  };

  // ============================================
  // RENDERIZADO DEL COMPONENTE
  // ============================================
  return (
    <section id="contacto" className="contacto-section">
      {/* TÍTULO DE LA SECCIÓN */}
      <h1 className="contacto-title">CONTÁCTENOS</h1>

      {/* SALTO DE LÍNEA PARA CENTRADO (igual que en Ubicación y Portafolio) */}
      <br />

      {/* ============================================
          FORMULARIO DE CONTACTO
          ============================================ */}
      <form ref={form} onSubmit={handleSubmit} noValidate className="contacto-form">
        
        {/* CAMPO: NOMBRE */}
        <input
          type="text"
          name="nombre"
          placeholder="Nombre*"
          value={formData.nombre}
          onChange={handleChange}
          disabled={enviando}
          required
          className="contacto-input"
        />
        {erroresValidacion.nombre && (
          <p className="contacto-error-message">{erroresValidacion.nombre}</p>
        )}

        {/* CAMPO: APELLIDO */}
        <input
          type="text"
          name="apellido"
          placeholder="Apellido*"
          value={formData.apellido}
          onChange={handleChange}
          disabled={enviando}
          required
          className="contacto-input"
        />
        {erroresValidacion.apellido && (
          <p className="contacto-error-message">{erroresValidacion.apellido}</p>
        )}

        {/* CAMPO: EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email*"
          value={formData.email}
          onChange={handleChange}
          disabled={enviando}
          required
          className="contacto-input"
        />
        {erroresValidacion.email && (
          <p className="contacto-error-message">{erroresValidacion.email}</p>
        )}

        {/* CAMPO: TELÉFONO (solo números, máximo 8 dígitos) */}
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono*"
          value={formData.telefono}
          onChange={handleChange}
          disabled={enviando}
          maxLength="8"
          required
          className="contacto-input"
        />
        {erroresValidacion.telefono && (
          <p className="contacto-error-message">{erroresValidacion.telefono}</p>
        )}

        {/* CAMPO: MENSAJE */}
        <textarea
          name="mensaje"
          placeholder="Mensaje*"
          value={formData.mensaje}
          onChange={handleChange}
          disabled={enviando}
          required
          className="contacto-textarea"
        />
        {erroresValidacion.mensaje && (
          <p className="contacto-error-message">{erroresValidacion.mensaje}</p>
        )}

        {/* BOTÓN DE ENVÍO */}
        <button
          type="submit"
          disabled={enviando}
          className="contacto-submit-btn"
          style={{
            opacity: enviando ? 0.6 : 1,
            cursor: enviando ? "not-allowed" : "pointer",
          }}
        >
          {enviando ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </section>
  );
}