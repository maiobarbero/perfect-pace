import { useState, useEffect } from "react";
import { parseGPX, processGeoJSON } from "../lib/gpxUtils";

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

export default function Selection({ onSubmit }) {
  const [distance, setDistance] = useState("");
  const [strategy, setStrategy] = useState("steady");
  const [targetTime, setTargetTime] = useState("");
  const [speedFactor, setSpeedFactor] = useState(1.02);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [gpxSegments, setGpxSegments] = useState(null);
  const [gpxFileName, setGpxFileName] = useState("");

  useEffect(() => {
    const dataFromURL = getRaceDataFromURL();
    if (dataFromURL) {
      setDistance(dataFromURL.distance);
      setStrategy(dataFromURL.strategy);
      setTargetTime(dataFromURL.targetTime);
      setSpeedFactor(dataFromURL.speedFactor || 1.02);
    }
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setGpxFileName(file.name);

    try {
        const text = await file.text();
        const geojson = parseGPX(text);
        if (geojson) {
            const { totalDistance, segments } = processGeoJSON(geojson);
            // Update distance with precision
            setDistance(totalDistance.toFixed(3));
            setGpxSegments(segments);
        } else {
             alert("Could not parse GPX file.");
        }
    } catch (err) {
        console.error(err);
        alert("Error processing GPX file: " + err.message);
        setGpxSegments(null);
        setGpxFileName("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      targetTime,
      strategy,
      distance: parseFloat(distance),
      speedFactor: parseFloat(speedFactor),
      gpxSegments: gpxSegments
    };

    if (window.gtag) {
        window.gtag('event', 'recalculate_plan', {
            'event_category': 'engagement',
            'event_label': 'recalculate',
            'distance': formData.distance,
            'strategy': formData.strategy,
            'target_time': formData.targetTime,
            'has_gpx': !!gpxSegments
        });
    }

    onSubmit(formData);
  };

  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 no-print">
      <h2 className="text-lg md:text-xl font-bold text-center text-primary mb-6">
        Select distance, pacing strategy and target time
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Distance */}
          <div className="space-y-2">
            <label htmlFor="distance" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Distance in KM
            </label>
            <div className="relative">
              <input
                id="distance"
                type="number"
                step="0.001"
                className="w-full bg-slate-100 dark:bg-input-dark border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono placeholder-slate-400"
                value={distance}
                onChange={(e) => {
                    setDistance(e.target.value);
                    // Clear GPX if user manually edits distance, to ensure consistency
                    if (gpxSegments) {
                        setGpxSegments(null);
                        setGpxFileName("");
                    }
                }}
                placeholder="42.195"
                required
              />
            </div>
             {/* File Upload Trigger */}
             <div className="mt-2">
                 <label htmlFor="gpx-upload" className="cursor-pointer flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors">
                    <span className="material-icons-round text-sm">upload_file</span>
                    {gpxFileName ? `Loaded: ${gpxFileName}` : "Upload GPX Trace (optional)"}
                 </label>
                 <input
                    id="gpx-upload"
                    type="file"
                    accept=".gpx"
                    className="hidden"
                    onChange={handleFileChange}
                 />
             </div>
          </div>

          {/* Strategy */}
          <div className="space-y-2">
            <label htmlFor="strategy" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Pacing strategy
            </label>
            <div className="relative">
              <select
                id="strategy"
                className="w-full bg-slate-100 dark:bg-input-dark border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
              >
                <option value="steady">Steady</option>
                <option value="negative-half">Negative Split (Half)</option>
                <option value="negative-quarter">Negative Split (Quarter)</option>
                <option value="rise">The Rise to Glory</option>
                <option value="crash">The Glory Crash</option>
              </select>
              <span className="material-icons-round absolute right-3 top-3.5 text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Target Time */}
          <div className="space-y-2">
            <label htmlFor="targetTime" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Target time (hh:mm:ss)
            </label>
            <div className="relative">
              <input
                id="targetTime"
                type="text"
                className="w-full bg-slate-100 dark:bg-input-dark border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono placeholder-slate-400"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                placeholder="03:00:00"
                required
                pattern="^[0-9]{1,2}:[0-9]{2}:[0-9]{2}$"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
            <button
                type="button"
                className="text-xs text-slate-500 hover:text-primary transition-colors underline decoration-dotted"
                onClick={() => setShowAdvanced(!showAdvanced)}
            >
                {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
            </button>
        </div>

        {showAdvanced && (
            <div className="mt-4 max-w-xs mx-auto">
                 <div className="space-y-2">
                    <label htmlFor="speedFactor" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Speed Factor
                    </label>
                    <div className="relative">
                        <input
                            id="speedFactor"
                            type="number"
                            step="0.01"
                            className="w-full bg-slate-100 dark:bg-input-dark border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
                            value={speedFactor}
                            onChange={(e) => setSpeedFactor(e.target.value)}
                        />
                    </div>
                     <p className="text-[10px] text-slate-400 text-center">Standard is 1.02. Used for non-steady strategies.</p>
                </div>
            </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={!distance || !targetTime || !strategy}
            className="bg-gradient-to-r from-primary to-cyan-500 hover:from-cyan-300 hover:to-primary text-slate-900 font-bold py-3 px-8 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Recalculate Plan
          </button>
        </div>
      </form>
    </section>
  );
}
