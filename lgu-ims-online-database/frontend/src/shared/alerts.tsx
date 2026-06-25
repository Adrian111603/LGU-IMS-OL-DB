import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, Info, X, XCircle } from 'lucide-react';

type AlertKind = 'success' | 'error' | 'warning' | 'info' | 'question';

type AlertOptions = {
  title: string;
  text?: string;
  kind?: AlertKind;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
};

type AlertState = Required<Omit<AlertOptions, 'text'>> & {
  text?: string;
  resolve: (confirmed: boolean) => void;
};

type ToastState = {
  id: number;
  title: string;
  text?: string;
  kind: AlertKind;
};

type AlertContextValue = {
  alert: (options: AlertOptions) => Promise<boolean>;
  confirm: (options: AlertOptions) => Promise<boolean>;
  toast: (title: string, kind?: AlertKind, text?: string) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  question: HelpCircle
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [activeAlert, setActiveAlert] = useState<AlertState | null>(null);
  const [toastState, setToastState] = useState<ToastState | null>(null);

  const value = useMemo<AlertContextValue>(() => ({
    alert: (options) => new Promise((resolve) => {
      setActiveAlert({
        kind: options.kind ?? 'info',
        title: options.title,
        text: options.text,
        confirmText: options.confirmText ?? 'OK',
        cancelText: options.cancelText ?? 'Cancel',
        showCancel: options.showCancel ?? false,
        resolve
      });
    }),
    confirm: (options) => new Promise((resolve) => {
      setActiveAlert({
        kind: options.kind ?? 'question',
        title: options.title,
        text: options.text,
        confirmText: options.confirmText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        showCancel: true,
        resolve
      });
    }),
    toast: (title, kind = 'success', text) => {
      const id = Date.now();
      setToastState({ id, title, text, kind });
      window.setTimeout(() => {
        setToastState((current) => (current?.id === id ? null : current));
      }, 3200);
    }
  }), []);

  function close(confirmed: boolean) {
    activeAlert?.resolve(confirmed);
    setActiveAlert(null);
  }

  const AlertIcon = activeAlert ? icons[activeAlert.kind] : Info;
  const ToastIcon = toastState ? icons[toastState.kind] : Info;

  return (
    <AlertContext.Provider value={value}>
      {children}
      {activeAlert && (
        <div className="swal-layer" role="dialog" aria-modal="true">
          <section className={`swal-card ${activeAlert.kind}`}>
            <button className="icon-button swal-close" type="button" onClick={() => close(false)} aria-label="Close alert">
              <X size={18} />
            </button>
            <div className="swal-icon"><AlertIcon size={34} /></div>
            <h2>{activeAlert.title}</h2>
            {activeAlert.text && <p>{activeAlert.text}</p>}
            <div className="swal-actions">
              {activeAlert.showCancel && (
                <button className="button ghost" type="button" onClick={() => close(false)}>{activeAlert.cancelText}</button>
              )}
              <button className={`button ${activeAlert.kind === 'error' ? 'danger' : ''}`} type="button" onClick={() => close(true)}>
                {activeAlert.confirmText}
              </button>
            </div>
          </section>
        </div>
      )}
      {toastState && (
        <div className={`toast ${toastState.kind}`}>
          <ToastIcon size={20} />
          <div>
            <strong>{toastState.title}</strong>
            {toastState.text && <span>{toastState.text}</span>}
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlerts must be used inside AlertProvider');
  return context;
}
