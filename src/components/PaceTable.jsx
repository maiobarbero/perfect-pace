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

  const downloadTCX = () => {
    // Generate TCX Workout XML
    const header = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">
  <Workouts>
    <Workout Sport="Running">
      <Name>PerfectPace Strategy</Name>
      <Step xsi:type="Step_t">
        <StepId>1</StepId>
        <Name>Warm Up</Name>
        <Duration xsi:type="Time_t">
          <Seconds>0</Seconds>
        </Duration>
        <Intensity>Active</Intensity>
        <Target xsi:type="None_t"/>
      </Step>`;

    // Create steps for each split
    // Note: splits are cumulative distance. We need step distance.
    // splits[0].km is 1. splits[1].km is 2. So step distance is usually 1km.
    // However, the last split might be fractional (e.g. 0.195km).

    let previousKm = 0;

    const steps = splits.map((split, index) => {
        const stepDistanceKm = split.km - previousKm;
        const stepDistanceMeters = Math.round(stepDistanceKm * 1000);
        previousKm = split.km;

        // ID must be unique
        const stepId = index + 2;

        return `      <Step xsi:type="Step_t">
        <StepId>${stepId}</StepId>
        <Name>Km ${parseFloat(split.km.toFixed(2))}</Name>
        <Duration xsi:type="Distance_t">
          <Meters>${stepDistanceMeters}</Meters>
        </Duration>
        <Intensity>Active</Intensity>
        <Target xsi:type="None_t"/>
        <Notes>Target Pace: ${split.pace}/km</Notes>
      </Step>`;
    }).join('\n');

    const footer = `    </Workout>
  </Workouts>
</TrainingCenterDatabase>`;

    const tcxContent = `${header}\n${steps}\n${footer}`;

    const blob = new Blob([tcxContent], { type: 'application/vnd.garmin.tcx+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "perfect_pace_workout.tcx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show donation modal after download
    setShowDonation(true);
  };

  return (
    <>
      <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden no-print">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-wrap gap-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-200">
            Detailed Race Splits Preview
          </h3>
          <div className="flex items-center gap-4">
              <button
                  onClick={downloadTCX}
                  className="flex items-center gap-2 text-xs font-bold text-secondary hover:text-pink-400 transition-colors bg-pink-50 dark:bg-pink-900/20 px-3 py-1.5 rounded-lg border border-pink-100 dark:border-pink-900"
                  title="Download structured workout for Garmin/Coros"
              >
                  <span className="material-icons-round text-sm">watch</span>
                  Export Workout (TCX)
              </button>
              <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 text-xs font-medium text-primary hover:text-cyan-300 transition-colors"
              >
                  <span className="material-icons-round text-sm">download</span>
                  Export to CSV
              </button>
          </div>
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
