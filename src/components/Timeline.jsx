import TimelineItem from "./TimelineItem.jsx";

export default function PaceTable({ splits }) {
  return (
    <div className="w-full">
      <h2>Pacing Checkpoints:</h2>
      {splits.length > 0 && (
        <ul className="timeline-vertical timeline lg:timeline-horizontal">
          {splits.map((split, index) => {
            const middleIndex = Math.floor(splits.length / 2) - 1;
            const quarterIndex = Math.floor(splits.length / 4) - 1;
            const threeQuarterIndex = Math.floor(splits.length / 1.33);

            if (
              index !== 0 &&
              index !== splits.length - 1 &&
              index !== middleIndex &&
              index !== quarterIndex &&
              index !== threeQuarterIndex
            ) {
              return null;
            }

            return (
              <TimelineItem
                key={index}
                index={index}
                km={split.km}
                totalTime={split.totalTime}
                isStart={index === 0}
                isEnd={index === splits.length - 1}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
