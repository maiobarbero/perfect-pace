import React from 'react';

export default function DonationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 px-4 sm:px-0">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <span className="material-icons-round">close</span>
        </button>

        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
            <span className="material-icons-round text-secondary text-2xl">local_fire_department</span>
          </div>

          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Ready to Race!
          </h3>

          <div className="space-y-2">
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Your pacing data is ready. Good luck on your run!
            </p>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                If this tool helps you hit your target, consider supporting the project.
            </p>
          </div>

          <a
            href="https://www.buymeacoffee.com/maiobarbero"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#FFDD00] hover:bg-[#FFEA00] text-black font-bold py-3 rounded-xl transition-all shadow-lg transform hover:-translate-y-1"
            onClick={onClose}
          >
             <span className="material-icons-round">coffee</span>
             Buy me a coffee
          </a>

          <button
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
          >
            Maybe next time
          </button>
        </div>
      </div>
    </div>
  );
}
