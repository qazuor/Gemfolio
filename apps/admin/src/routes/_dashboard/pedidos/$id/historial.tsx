import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Textarea,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, MessageSquare, Send, User } from 'lucide-react';
import { useState } from 'react';

import { getStatusColor, getStatusLabel, useAddOrderNote, useOrder } from '@/hooks/use-orders';

export const Route = createFileRoute('/_dashboard/pedidos/$id/historial')({
  component: OrderHistorialPage,
});

function OrderHistorialPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);
  const [newNote, setNewNote] = useState('');
  const addNote = useAddOrderNote();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!order) {
    return null;
  }

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addNote.mutate(
      { id: order.id, note: newNote.trim() },
      {
        onSuccess: () => {
          setNewNote('');
        },
      }
    );
  };

  const statusHistory = order.statusHistory || [];

  // Parse admin notes
  const parsedAdminNotes = order.adminNotes
    ? order.adminNotes.split('\n\n').map((note) => {
        const match = note.match(/^\[(.+?)\]\s*(.+)$/s);
        if (match) {
          return { timestamp: match[1], content: match[2] };
        }
        return { timestamp: null, content: note };
      })
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de estados
          </CardTitle>
          <CardDescription>Cambios de estado del pedido</CardDescription>
        </CardHeader>
        <CardContent>
          {statusHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay historial de estados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {statusHistory.map((history, index) => (
                <div key={history.id} className="relative pl-6">
                  {/* Timeline line */}
                  {index < statusHistory.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary" />

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant={getStatusColor(history.status)}>
                        {getStatusLabel(history.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(history.createdAt), "dd MMM yyyy 'a las' HH:mm", {
                          locale: es,
                        })}
                      </span>
                    </div>
                    {history.note && (
                      <p className="text-sm text-muted-foreground">{history.note}</p>
                    )}
                    {history.changedByUser && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {history.changedByUser.name || history.changedByUser.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notas
          </CardTitle>
          <CardDescription>Notas internas y del cliente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Notes */}
          {order.customerNotes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Notas del cliente</h4>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 border border-blue-200 dark:border-blue-900">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 text-blue-600" />
                  <p className="text-sm">{order.customerNotes}</p>
                </div>
              </div>
            </div>
          )}

          {order.customerNotes && parsedAdminNotes.length > 0 && <Separator />}

          {/* Admin Notes */}
          {parsedAdminNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Notas internas</h4>
              <div className="space-y-2">
                {parsedAdminNotes.map((note) => (
                  <div key={note.timestamp ?? note.content} className="rounded-lg border p-3">
                    <p className="text-sm">{note.content}</p>
                    {note.timestamp && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(note.timestamp), "dd MMM yyyy 'a las' HH:mm", {
                          locale: es,
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!order.customerNotes && parsedAdminNotes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay notas para este pedido
            </p>
          )}

          <Separator />

          {/* Add Note Form */}
          <form onSubmit={handleSubmitNote} className="space-y-2">
            <h4 className="text-sm font-medium">Agregar nota interna</h4>
            <Textarea
              placeholder="Escribe una nota interna..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={!newNote.trim() || addNote.isPending}>
                <Send className="mr-2 h-4 w-4" />
                {addNote.isPending ? 'Enviando...' : 'Agregar nota'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
