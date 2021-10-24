import { Loader } from "@googlemaps/js-api-loader";
import { ipcRenderer } from "electron";

let map: google.maps.Map;

const additionalOptions = {};

// Load map
let markers: google.maps.Marker[] = [];

const startPoint = { lat: 47.5300099, lng: -122.209046 };

const loader = new Loader({
  apiKey: "AIzaSyDv9iNeDL_kmNc5OU-syA4Ijhxq5QoS6TY",
  version: "weekly",
  ...additionalOptions,
});

// InitMap()
loader.load().then(() => {
  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center: startPoint,
    zoom: 8,
  });

  // This event listener will call addMarker() when the map is clicked.
  map.addListener("click", (event: google.maps.MapMouseEvent) => {
    addMarker(event.latLng!);
  });

  // load  and update markers to mapWindow
  ipcRenderer.on("marker:list", (err, cargos) => {
    deleteMarkers();

    console.log("pacgave");
    

    cargos.forEach((element: any) => {
      const cargo = element._doc;

      if (!cargo.delivered) {
        const latLang = {
          lat: Number(cargo.locationX),
          lng: Number(cargo.locationY),
        };

        addMarker(latLang);
      }
    });
  });

  // Adds a marker at the center of the map.
  addMarker(startPoint);
});

// Utils

// Adds a marker to the map and push to the array.
function addMarker(position: google.maps.LatLng | google.maps.LatLngLiteral) {
  const marker = new google.maps.Marker({
    position,
    map,
  });

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