export default function PaceTable({ splits }) {
  return (
    <div>
      <h2>Detailed Race Splits:</h2>
      {splits.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Km</th>
                <th>Pace</th>
                <th>Total Time</th>
              </tr>
            </thead>
            <tbody>
              {splits.map((split, index) => (
                <tr key={index}>
                  <th>{split.km}</th>
                  <td>{split.pace}</td>
                  <td>{split.totalTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
