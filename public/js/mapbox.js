const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoic3VtaXQwNzE4IiwiYSI6ImNrdmVybDluMDM1bWYycm9rbnhjZ2l0YmYifQ.vL8_bdMZTKYtRALXWIE7WA';
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sumit0718/cldwup6i7001s01mvw0o95v6g',
  center: [-118.113491, 34.111745],
  zoom: 9,
  interactive: false,
});
