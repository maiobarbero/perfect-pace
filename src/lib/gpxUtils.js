import { gpx } from "@tmcw/togeojson";

export function parseGPX(fileContent) {
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(fileContent, "application/xml");
    const geojson = gpx(xml);
    return geojson;
  } catch (e) {
    console.error("Error parsing GPX:", e);
    return null;
  }
}

// Haversine formula for distance between two points (in km)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function processGeoJSON(geojson) {
  // Extract the first LineString (usually the track)
  const track = geojson.features.find(
    (f) => f.geometry.type === "LineString"
  );

  if (!track) {
    throw new Error("No track found in GPX");
  }

  const coordinates = track.geometry.coordinates; // [lon, lat, ele]
  const segments = [];

  let currentKm = 1;
  let accumulatedDistance = 0;
  let segmentGain = 0;
  let segmentLoss = 0;
  let segmentStartEle = coordinates[0][2] || 0;
  let segmentStartDist = 0;

  // Helper to handle interpolation at split point
  const finalizeSegment = (endEle, endDist) => {
    const distDiff = endDist - segmentStartDist;
    const grade = distDiff > 0 ? (endEle - segmentStartEle) / (distDiff * 1000) : 0; // Rise / Run (meters)

    segments.push({
      km: currentKm,
      grade: grade, // Decimal (e.g. 0.05 = 5%)
      gain: segmentGain,
      loss: segmentLoss,
      elevationEnd: endEle
    });

    // Reset for next segment
    segmentStartEle = endEle;
    segmentStartDist = endDist;
    segmentGain = 0;
    segmentLoss = 0;
    currentKm++;
  };

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lon1, lat1, ele1 = 0] = coordinates[i];
    const [lon2, lat2, ele2 = 0] = coordinates[i + 1];

    const dist = getDistance(lat1, lon1, lat2, lon2);

    // Check if we cross a km marker
    let remainingDist = dist;
    let currentP1 = { dist: accumulatedDistance, ele: ele1 };

    while (accumulatedDistance + remainingDist >= currentKm) {
      const distanceToBoundary = currentKm - currentP1.dist;
      const fraction = distanceToBoundary / remainingDist; // Approximation if points are far apart, strictly linear
      const eleAtBoundary = currentP1.ele + (ele2 - currentP1.ele) * (distanceToBoundary / (remainingDist || 1)); // Avoid div by zero

      // Calculate gain/loss to boundary
      if (eleAtBoundary > currentP1.ele) {
        segmentGain += eleAtBoundary - currentP1.ele;
      } else {
        segmentLoss += currentP1.ele - eleAtBoundary;
      }

      finalizeSegment(eleAtBoundary, currentKm);

      // Update for next loop iteration
      currentP1 = { dist: currentKm, ele: eleAtBoundary };
      remainingDist -= distanceToBoundary;
      // Note: accumulatedDistance is implicitly updated by finalizeSegment logic tracking boundaries,
      // but we need to track local loop state.
      // Actually, let's just update accumulatedDistance at the end of the loop.
    }

    // Process the remainder (or the full segment if no boundary crossed)
    if (ele2 > currentP1.ele) {
        segmentGain += ele2 - currentP1.ele;
    } else {
        segmentLoss += currentP1.ele - ele2;
    }

    accumulatedDistance += dist;
  }

  // Handle last partial segment
  if (accumulatedDistance > (currentKm - 1)) {
     // We have a partial segment at the end
     const finalEle = coordinates[coordinates.length - 1][2] || 0;
     const distDiff = accumulatedDistance - (currentKm - 1);
     const grade = distDiff > 0 ? (finalEle - segmentStartEle) / (distDiff * 1000) : 0;

     segments.push({
         km: accumulatedDistance, // Use actual total distance
         grade: grade,
         gain: segmentGain,
         loss: segmentLoss,
         elevationEnd: finalEle,
         isPartial: true
     });
  }

  return {
    totalDistance: accumulatedDistance,
    segments: segments
  };
}
