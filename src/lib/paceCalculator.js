export function calculateSplit(goal, distance, strategy) {
    const time = stringToMinutes(goal);
    switch (strategy) {
        case "steady":
            return steadySplit(time, distance);
        case "negative-half":
            return splitAndCalculate(2, distance, 1.02, time);
        case "negative-quarter":
            return splitAndCalculate(4, distance, 1.02, time);
        case "rise":
            return splitAndCalculate(Math.round(distance), distance, 1.02, time);
        case "crash":
            return splitAndCalculate(Math.round(distance), distance, 1.05, time, true);
        default:
            return steadySplit(time, distance);
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
