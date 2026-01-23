import React, { useState } from 'react';
import DonationModal from './DonationModal';

export default function Wristband({ splits }) {
    const [showDonation, setShowDonation] = useState(false);

    if (!splits || splits.length === 0) return null;

    const totalDistance = splits[splits.length - 1].km;

    // Determine checkpoints based on total distance
    let checkPointsIndices = [];

    if (Math.abs(totalDistance - 42.195) < 0.5) {
        // Marathon
        // Find indices closest to 5, 10, 15, 21.1, 30, 42.195
        const targets = [5, 10, 15, 21.0975, 30, 42.195];
        checkPointsIndices = targets.map(t => splits.findIndex(s => Math.abs(s.km - t) < 0.1));
    } else if (Math.abs(totalDistance - 21.0975) < 0.5) {
        // Half Marathon
        // 5, 10, 15, 21.1
        const targets = [5, 10, 15, 21.0975];
        checkPointsIndices = targets.map(t => splits.findIndex(s => Math.abs(s.km - t) < 0.1));
    } else {
        // Generic logic: Start (not 0), 20%, 40%, 60%, 80%, 100%
        // Or just divide by 5 segments
        const step = splits.length / 5;
        checkPointsIndices = [
            Math.floor(step) - 1,
            Math.floor(step * 2) - 1,
            Math.floor(step * 3) - 1,
            Math.floor(step * 4) - 1,
            splits.length - 1
        ];
        // Filter valid indices
        checkPointsIndices = checkPointsIndices.filter(i => i >= 0 && i < splits.length);
        // Dedup
        checkPointsIndices = [...new Set(checkPointsIndices)];
    }

    // Filter out -1s
    const checkPoints = checkPointsIndices
        .filter(i => i !== -1 && splits[i])
        .map(i => splits[i]);

    // Ensure the last one is always there if not added
    if (splits.length > 0 && !checkPoints.includes(splits[splits.length - 1])) {
        // If the logic above missed the finish line for some reason (e.g. standard generic logic might miss exact last index due to rounding)
        // But my generic logic explicitly adds splits.length - 1.
        // The marathon logic adds 42.195 match.
        // Let's just double check the last point is the finish.
        const lastSplit = splits[splits.length - 1];
        if (checkPoints[checkPoints.length - 1] !== lastSplit) {
            checkPoints.push(lastSplit);
        }
    }

    // Format time to show shorter version if needed and determine unit
    // Format time components
    const getTimeComponents = (timeStr) => {
        if (!timeStr) return null;
        const parts = timeStr.split(':');
        if (parts.length === 3) {
            // HH:MM:SS
            if (parts[0] === '00') {
                return {
                    main: parts[1],
                    mainUnit: 'm',
                    sub: parts[2],
                    subUnit: 's'
                }; // MM:SS
            }
            return {
                main: parseInt(parts[0]).toString(),
                mainUnit: 'h',
                sub: parts[1],
                subUnit: 'm'
            }; // H:MM
        }
        return { main: timeStr, mainUnit: "", sub: "", subUnit: "" };
    };

    const handlePrint = () => {
        window.print();
        // Show donation modal after user interacts with print dialog (or immediately, since we can't detect print completion easily)
        setShowDonation(true);
    };

    // Calculate Average Pace
    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m, s] = timeStr.split(':').map(Number);
        return h * 60 + m + s / 60;
    };

    const formatAvgPace = (minPerKm) => {
        if (!minPerKm || isNaN(minPerKm)) return "0:00";
        const min = Math.floor(minPerKm);
        const sec = Math.round((minPerKm - min) * 60);
        if (sec === 60) return `${min + 1}:00`;
        return `${min}:${String(sec).padStart(2, '0')}`;
    };

    const totalMinutes = parseTimeToMinutes(splits[splits.length - 1]?.totalTime);
    const avgPace = formatAvgPace(totalMinutes / totalDistance);

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-end no-print px-2">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-secondary">print</span>
                        Printable Wristband
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Preview of your race day pacing strip. Cut along the dotted lines.
                    </p>
                </div>
                <button
                    className="bg-secondary text-white hover:bg-pink-400 font-semibold py-2 px-6 rounded-lg shadow-lg shadow-pink-500/30 transition-all flex items-center gap-2"
                    onClick={() => {
                        if (window.gtag) {
                            window.gtag('event', 'print_wristband', {
                                'event_category': 'engagement',
                                'event_label': 'print',
                                'distance': totalDistance
                            });
                        }
                        window.print();
                    }}
                >
                    <span className="material-icons-round">print</span> Print Now
                </button>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-x-auto print:p-0 print:border-none print:shadow-none print:overflow-visible print:bg-transparent">
                <div
                    className="bg-white text-black min-w-[750px] max-w-[800px] h-24 mx-auto border-2 border-dashed border-slate-400 relative flex items-center px-2 select-none"
                    id="wristband-container"
                >
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-slate-400 no-print">
                        <span className="material-icons-round text-sm rotate-90">content_cut</span>
                    </div>

                    {/* Logo Section */}
                    <div className="h-full flex flex-col justify-center px-4 border-r border-slate-200 w-24 shrink-0">
                        <div className="flex flex-col leading-none font-black tracking-wider text-xs scale-90 origin-left">
                            <span className="text-black">PERFECT</span>
                            <span className="text-black">PACE</span>
                        </div>
                        <div className="text-[0.6rem] font-mono text-slate-500 mt-1">{totalDistance.toPrecision(4)}KM</div>
                        <div className="text-[0.6rem] font-mono text-slate-500">@{avgPace} /km</div>
                    </div>

                    {/* Splits Grid */}
                    <div className="flex-grow grid grid-flow-col auto-cols-fr h-full">
                        {checkPoints.map((split, index) => {
                            const isFinish = index === checkPoints.length - 1;
                            const time = getTimeComponents(split.totalTime);
                            return (
                                <div
                                    key={split.km}
                                    className={`flex flex-col justify-center items-center h-full border-r border-slate-200 ${index % 2 !== 0 ? 'bg-slate-50 print:bg-transparent' : ''} ${isFinish ? 'border-r-0' : ''}`}
                                >
                                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        {isFinish ? 'Finish' : `${parseFloat(split.km.toFixed(1))} km`}
                                    </span>
                                    {time && time.main !== undefined ? (
                                        <div className="flex items-baseline justify-center whitespace-nowrap">
                                            <span className="text-xl font-bold font-mono tracking-tight leading-none">
                                                {time.main}
                                            </span>
                                            <span className="text-[0.5rem] font-bold text-slate-500 ml-[1px] mr-[1px]">
                                                {time.mainUnit}
                                            </span>
                                            <span className="text-xs font-bold text-slate-300 mx-[1px] relative -top-[1px]">:</span>
                                            <span className="text-xl font-bold font-mono tracking-tight leading-none">
                                                {time.sub}
                                            </span>
                                            <span className="text-[0.5rem] font-bold text-slate-500 ml-[1px]">
                                                {time.subUnit}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xl font-bold font-mono tracking-tight leading-none">
                                            {split.totalTime}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-slate-400 no-print">
                        <span className="material-icons-round text-sm -rotate-90">content_cut</span>
                    </div>
                </div>
            </div>

            <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
        </section>
    );
}
