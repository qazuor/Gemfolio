import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Textarea,
} from '@gemfolio/ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Send, User } from 'lucide-react';
import { useState } from 'react';

import { useAddOrderNote } from '@/hooks/use-orders';

interface OrderNotesProps {
  orderId: string;
  customerNotes: string | null;
  adminNotes: string | null;
}

export function OrderNotes({ orderId, customerNotes, adminNotes }: OrderNotesProps) {
  const [newNote, setNewNote] = useState('');
  const addNote = useAddOrderNote();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addNote.mutate(
      { id: orderId, note: newNote.trim() },
      {
        onSuccess: () => {
          setNewNote('');
        },
      }
    );
  };

  // Parse admin notes (they're stored with timestamps)
  const parsedAdminNotes = adminNotes
    ? adminNotes.split('\n\n').map((note) => {
        const match = note.match(/^\[(.+?)\]\s*(.+)$/s);
        if (match) {
          return {
            timestamp: match[1],
            content: match[2],
          };
        }
        return { timestamp: null, content: note };
      })
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Notes */}
        {customerNotes && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Notas del cliente</h4>
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{customerNotes}</p>
              </div>
            </div>
          </div>
        )}

        {customerNotes && parsedAdminNotes.length > 0 && <Separator />}

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

        {!customerNotes && parsedAdminNotes.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay notas para este pedido</p>
        )}

        <Separator />

        {/* Add Note Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
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
  );
}
