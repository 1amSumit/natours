const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoic3VtaXQwNzE4IiwiYSI6ImNrdmVybDluMDM1bWYycm9rbnhjZ2l0YmYifQ.vL8_bdMZTKYtRALXWIE7WA';
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sumit0718/cldwup6i7001s01mvw0o95v6g',
  //   center: [-118.113491, 34.111745],
  //   zoom: 9,
  //   interactive: false,
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach((loc) => {
  let html = document.createElement('div');
  html.className = 'marker';

  new mapboxgl.Marker({
    element: html,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>${loc.day}: ${loc.description})</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
