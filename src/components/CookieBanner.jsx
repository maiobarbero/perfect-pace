import React, { useState, useEffect } from 'react';

const COOKIE_CATEGORIES = [
    {
        id: 'necessary',
        label: 'Necessary',
        description: 'Theme preferences and basic functionality.',
        required: true,
        default: true,
    },
    {
        id: 'analytics',
        label: 'Analytics',
        description: 'Help us improve the website by collecting anonymous usage data.',
        required: false,
        default: false,
    }
];

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Initialize with defaults
    const [preferences, setPreferences] = useState(() =>
        COOKIE_CATEGORIES.reduce((acc, cat) => ({
            ...acc,
            [cat.id]: cat.default
        }), {})
    );

    useEffect(() => {
        const saved = localStorage.getItem('cookie_consent');
        if (!saved) {
            setIsVisible(true);
        } else {
            try {
                const parsed = JSON.parse(saved);
                // Merge parsed preferences with defaults to handle any new categories added later
                const defaults = COOKIE_CATEGORIES.reduce((acc, cat) => ({
                    ...acc,
                    [cat.id]: cat.default
                }), {});

                const merged = { ...defaults, ...parsed };
                setPreferences(merged);

                // Dispatch event for any listeners with the current state
                window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: merged }));
            } catch (e) {
                console.error("Error parsing cookie consent", e);
                setIsVisible(true);
            }
        }
    }, []);

    const savePreferences = (prefs) => {
        localStorage.setItem('cookie_consent', JSON.stringify(prefs));
        window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: prefs }));
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleAcceptAll = () => {
        const all = COOKIE_CATEGORIES.reduce((acc, cat) => ({
            ...acc,
            [cat.id]: true
        }), {});
        savePreferences(all);
    };

    const handleRejectAll = () => {
        const rejected = COOKIE_CATEGORIES.reduce((acc, cat) => ({
            ...acc,
            [cat.id]: cat.required // Keep required true, set others to false (or their required state)
        }), {});
        savePreferences(rejected);
    };

    const handleSaveSettings = () => {
        savePreferences(preferences);
    };

    const togglePreference = (key) => {
        const category = COOKIE_CATEGORIES.find(c => c.id === key);
        if (category && category.required) return;

        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isVisible) return null;

    if (showSettings) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setShowSettings(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label="Close settings"
                    >
                        <span className="material-icons-round">close</span>
                    </button>

                    <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Cookie Settings</h2>
                    <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                        Customize your cookie preferences. Essential cookies are necessary for the website to function properly.
                    </p>

                    <div className="space-y-4 mb-8">
                        {COOKIE_CATEGORIES.map((category) => (
                            <div key={category.id} className="flex items-center justify-between p-3 rounded bg-slate-50 dark:bg-slate-700/50">
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{category.label}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{category.description}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences[category.id]}
                                    onChange={() => togglePreference(category.id)}
                                    disabled={category.required}
                                    className={`w-5 h-5 text-cyan-500 rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700 ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer focus:ring-cyan-500'}`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3">
                         <button
                            onClick={handleRejectAll}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                            Reject All
                        </button>
                        <button
                            onClick={handleSaveSettings}
                            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-cyan-500/20"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-up">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 pr-8">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                        We value your privacy
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                        Read our <a href="/perfect-pace/privacy-policy" className="text-cyan-500 hover:text-cyan-600 underline">Privacy Policy</a>.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors whitespace-nowrap"
                    >
                        Customize
                    </button>
                    <button
                        onClick={handleAcceptAll}
                        className="flex-1 md:flex-none px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                    >
                        Accept All
                    </button>
                </div>

                <button
                    onClick={handleRejectAll}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label="Close and Reject Optional Cookies"
                >
                    <span className="material-icons-round">close</span>
                </button>
            </div>
        </div>
    );
}
