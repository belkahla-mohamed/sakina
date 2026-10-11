"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/admin/Toast";
import type { ActionState } from "@/app/admin/actions";

/**
 * Surface a Server Action result as a toast.
 *
 * Actions return plain French `error`/`ok` + a `solution` (never a driver
 * message — see `lib/admin-errors.ts`). The ref guard keeps React
 * StrictMode's double-invoked effect from showing the same toast twice, and
 * ignores the unchanged state object `useActionState` hands back on re-render.
 */
export function useActionToast(state: ActionState): void {
  const toast = useToast();
  const last = useRef<unknown>(null);

  useEffect(() => {
    if (!state || state === last.current) return;
    if (!state.error && !state.ok) return;
    last.current = state;

    if (state.error) toast.error(state.error, state.solution);
    else if (state.ok) toast.success(state.ok, state.okSolution);
  }, [state, toast]);
}
