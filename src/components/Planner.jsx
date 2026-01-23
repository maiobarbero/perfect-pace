import { useState, useEffect } from "react";

import { calculateSplit } from "../lib/paceCalculator.js";
import Selection from "../components/Selection.jsx";
import Wristband from "../components/Wristband.jsx";
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
      distance: parseFloat(distance),
      strategy,
      speedFactor: parseFloat(speedFactor) || 1.02,
    };
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
        raceData.speedFactor || 1.02,
        raceData.gpxSegments
      );
      setSplits(result);
      updateURLParams(raceData);
    }
  }, [raceData]);

  return (
    <div className="space-y-8">
      <Selection onSubmit={setRaceData} />

      {splits.length > 0 && (
        <>
          <Wristband splits={splits} />
          <PaceTable splits={splits} />
        </>
      )}
    </div>
  );
}
