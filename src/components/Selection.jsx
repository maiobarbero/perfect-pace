import { useState, useEffect } from "react";

function getRaceDataFromURL() {
    const params = new URLSearchParams(window.location.search);
    const targetTime = params.get("targetTime");
    const distance = params.get("distance");
    const strategy = params.get("strategy");

    if (targetTime && distance && strategy) {
        return {
            targetTime,
            distance: parseFloat(distance),
            strategy
        };
    }
    return null;
}

export default function Selection({ onSubmit }) {
    const [distance, setDistance] = useState(5);
    const [strategy, setStrategy] = useState("steady");
    const [targetTime, setTargetTime] = useState("00:00:00");

    useEffect(() => {
        const dataFromURL = getRaceDataFromURL();
        if (dataFromURL) {
            setDistance(dataFromURL.distance);
            setStrategy(dataFromURL.strategy);
            setTargetTime(dataFromURL.targetTime);
            // onSubmit(dataFromURL);
        }
    }, []);


    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = { targetTime, strategy, distance };
        onSubmit(formData);
    };
    return (
        <div>
            <h2 className="mb-6">Select distance, pacing strategy and target time</h2>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="form-control w-full md:w-1/3">
                        <label className="label">
                            <span className="label-text">Distance</span>
                        </label>
                        <select
                            id="distance"
                            className="select select-bordered"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                        >
                            <option value="5">5km</option>
                            <option value="10">10km</option>
                            <option value="21.0975">Half Marathon</option>
                            <option value="42.195">Marathon</option>
                        </select>
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
                            required
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        id="calculateBtn"
                        className="btn btn-primary w-full"
                        type="submit"
                    >
                        Create your plan
                    </button>
                </div>
            </form>
        </div>
    );
}
