import React from 'react';
import { X, CheckCheck, Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: number;
  created_at: string;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Central de Notificações</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary transition-colors"
              title="Marcar todas como lidas"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium">Tudo em dia!</p>
              <p className="text-xs mt-1 text-muted-foreground/80">Nenhuma notificação pendente no momento.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border text-sm transition-all ${
                  item.is_read
                    ? 'bg-secondary/20 border-border/60 opacity-75'
                    : 'bg-secondary/60 border-primary/30 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                    {item.type === 'info' && <Info className="w-4 h-4 text-primary shrink-0" />}
                    <h3 className="font-semibold text-xs text-foreground">{item.title}</h3>
                  </div>
                  {!item.is_read && (
                    <button
                      onClick={() => onMarkAsRead(item.id)}
                      className="text-[11px] text-primary hover:underline shrink-0"
                    >
                      Lida
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.message}</p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground/80">
                  <span className="uppercase font-mono tracking-wider">{item.category}</span>
                  <span>{new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
