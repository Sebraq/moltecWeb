import React, { useState, useRef } from "react";
import "./contacto.css";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import contactoApi from "../services/contactoApi"; // Importar la API corregida

export default function ContactForm() {
  const form = useRef();
  const [enviando, setEnviando] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});

  // 📧 CONFIGURACIÓN DE EMAILJS - VERIFICAR ESTOS VALORES
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_nl2do29", // ✅ Verificar en tu panel de EmailJS
    TEMPLATE_ID: "template_d81nl7p", // ✅ Verificar que el template existe
    PUBLIC_KEY: "Gx1a5Q7I6u6KGwWTj", // ✅ Verificar tu Public Key
  };

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  //   setErroresValidacion({});
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si es el campo teléfono, solo permitir números y máximo 8 dígitos
    if (name === "telefono") {
      const numericValue = value.replace(/\D/g, ""); // Remueve todo lo que no sea número
      if (numericValue.length <= 8) {
        setFormData({ ...formData, [name]: numericValue });
      }
      // Si ya tiene 8 dígitos, no hace nada (no actualiza el estado)
    } else {
      // Para todos los demás campos, comportamiento normal
      setFormData({ ...formData, [name]: value });
    }

    setErroresValidacion({});
  };

  // 🔍 VALIDACIÓN MEJORADA
  const validarFormulario = () => {
    const errores = {};

    // Nombre
    if (!formData.nombre.trim()) {
      errores.nombre = "El campo nombre no puede estar vacío.";
    } else if (formData.nombre.trim().length < 2) {
      errores.nombre = "Nombre muy corto.";
    }

    // Apellido
    if (!formData.apellido.trim()) {
      errores.apellido = "El campo apellido no puede estar vacío.";
    } else if (formData.apellido.trim().length < 2) {
      errores.apellido = "Apellido muy corto.";
    }

    // Email
    if (!formData.email.trim()) {
      errores.email = "El campo email no puede estar vacío.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errores.email = "Email inválido.";
    }

    // Teléfono
    if (!formData.telefono.trim()) {
      errores.telefono = "El campo teléfono no puede estar vacío.";
    } else if (!/^\d+$/.test(formData.telefono)) {
      errores.telefono = "El teléfono debe contener solo números.";
    } else if (formData.telefono.length !== 8) {
      errores.telefono = "El teléfono debe tener exactamente 8 dígitos.";
    }

    // Mensaje
    if (!formData.mensaje.trim()) {
      errores.mensaje = "El campo mensaje no puede estar vacío.";
    } else if (formData.mensaje.trim().length < 10) {
      errores.mensaje = "Mensaje muy corto.";
    }

    return errores;
  };

  // 📧 VERIFICAR CONFIGURACIÓN DE EMAILJS
  const verificarConfiguracion = () => {
    const configuracionFaltante = [];

    if (
      !EMAILJS_CONFIG.SERVICE_ID ||
      EMAILJS_CONFIG.SERVICE_ID.includes("REEMPLAZAR")
    ) {
      configuracionFaltante.push("Service ID");
    }

    if (
      !EMAILJS_CONFIG.TEMPLATE_ID ||
      EMAILJS_CONFIG.TEMPLATE_ID.includes("REEMPLAZAR")
    ) {
      configuracionFaltante.push("Template ID");
    }

    if (
      !EMAILJS_CONFIG.PUBLIC_KEY ||
      EMAILJS_CONFIG.PUBLIC_KEY.includes("REEMPLAZAR")
    ) {
      configuracionFaltante.push("Public Key");
    }

    return configuracionFaltante;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔍 VALIDAR FORMULARIO
    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setErroresValidacion(errores);
      toast.error("Por favor corrige los errores en el formulario", {
        autoClose: 3000,
      });
      return;
    }

    // 📧 VERIFICAR CONFIGURACIÓN
    const configuracionFaltante = verificarConfiguracion();
    if (configuracionFaltante.length > 0) {
      toast.error(
        `Configuración incompleta: ${configuracionFaltante.join(", ")}`,
        {
          autoClose: 5000,
        }
      );
      console.error(
        "❌ Configuración de EmailJS incompleta:",
        configuracionFaltante
      );
      return;
    }

    setEnviando(true);

    try {
      console.log("📧 Iniciando proceso de envío...");

      // 🤫 PASO 1: REGISTRO SILENCIOSO DEL CLIENTE
      try {
        console.log("🤫 Registrando cliente silenciosamente...");
        const registroResult = await contactoApi.registrarClienteDesdeContacto(
          formData
        );

        if (registroResult.existed) {
          console.log("ℹ️ Cliente ya existía en la base de datos");
        } else {
          console.log("✅ Cliente registrado exitosamente en la base de datos");
        }
      } catch (registroError) {
        console.warn(
          "⚠️ Error en registro silencioso, continuando con email...",
          registroError
        );
        // No detener el proceso, continuar con el email
      }

      // 📧 PASO 2: ENVIAR EMAIL CON EMAILJS
      console.log("📧 Enviando email con EmailJS...");
      console.log("Configuración EmailJS:", EMAILJS_CONFIG);

      // Preparar datos para EmailJS
      const templateParams = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        mensaje: formData.mensaje,
      };

      console.log("📧 Datos a enviar:", templateParams);

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

      // Limpiar formulario
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        mensaje: "",
      });

      // Reset form reference
      if (form.current) {
        form.current.reset();
      }
    } catch (error) {
      console.error("❌ Error detallado:", error);

      // 🔍 ANÁLISIS DETALLADO DEL ERROR
      let mensajeError = "Error al enviar el mensaje. ";

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
      setEnviando(false);
    }
  };

  return (
    <section id="contacto">
      <h1 className="section-title">CONTÁCTENOS</h1>

      <form ref={form} onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre*"
          value={formData.nombre}
          onChange={handleChange}
          disabled={enviando}
          required
        />
        {erroresValidacion.nombre && (
          <p style={{ color: "red" }}>{erroresValidacion.nombre}</p>
        )}

        <input
          type="text"
          name="apellido"
          placeholder="Apellido*"
          value={formData.apellido}
          onChange={handleChange}
          disabled={enviando}
          required
        />
        {erroresValidacion.apellido && (
          <p style={{ color: "red" }}>{erroresValidacion.apellido}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email*"
          value={formData.email}
          onChange={handleChange}
          disabled={enviando}
          required
        />
        {erroresValidacion.email && (
          <p style={{ color: "red" }}>{erroresValidacion.email}</p>
        )}

        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono*"
          value={formData.telefono}
          onChange={handleChange}
          disabled={enviando}
          maxLength="8"
          required
        />
        {erroresValidacion.telefono && (
          <p style={{ color: "red" }}>{erroresValidacion.telefono}</p>
        )}

        <textarea
          name="mensaje"
          placeholder="Mensaje*"
          value={formData.mensaje}
          onChange={handleChange}
          disabled={enviando}
          required
        />
        {erroresValidacion.mensaje && (
          <p style={{ color: "red" }}>{erroresValidacion.mensaje}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
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
