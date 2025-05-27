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
  params.set("speedFactor", data.speedFactor);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
}

function getRaceDataFromURL() {
  const params = new URLSearchParams(window.location.search);
  const targetTime = params.get("targetTime");
  const distance = params.get("distance");
  const strategy = params.get("strategy");
  const speedFactor = params.get("speedFactor");

  if (targetTime && distance && strategy) {
    return {
      targetTime,
      distance,
      strategy,
      speedFactor: speedFactor,
    };
  }
  return null;
}

export default function Planner() {
  const [raceData, setRaceData] = useState(null);
  const [splits, setSplits] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        raceData.speedFactor || 1.02,
      );
      setSplits(result);
      updateURLParams(raceData);
    }
  }, [raceData]);

  const toggleSettings = () => {
    setSettingsOpen((prev) => !prev);
  };

  return (
    <div>
      <section className="bg-accent/40 p-8 rounded-xl max-w-4xl mx-auto mt-10 shadow-md relative">
        <button
          className="absolute right-4 top-4 btn btn-outline btn-primary hover:bg-transparent hover:shadow-none"
          onClick={() => toggleSettings()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
        </button>
        <Selection onSubmit={setRaceData} settingsOpen={settingsOpen} />
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
