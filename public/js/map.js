document.addEventListener("DOMContentLoaded", function () {
  mapboxgl.accessToken = mapToken;

  // Default coordinates (e.g. India Gate, Delhi)
  const defaultCoordinates = [77.2295, 28.6129];

  // Agar coordinates galat ya empty hain to default use karo
  let centerCoordinates = (Array.isArray(coordinates) && coordinates.length === 2)
    ? coordinates
    : defaultCoordinates;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: centerCoordinates,
    zoom: 9
  });



  new mapboxgl.Marker({ color: 'red' })
    .setLngLat(centerCoordinates)
    .setPopup( new mapboxgl.Popup({offset: 25})
    .setHTML("<h4>Exact Location Provided after Booking !</h4><p> </p>"))
    .addTo(map);
});
