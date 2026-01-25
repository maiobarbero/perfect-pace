import React from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';

export default function RaceChart({ splits }) {
  if (!splits || splits.length === 0) return null;

  // Prepare data: convert strings to numbers where necessary
  const data = splits.map(s => {
      // Pace is "MM:SS", convert to seconds/km for the chart logic (though we might display it differently)
      // Or easier: use speed (km/h) or just use the Pace string for tooltip but Y axis might be tricky.
      // Better: Convert pace "4:30" to decimal minutes 4.5 for plotting.
      const [min, sec] = s.pace.split(':').map(Number);
      const paceDecimal = min + sec / 60;

      return {
          km: parseFloat(s.km.toFixed(1)),
          pace: paceDecimal,
          paceLabel: s.pace,
          elevation: s.elevation ? Math.round(s.elevation) : 0,
          rawElevation: s.elevation || 0
      };
  });

  const hasElevation = data.some(d => d.rawElevation !== 0);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-surface-dark p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-sm">
          <p className="font-bold text-slate-700 dark:text-slate-200">Km {label}</p>
          <p className="text-secondary">
             Pace: <span className="font-mono font-bold">{payload.find(p => p.dataKey === 'pace')?.payload.paceLabel}</span> /km
          </p>
          {hasElevation && (
             <p className="text-cyan-600 dark:text-cyan-400">
                Elev: <span className="font-mono font-bold">{payload.find(p => p.dataKey === 'elevation')?.value}</span> m
             </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden p-4 no-print space-y-4">
      <h3 className="font-bold text-slate-700 dark:text-slate-200">
        Race Profile & Pace Strategy
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.3} />
            <XAxis
                dataKey="km"
                tick={{fontSize: 12, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
                type="number"
                domain={[0, 'auto']}
                unit="k"
            />
            {/* Left Y Axis: Pace (Inverted so faster is higher? No, standard graph: higher value = slower pace usually visually confusing if Y is time.
                Let's keep Y as minutes/km. Higher Y = Slower.
                Maybe invert domain? domain={['dataMax', 'dataMin']}
            */}
            <YAxis
                yAxisId="left"
                orientation="left"
                domain={['auto', 'auto']}
                tick={{fontSize: 12, fill: '#f472b6'}}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => {
                    let min = Math.floor(val);
                    let sec = Math.round((val - min) * 60);
                    if (sec === 60) {
                        min += 1;
                        sec = 0;
                    }
                    return `${min}:${sec.toString().padStart(2, '0')}`;
                }}
                label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft', fill: '#f472b6', fontSize: 10 }}
                reversed={true} // Faster pace (lower number) at top
            />

            {hasElevation && (
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{fontSize: 12, fill: '#22d3ee'}}
                    axisLine={false}
                    tickLine={false}
                    unit="m"
                    label={{ value: 'Elevation (m)', angle: 90, position: 'insideRight', fill: '#22d3ee', fontSize: 10 }}
                />
            )}

            <Tooltip content={<CustomTooltip />} />

            {hasElevation && (
                <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="elevation"
                    stroke="#22d3ee"
                    fillOpacity={1}
                    fill="url(#colorElev)"
                />
            )}

            <Line
                yAxisId="left"
                type="stepAfter" // Step chart implies pace is constant for that km
                dataKey="pace"
                stroke="#f472b6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#f472b6", stroke: "#fff", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
