import React, { useState } from 'react';
import DonationModal from './DonationModal';

export default function PaceTable({ splits }) {
  const [showDonation, setShowDonation] = useState(false);

  if (!splits || splits.length === 0) return null;

  const downloadCSV = () => {
    const headers = ["Km", "Pace /km", "Total Time", "Note"];
    const rows = splits.map((split) => {
        let note = "Steady";
        if (split.km % 5 === 0 || Math.abs(split.km - 21.0975) < 0.1 || Math.abs(split.km - 42.195) < 0.1) {
            note = "Checkpoint";
        }
        return [split.km, split.pace, split.totalTime, note];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "race_splits.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show donation modal after download
    setShowDonation(true);
  };

  return (
    <>
      <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden no-print">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 dark:text-slate-200">
            Detailed Race Splits Preview
          </h3>
          <button
              onClick={downloadCSV}
              className="flex items-center gap-2 text-xs font-medium text-primary hover:text-cyan-300 transition-colors"
          >
              <span className="material-icons-round text-sm">download</span>
              Export to CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3">Km</th>
                <th className="px-6 py-3">Pace /km</th>
                <th className="px-6 py-3">Total Time</th>
                <th className="px-6 py-3">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono">
              {splits.map((split, index) => {
                  const isCheckpoint = split.km % 5 === 0 || Math.abs(split.km - 21.0975) < 0.1 || Math.abs(split.km - 42.195) < 0.1;
                  const isWarmUp = index === 0; // Simple logic for demo

                  let note = "Steady";
                  if (isCheckpoint) note = "Checkpoint";
                  else if (isWarmUp) note = "Warm up";

                  // Highlight style for checkpoint
                  const rowClass = isCheckpoint
                      ? "bg-slate-50 dark:bg-slate-800/30"
                      : "bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-700/50";

                  const noteClass = isCheckpoint
                      ? "text-xs text-secondary font-sans font-bold"
                      : "text-xs text-slate-400 font-sans";

                  const kmClass = isCheckpoint
                      ? "px-6 py-3 font-bold text-secondary"
                      : "px-6 py-3 font-medium";

                  const timeClass = isCheckpoint
                      ? "px-6 py-3 text-secondary font-bold"
                      : "px-6 py-3 text-primary font-bold";

                return (
                  <tr key={index} className={rowClass}>
                    <td className={kmClass}>{parseFloat(split.km.toFixed(2))}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {split.pace}
                    </td>
                    <td className={timeClass}>
                      {split.totalTime}
                    </td>
                    <td className={noteClass}>{note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="h-12 bg-gradient-to-b from-transparent to-white dark:to-surface-dark w-full relative -mt-12 pointer-events-none"></div>
      </section>

      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </>
  );
}
