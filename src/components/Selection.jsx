import { useState, useEffect } from "react";

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

export default function Selection({ onSubmit, settingsOpen }) {
  const [distance, setDistance] = useState(null);
  const [strategy, setStrategy] = useState("steady");
  const [targetTime, setTargetTime] = useState(null);
  const [speedFactor, setSpeedFactor] = useState(1.02);

  useEffect(() => {
    const dataFromURL = getRaceDataFromURL();
    if (dataFromURL) {
      setDistance(dataFromURL.distance);
      setStrategy(dataFromURL.strategy);
      setTargetTime(dataFromURL.targetTime);
      setSpeedFactor(dataFromURL.speedFactor || 1.02);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { targetTime, strategy, distance, speedFactor };
    onSubmit(formData);
  };
  return (
    <div>
      <h2 className="mb-6">Select distance, pacing strategy and target time</h2>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="form-control w-full md:w-1/3">
            <label className="label">
              <span className="label-text">Distance in KM</span>
            </label>
            <input
              id="distance"
              className="input input-bordered"
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="42.195"
            />
          </div>

          <div className="form-control w-full md:w-1/3">
            <label className="label">
              <span className="label-text">Pacing strategy</span>
            </label>
            <select
              id="strategy"
              className="select select-bordered"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
            >
              <option value="steady">Steady</option>
              <option value="negative-half">Negative Split (Half)</option>
              <option value="negative-quarter">Negative Split (Quarter)</option>
              <option value="rise">The Rise to Glory</option>
              <option value="crash">The Glory Crash</option>
            </select>
          </div>

          <div className="form-control w-full md:w-1/3">
            <label className="label">
              <span className="label-text">Target time (es. 1:45:00)</span>
            </label>
            <input
              id="targetTime"
              type="text"
              className="input input-bordered"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              placeholder="2:00:35"
              required
              pattern="^[0-9]{2}:[0-9]{2}:[0-9]{2}$"
            />
          </div>
        </div>
        {settingsOpen && (
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="form-control w-full mt-6">
              <div className="form-control w-full md:w-1/3">
                <label
                  className="label tooltip"
                  data-tip="The speed factor used to calculate the pace in not steady strategy."
                >
                  <span className="label-text">Speed factor</span>
                </label>
                <input
                  id="speedFactor"
                  type="number"
                  className="input input-bordered"
                  value={speedFactor}
                  onChange={(e) => setSpeedFactor(e.target.value)}
                  placeholder="1.02"
                />
              </div>
            </div>
            <button
              className="btn btn-outline btn-error"
              onClick={() => setSpeedFactor(1.02)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="mt-6">
          <button
            id="calculateBtn"
            className="btn btn-primary w-full"
            type="submit"
            disabled={!distance || !targetTime || !strategy}
          >
            Create your plan
          </button>
        </div>
      </form>
    </div>
  );
}
