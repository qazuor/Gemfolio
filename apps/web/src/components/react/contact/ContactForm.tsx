import { CheckCircle, Loader2, Send } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, this would send to an API endpoint
      // const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';
      // await fetch(`${API_BASE}/contact`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitError('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border bg-green-50 p-8 text-center dark:bg-green-950/20">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-bold text-green-700 dark:text-green-300">
          ¡Mensaje enviado!
        </h3>
        <p className="mb-6 text-green-600 dark:text-green-400">
          Gracias por contactarnos. Te responderemos a la brevedad.
        </p>
        <button
          type="button"
          onClick={() => setIsSuccess(false)}
          className="text-sm text-green-700 underline hover:no-underline dark:text-green-300"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Nombre *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors.name ? 'border-destructive' : ''
          }`}
          placeholder="Tu nombre"
        />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors.email ? 'border-destructive' : ''
          }`}
          placeholder="tu@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
          Asunto *
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors.subject ? 'border-destructive' : ''
          }`}
        >
          <option value="">Selecciona un asunto</option>
          <option value="consulta">Consulta general</option>
          <option value="pedido">Consulta sobre un pedido</option>
          <option value="personalizado">Pedido personalizado</option>
          <option value="mayorista">Consulta mayorista</option>
          <option value="otro">Otro</option>
        </select>
        {errors.subject && <p className="mt-1 text-sm text-destructive">{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors.message ? 'border-destructive' : ''
          }`}
          placeholder="¿En qué podemos ayudarte?"
        />
        {errors.message && <p className="mt-1 text-sm text-destructive">{errors.message}</p>}
      </div>

      {submitError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar mensaje
          </>
        )}
      </button>
    </form>
  );
}
