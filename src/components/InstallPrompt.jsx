import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandaloneMode =
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone ||
        (document.referrer && document.referrer.includes('android-app://'));

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Check if dismissed previously
    const isDismissed = localStorage.getItem('install_prompt_dismissed');
    if (isDismissed) return;

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) ||
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
        // On iOS, we can't programmatically prompt, but we can show the UI
        setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      // Hide the app-provided install promotion
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);

    // Hide the prompt regardless of outcome, as we can't trigger it again
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('install_prompt_dismissed', 'true');
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-w-sm animate-slide-up no-print">
        {/* Close button */}
        <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Dismiss install prompt"
        >
            <span className="material-icons-round text-sm">close</span>
        </button>

        <div className="flex flex-col gap-3 pr-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
                Install Perfect Pace
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                {isIOS
                    ? "Install this app on your home screen for quick and easy access."
                    : "Install our app for a better experience with offline access."}
            </p>

            {isIOS ? (
                 <div className="text-sm text-slate-600 dark:text-slate-400 flex flex-col gap-2 mt-2 bg-slate-100 dark:bg-slate-700/50 p-2 rounded border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2">
                        <span>1. Tap</span>
                        <span className="material-icons-round text-base text-cyan-600 dark:text-cyan-400">ios_share</span>
                        <span>(Share)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>2. Select "Add to Home Screen"</span>
                        <span className="material-icons-round text-base text-slate-600 dark:text-slate-400">add_box</span>
                    </div>
                 </div>
            ) : (
                <div className="flex justify-end mt-1">
                    <button
                        onClick={handleInstallClick}
                        className="px-4 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                    >
                        <span className="material-icons-round text-sm">install_mobile</span>
                        Install
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}
