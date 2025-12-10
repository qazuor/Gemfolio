import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  productId: string;
  productName: string;
  productSlug: string;
  onSuccess?: () => void;
}

export default function ReviewForm({
  productId,
  productName,
  productSlug,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Por favor, selecciona una calificación');
      return;
    }

    if (content.trim().length < 10) {
      setError('La reseña debe tener al menos 10 caracteres');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al enviar la reseña');
      }

      setSuccess(true);
      setRating(0);
      setTitle('');
      setContent('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
        <h3 className="mt-4 text-lg font-semibold text-green-900">¡Gracias por tu reseña!</h3>
        <p className="mt-2 text-green-700">Tu reseña será revisada y publicada pronto.</p>
        <a
          href={`/producto/${productSlug}`}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          Volver al producto
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Info */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">Escribiendo reseña para:</p>
        <p className="font-semibold">{productName}</p>
      </div>

      {/* Rating */}
      <div>
        <span className="block text-sm font-medium mb-2" id="rating-label">
          Tu calificación <span className="text-destructive">*</span>
        </span>
        <fieldset
          className="flex items-center gap-4 border-0 p-0 m-0"
          aria-labelledby="rating-label"
        >
          <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          <span className="text-muted-foreground">
            {rating === 0 && 'Selecciona una calificación'}
            {rating === 1 && 'Muy malo'}
            {rating === 2 && 'Malo'}
            {rating === 3 && 'Regular'}
            {rating === 4 && 'Bueno'}
            {rating === 5 && 'Excelente'}
          </span>
        </fieldset>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="review-title" className="block text-sm font-medium mb-2">
          Título (opcional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resume tu experiencia en pocas palabras"
          maxLength={100}
          className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">{title.length}/100 caracteres</p>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="review-content" className="block text-sm font-medium mb-2">
          Tu reseña <span className="text-destructive">*</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Cuéntanos tu experiencia con este producto. ¿Qué te gustó? ¿Qué podría mejorar?"
          rows={5}
          maxLength={2000}
          className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {content.length}/2000 caracteres (mínimo 10)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between gap-4">
        <a
          href={`/producto/${productSlug}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={submitting || rating === 0 || content.trim().length < 10}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar reseña
            </>
          )}
        </button>
      </div>

      {/* Guidelines */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h4 className="font-medium text-sm mb-2">Consejos para una buena reseña:</h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Describe tu experiencia real con el producto</li>
          <li>Menciona aspectos positivos y áreas de mejora</li>
          <li>Sé específico sobre lo que te gustó o no</li>
          <li>Evita incluir información personal o enlaces</li>
        </ul>
      </div>
    </form>
  );
}
