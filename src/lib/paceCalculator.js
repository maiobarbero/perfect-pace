export function calculateSplit(goal, distance, strategy, speedFactor = 1.02, gpxSegments = null) {
    const time = stringToMinutes(goal);

    if (gpxSegments && gpxSegments.length > 0) {
        return calculateGPXSplit(time, gpxSegments, strategy, speedFactor);
    }

    switch (strategy) {
        case "steady":
            return steadySplit(time, distance);
        case "negative-half":
            return splitAndCalculate(2, distance, speedFactor, time);
        case "negative-quarter":
            return splitAndCalculate(4, distance, speedFactor, time);
        case "rise":
            return splitAndCalculate(Math.round(distance), distance, speedFactor, time);
        case "crash":
            return splitAndCalculate(Math.round(distance), distance, speedFactor, time, true);
        default:
            return steadySplit(time, distance);
    }
}

// Minetti's polynomial for energy cost of running
// Returns normalized cost (Flat = 1.0)
function calculateCost(grade) {
    // Minetti (2002) J/kg/min
    // C = 155.4g^5 - 30.4g^4 - 43.3g^3 + 46.3g^2 + 19.5g + 3.6
    const g = grade;
    const cost = 155.4 * g**5 - 30.4 * g**4 - 43.3 * g**3 + 46.3 * g**2 + 19.5 * g + 3.6;

    // Normalize to flat cost (3.6)
    let ratio = cost / 3.6;

    // Safety clamps for extreme grades where the formula might behave oddly or be unsafe for speed estimation
    // Max speedup (downhill) factor: e.g. 0.6 ratio => 1.66x speed.
    // We assume runners brake on steep downhills, increasing cost.
    // Minetti handles this (cost rises for g < -0.2).
    // Just ensure positive.
    return Math.max(0.2, ratio);
}

function calculateGPXSplit(totalMinutes, segments, strategy, speedFactor) {
    // 1. Calculate weighted length of each segment based on Grade Cost AND Strategy
    const segmentData = segments.map((seg, index) => {
        const prevKm = index === 0 ? 0 : segments[index - 1].km;
        const length = seg.km - prevKm;

        const gradeCost = calculateCost(seg.grade);
        const strategyFactor = getStrategyFactor(strategy, index, segments.length, speedFactor);

        // Total "Effort Units" for this segment
        // Time = BasePace * Length * Cost * Strategy
        // We need to solve for BasePace.
        // TotalTime = BasePace * Sum(Length * Cost * Strategy)
        const weight = length * gradeCost * strategyFactor;

        return {
            ...seg,
            length,
            gradeCost,
            strategyFactor,
            weight
        };
    });

    const totalWeight = segmentData.reduce((sum, seg) => sum + seg.weight, 0);

    // Base Pace (min/km) on a flat, steady run equivalent
    const basePace = totalMinutes / totalWeight; // Wait, totalWeight has units of km (adjusted).
    // If factors are 1, totalWeight = totalDist. Pace = Time/Dist. Correct.

    // 2. Generate splits
    let cumulativeTime = 0;

    return segmentData.map((seg) => {
        const segmentTime = basePace * seg.weight;
        const segmentPace = segmentTime / seg.length; // min/km

        cumulativeTime += segmentTime;

        return {
            km: seg.km,
            pace: paceToString(segmentPace),
            totalTime: finalTime(cumulativeTime),
            elevation: seg.gain, // Passed from GPX
            grade: seg.grade,
            note: getNote(seg.grade)
        };
    });
}

function getNote(grade) {
    if (grade > 0.10) return "Steep Climb";
    if (grade > 0.04) return "Uphill";
    if (grade < -0.10) return "Steep Drop";
    if (grade < -0.04) return "Downhill";
    return "Flat";
}

