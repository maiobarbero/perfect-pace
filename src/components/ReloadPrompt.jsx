import React, { useState, useEffect } from 'react';

export default function ReloadPrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register the service worker
      navigator.serviceWorker.register('/perfect-pace/sw.js').then((reg) => {
        setRegistration(reg);

        // If there's a waiting worker, we need to refresh
        if (reg.waiting) {
          setNeedRefresh(true);
        }

        // Listen for new workers
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; please refresh.
                  setNeedRefresh(true);
                } else {
                  // Content is cached for offline use.
                  setOfflineReady(true);
                }
              }
            });
          }
        });
      });

      // Reload when the controller changes
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-w-sm animate-slide-up">
      <div className="flex flex-col gap-3">
        <div className="pr-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
            {needRefresh ? 'Update available' : 'Ready for offline use'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {needRefresh
              ? 'A new version of Perfect Pace is available. Update to get the latest features.'
              : 'App is ready to work offline.'}
          </p>
        </div>

        <div className="flex gap-2 justify-end">
            <button
                onClick={close}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
                Dismiss
            </button>
            {needRefresh && (
                <button
                    onClick={updateServiceWorker}
                    className="px-4 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-cyan-500/20"
                >
                    Update
                </button>
            )}
        </div>

        <button
            onClick={close}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
        >
            <span className="material-icons-round text-sm">close</span>
        </button>
      </div>
    </div>
  );
}
