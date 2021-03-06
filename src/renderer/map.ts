import { Loader } from "@googlemaps/js-api-loader";
import { ipcRenderer } from "electron";

let map: google.maps.Map;

const additionalOptions = {};

// Direction Options
let directionsDisplay: google.maps.DirectionsRenderer;
let directionsService: google.maps.DirectionsService;
let size = 0;
let currentPosition = { lat: 47.701, lng: -122.36 };

// An array to store results from Google routing API.
let routeResults: any[] = [];

// Load map
let markers: google.maps.Marker[] = [];
let points: { latLng: any }[] = [];

const loader = new Loader({
  apiKey: "AIzaSyDv9iNeDL_kmNc5OU-syA4Ijhxq5QoS6TY",
  version: "weekly",
  ...additionalOptions,
});

// InitMap()
loader.load().then(() => {
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsService = new google.maps.DirectionsService();

  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center: currentPosition,
    zoom: 8,
  });

  directionsDisplay.setMap(map);

  // load  and update markers to mapWindow
  ipcRenderer.on("marker:list", (err, cargos) => {
    deleteMarkers();

    cargos.forEach((element: any) => {
      const cargo = element._doc;

      if (!cargo.delivered) {
        const latLang = {
          lat: Number(cargo.lat),
          lng: Number(cargo.lng),
        };

        const place = {
          title: cargo.clientName,
          latLng: new google.maps.LatLng(Number(cargo.lat), Number(cargo.lng)),
        };

        points.push(place);
        addMarker(latLang, false, cargo.clientName);
      }
    });

    // Change Courrier position
    ipcRenderer.on("courrier:add", (e, arg) => {
      deleteMarkers();
      if (e) {
        console.log(e);
      } else {
        currentPosition = {
          lat: arg.lat,
          lng: arg.lng,
        };
      }
    });

    // Adds a marker at  Courrier position
    addMarker(currentPosition, true, "courier");

    // Find Shortest
    findNearestCargo();

    // Empty list points list for each update
    points = [];
  });

  // This event listener will call addMarker() when the map is clicked.
  map.addListener("click", (event: google.maps.MapMouseEvent) => {
    const latLng = event.latLng.toJSON();

    ipcRenderer.send("click:addMarker", latLng);
  });
});

// Direction Utils

// Loops through all cargos to calculate route between our current position and that place.
function findNearestCargo() {
  let i = points.length;
  size = points.length;
  routeResults = [];
  while (i--) {
    calcRoute(points[i].latLng, storeResult);
  }
}

// A function to calculate the route between our current position and some desired end point.
function calcRoute(
  end: any,
  callback: { (data: any): void; (arg0: google.maps.DirectionsResult): void }
) {
  const request = {
    origin: currentPosition,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING,
  };
  directionsService.route(request, function (response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      callback(response);
    } else {
      size--;
    }
  });
}

// Stores a routing result from the API in our global array for routes.
function storeResult(data: any) {
  routeResults.push(data);
  if (routeResults.length === size) {
    findShortest();
  }
}

// Goes through all routes stored and finds which one is the shortest.
function findShortest() {
  let i = routeResults.length;
  let shortestIndex = 0;
  let shortestLength = routeResults[0].routes[0].legs[0].distance.value;

  while (i--) {
    if (routeResults[i].routes[0].legs[0].distance.value < shortestLength) {
      shortestIndex = i;
      shortestLength = routeResults[i].routes[0].legs[0].distance.value;
    }
  }
  // Update position on courrier
  currentPosition = routeResults[shortestIndex].request.destination.location;

  console.log(routeResults)

  directionsDisplay.setDirections(routeResults[shortestIndex]);
}

// Marker Utils

// Adds a marker to the map and push to the array.
function addMarker(
  position: google.maps.LatLng | google.maps.LatLngLiteral,
  carrier: boolean,
  label: string
) {
  const marker = new google.maps.Marker({
    position,
    map,
    label: label,
  });

  if (carrier) {
    marker.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
  }
  markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map: google.maps.Map | null) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers(): void {
  setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers(): void {
  hideMarkers();
  markers = [];
}
