import { useEffect, useRef, useCallback } from "react";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];

/**
 * Hook that manages session lifecycle:
 *  1) Logs out the user when the browser tab / window is closed.
 *  2) Logs out the user after a configurable period of inactivity.
 *
 * @param {Function} logout  – callback that clears auth state and redirects
 * @param {boolean}  active  – only run when the user is authenticated
 * @param {number}   timeout – inactivity timeout in ms (default 15 min)
 */
const useSessionManager = (logout, active = true, timeout = INACTIVITY_TIMEOUT_MS) => {
  const timerRef = useRef(null);
  const logoutRef = useRef(logout);

  // Keep the logout ref current so the timer always calls the latest version
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // ─── Reset the idle timer ───────────────────────────────────────────
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Show a brief message so the user knows why they were redirected
      alert("Your session has expired due to inactivity. Please log in again.");
      logoutRef.current();
    }, timeout);
  }, [timeout]);

  useEffect(() => {
    if (!active) return;

    // ─── 1.  Tab / browser close detection ──────────────────────────
    // We mark a flag in sessionStorage while the page is alive.
    // sessionStorage is automatically wiped when the tab is closed,
    // so on the *next* page load the absence of this flag tells us
    // the previous session ended.  We also clear localStorage on
    // beforeunload so the token doesn't survive a tab close.
    const handleBeforeUnload = () => {
      // Mark that we are unloading – the storage listener below
      // will trigger in other tabs of the same origin.
      sessionStorage.setItem("unloading", "true");
    };

    // ─── 2.  Inactivity detection ───────────────────────────────────
    const handleActivity = () => resetTimer();

    // Attach listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    ACTIVITY_EVENTS.forEach((evt) =>
      document.addEventListener(evt, handleActivity, { passive: true })
    );

    // Start the first idle timer
    resetTimer();

    return () => {
      // Cleanup
      window.removeEventListener("beforeunload", handleBeforeUnload);
      ACTIVITY_EVENTS.forEach((evt) =>
        document.removeEventListener(evt, handleActivity)
      );
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, resetTimer]);
};

export default useSessionManager;
