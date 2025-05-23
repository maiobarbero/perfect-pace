import { useState, useEffect } from "react";

import { calculateSplit } from "../lib/paceCalculator.js";
import Selection from "../components/Selection.jsx";
import Timeline from "../components/Timeline.jsx";
import PaceTable from "../components/PaceTable.jsx";

function updateURLParams(data) {
    const params = new URLSearchParams();
    params.set("targetTime", data.targetTime);
    params.set("distance", data.distance);
    params.set("strategy", data.strategy);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
}

function getRaceDataFromURL() {
    const params = new URLSearchParams(window.location.search);
    const targetTime = params.get("targetTime");
    const distance = params.get("distance");
    const strategy = params.get("strategy");

    if (targetTime && distance && strategy) {
        return { targetTime, distance, strategy };
    }
    return null;
}

export default function Planner() {
    const [raceData, setRaceData] = useState(null);
    const [splits, setSplits] = useState([]);

    useEffect(() => {
        const dataFromURL = getRaceDataFromURL();
        if (dataFromURL) {
            setRaceData(dataFromURL);
        }
    }, []);

    useEffect(() => {
        if (raceData?.targetTime && raceData?.strategy && raceData?.distance) {
            const result = calculateSplit(
                raceData.targetTime,
                raceData.distance,
                raceData.strategy,
            );
            setSplits(result);
            updateURLParams(raceData);
        }
    }, [raceData]);

    return (
        <div>
            <section className="bg-accent/40 p-8 rounded-xl max-w-4xl mx-auto mt-10 shadow-md">
                <Selection onSubmit={setRaceData} />
            </section>
            {splits.length > 0 && (
                <>
                    <section className="border border-primary bg-opacity-20 p-8 rounded-xl max-w-4xl mx-auto mt-10 shadow-md">
                        <Timeline splits={splits} />
                    </section>

                    <section className="bg-secondary/40 p-8 rounded-xl max-w-4xl mx-auto mt-10 shadow-md">
                        <PaceTable splits={splits} />
                    </section>
                </>
            )}
        </div>
    );
}