function getStrategyFactor(strategy, index, totalSegments, speedFactor) {
    // Strategy Factor: Higher = Slower (Higher cost/time allocation)
    // For "Steady", factor is 1.
    // For "Negative Split", we want start to be slower (Factor > 1) and end faster (Factor < 1).

    // Note: The existing logic uses `ratio` which is proportional to TIME.
    // High ratio = High Time = Slow Pace.
    // So my StrategyFactor logic aligns with `ratio`.

    switch (strategy) {
        case "steady":
            return 1.0;

        case "negative-half": {
            // First half slower (factor > 1), second half faster.
            const isFirstHalf = index < totalSegments / 2;
            return isFirstHalf ? speedFactor : (1 / speedFactor); // Simplified logic
            // Accurate logic: Normalize so average is 1?
            // The main formula handles normalization via `basePace`.
            // So relative factors are fine.
        }

        case "negative-quarter": {
             // 4 quarters.
             // Logic in splitAndCalculate: ratio = [1, 1/sf, 1/sf^2, 1/sf^3].
             // It assumes 4 splits.
             // We map segment index to quarter.
             const quarter = Math.floor((index / totalSegments) * 4);
             // ratio should decrease (get faster).
             return 1 / (speedFactor ** quarter);
        }

        case "rise": {
            // Continuous acceleration.
            // ratio = 1 / sf^i
            return 1 / (speedFactor ** index);
        }

        case "crash": {
            // Start fast (low factor), end slow.
            // Reverse of Rise.
            return 1 / (speedFactor ** (totalSegments - 1 - index));
        }

        default:
            return 1.0;
    }
}

function steadySplit(goal, distance) {
    const pace = calculatePace(goal, distance);

    const splits = [];

    for (let i = 1; i <= distance; i++) {
        const totalTime = i * pace;

        splits.push({
            km: i,
            pace: paceToString(pace),
            totalTime: finalTime(totalTime),
        });
    }

    if (distance % 1 !== 0) {
        const totalTime = pace * distance;

        splits.push({
            km: distance,
            pace: paceToString(pace),
            totalTime: finalTime(totalTime),
        });
    }

    return splits;
}

function paceToString(pace) {
    const min = Math.floor(pace);
    const sec = Math.round((pace - min) * 60);
    if (sec === 60) {
        return `${String(min + 1).padStart(2, "0")}:00`;
    }
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function finalTime(cumulativeTime) {
    let hours = Math.floor(cumulativeTime / 60);
    let minutes = Math.floor(cumulativeTime % 60);
    let seconds = Math.round((cumulativeTime - hours * 60 - minutes) * 60);

    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }

    if (minutes == 60) {
        minutes = 0;
        hours++;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function calculatePace(totalMinutes, distance) {
    return totalMinutes / distance;
}

function stringToMinutes(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
}

function splitAndCalculate(splitsNum, distance, speedFactor, goal, crash = false) {
    const splits = [];
    let cumulativeTime = 0;
    const fractionalDistance = distance - Math.floor(distance);
    const splitDistance = distance / splitsNum;

    const ratio = [1];
    for (let i = 1; i < splitsNum; i++) {
        ratio[i] = 1 / speedFactor ** i;
    }
    const totalRatio = ratio.reduce((partial, a) => partial + a, 0);

    if (crash) {
        ratio.reverse();
    }

    const time = [];
    const paces = [];
    for (let i = 0; i < splitsNum; i++) {
        time[i] = (ratio[i] / totalRatio) * goal;
        paces[i] = calculatePace(time[i], splitDistance);
    }

    let kmIndex = 1;

    for (let h = 0; h < splitsNum; h++) {
        const currentPace = paces[h];
        const endKm = Math.floor((h + 1) * splitDistance);

        while (kmIndex <= endKm && kmIndex <= distance) {
            cumulativeTime += currentPace;

            splits.push({
                km: kmIndex,
                pace: paceToString(currentPace),
                totalTime: finalTime(cumulativeTime),
            });

            kmIndex++;
        }
    }

    if (fractionalDistance > 0) {
        const lastPace = calculatePace(goal - cumulativeTime, fractionalDistance);

        cumulativeTime += fractionalDistance * lastPace;

        splits.push({
            km: distance,
            pace: paceToString(lastPace),
            totalTime: finalTime(cumulativeTime),
        });
    }
    return splits;
}
