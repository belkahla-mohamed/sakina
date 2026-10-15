"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { CheckCircle, WarningCircle, WarningOctagon, X } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";

export interface Toast {
  id: number;
  kind: "success" | "error";
  title: string;
  solution?: string;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` paints the confirm button in the primary pink. */
  tone?: "danger" | "default";
}

export interface ToastApi {
  success: (title: string, solution?: string) => void;
  error: (title: string, solution?: string) => void;
  dismiss: (id: number) => void;
  /** Resolves `true` only when the admin explicitly confirms. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FLASH_COOKIE = "sakina_flash";
const LIFETIME = { success: 4500, error: 9000 } as const;

const subscribeNothing = () => () => {};

/** True in the browser, false during SSR/hydration. */
const detectMount = () => true;
const detectNoMount = () => false;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast() must be used inside <ToastProvider>.");
  return ctx;
}

/** Convenience wrapper for the confirmation dialog alone. */
export function useConfirm(): ToastApi["confirm"] {
  return useToast().confirm;
}

/**
 * Confirm-then-submit for destructive forms.
 *
 * `form.requestSubmit()` re-dispatches a native submit event, so a naive
 * "preventDefault, then resubmit once confirmed" handler re-runs itself,
 * cancels the second event too, and the Server Action never fires. The
 * `data-confirmed` marker lets exactly one re-entrant pass fall through
 * to React's form action untouched.
 */
export function confirmSubmit(
  e: FormEvent<HTMLFormElement>,
  confirm: ToastApi["confirm"],
  options: ConfirmOptions
): void {
  const form = e.currentTarget;
  if (form.dataset.confirmed === "1") {
    delete form.dataset.confirmed;
    return;
  }
  e.preventDefault();
  void confirm(options).then((ok) => {
    if (!ok) return;
    form.dataset.confirmed = "1";
    form.requestSubmit();
  });
}

function readFlashCookie(): Omit<Toast, "id"> | null {
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${FLASH_COOKIE}=`))
    ?.slice(FLASH_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Omit<Toast, "id">;
    return typeof parsed?.title === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function clearFlashCookie() {
  document.cookie = `${FLASH_COOKIE}=; Max-Age=0; Path=/`;
}

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPendingState] = useState<PendingConfirm | null>(null);
  const pendingRef = useRef<PendingConfirm | null>(null);
  const mounted = useSyncExternalStore(subscribeNothing, detectMount, detectNoMount);
  const pathname = usePathname();
  const seq = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: Toast["kind"], title: string, solution?: string) => {
      const id = ++seq.current;
      setToasts((prev) => [...prev.slice(-3), { id, kind, title, solution }]);
      timers.current.set(id, setTimeout(() => dismiss(id), LIFETIME[kind]));
    },
    [dismiss]
  );

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        const entry: PendingConfirm = { options, resolve };
        pendingRef.current = entry;
        setPendingState(entry);
      }),
    []
  );

  // Resolve outside the state updater: React may invoke updaters twice in
  // development, and a promise must settle exactly once.
  const settle = useCallback((value: boolean) => {
    const entry = pendingRef.current;
    pendingRef.current = null;
    setPendingState(null);
    entry?.resolve(value);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, solution) => push("success", title, solution),
      error: (title, solution) => push("error", title, solution),
      dismiss,
      confirm,
    }),
    [push, dismiss, confirm]
  );

  // A Server Action that redirects stashes its message in a cookie first.
  // Re-read on every navigation so the toast lands on the destination page.
  useEffect(() => {
    const flash = readFlashCookie();
    if (!flash) return;
    clearFlashCookie();
    push(flash.kind, flash.title, flash.solution);
  }, [pathname, push]);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => {
      for (const timer of pendingTimers.values()) clearTimeout(timer);
      pendingTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <>
            <div
              role="region"
              aria-label="Notifications"
              className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-stretch gap-2.5 sm:inset-x-auto sm:bottom-5 sm:end-5 sm:items-end"
            >
              {toasts.map((toast) => (
                <ToastCard
                  key={toast.id}
                  toast={toast}
                  onDismiss={() => dismiss(toast.id)}
                />
              ))}
            </div>
            {pending && (
              <ConfirmDialog
                key={pending.options.title}
                options={pending.options}
                onResolve={settle}
              />
            )}
          </>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const isError = toast.kind === "error";
  const Icon = isError ? WarningCircle : CheckCircle;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
          className={`pointer-events-auto w-full anim-pop flex items-start gap-3 rounded-[10px] border bg-white px-4 py-3.5 shadow-[0_10px_30px_rgba(21,22,52,0.16)] sm:w-[380px] ${
        isError ? "border-primary" : "border-teal-deep"
      }`}
    >
      <Icon
        size={20}
        weight="fill"
        className={`mt-0.5 shrink-0 ${isError ? "text-primary" : "text-teal-deep"}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold leading-snug">{toast.title}</p>
        {toast.solution && (
          <p className="mt-1 text-[13px] leading-snug text-ink-soft">
            {toast.solution}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="-mt-1 -me-1 shrink-0 p-1 text-ink-soft transition-colors hover:text-ink"
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}

/**
 * In-app replacement for `window.confirm()`.
 *
 * The browser dialog is unstyled and reads as a system error to a shop
 * manager, so this reuses the site's own vocabulary: pill buttons with the
 * 2px ink border and the offset "sticker" shadow, `anim-pop` on entry.
 */
function ConfirmDialog({
  options,
  onResolve,
}: {
  options: ConfirmOptions;
  onResolve: (value: boolean) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { t } = useLang();
  const {
    title,
    message,
    confirmLabel,
    cancelLabel,
    tone = "danger",
  } = options;
  const confirmText = confirmLabel ?? t("admin.dialog.confirm");
  const cancelText = cancelLabel ?? t("admin.form.cancel");

  useEffect(() => {
    cancelRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onResolve(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 anim-fade-in"
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t("admin.dialog.close")}
        onClick={() => onResolve(false)}
        className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-[3px]"
      />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={message ? "confirm-message" : undefined}
          className="anim-pop relative w-full max-w-[420px] rounded-[10px] border border-line bg-white p-6 shadow-[0_2px_4px_rgba(21,22,52,0.08),0_18px_48px_-18px_rgba(21,22,52,0.35)]"
        >
          <span
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white"
          >
            <WarningOctagon size={24} weight="fill" className="text-white" />
          </span>

        <h2
          id="confirm-title"
          className="font-display text-[20px] font-bold leading-tight"
        >
          {title}
        </h2>
        {message && (
          <p id="confirm-message" className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            {message}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onResolve(false)}
            className="btn btn-outline !px-5 !py-2.5 !text-[14px]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => onResolve(true)}
            className={`btn !px-5 !py-2.5 !text-[14px] ${
              tone === "danger" ? "btn-primary" : "btn-secondary"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
