import { ipcRenderer } from "electron";

// Remove old cargoList items
function deleteChild(e: any) {
  //e.firstElementChild can be used.
  let child = e.lastElementChild;
  while (child) {
    e.removeChild(child);
    child = e.lastElementChild;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Update Cargo list
  ipcRenderer.send("load:cargolist", true);

  // Handle openAddCargoWindow button
  const addCargoBtn = document.getElementById("addCargoBtn");
  let isClicked = false;

  addCargoBtn.addEventListener("click", () => {
    isClicked = true;

    ipcRenderer.send("click:openAddCargo", isClicked);
    isClicked = false;
  });

  // List cargos
  const cargoList = document.getElementById("listCargos");

  // Get cargos from  add cargo
  ipcRenderer.on("cargo:list", (err, cargos) => {
    deleteChild(cargoList);

    cargos.forEach((element: any) => {
      const cargo = element._doc;

      const cargoDiv = document.createElement("div");

      if (cargo.delivered) {
        cargoDiv.style.backgroundColor = "#90ee90";
      } else {
        cargoDiv.style.backgroundColor = "#ffcccb";
      }

      const clientName = document.createElement("p");
      clientName.innerText = "Client Name: " + cargo.clientName;
      cargoDiv.appendChild(clientName);

      const lat = document.createElement("p");
      lat.innerText = "Lat: " + cargo.lat;
      cargoDiv.appendChild(lat);

      const lng = document.createElement("p");
      lng.innerText = "Lng : " + cargo.lng;
      cargoDiv.appendChild(lng);

      // Delivered checkbox
      const delivered = <HTMLInputElement>document.createElement("INPUT");
      delivered.id = cargo.clientName;
      delivered.checked = cargo.delivered;
      delivered.setAttribute("type", "checkbox");
      cargoDiv.appendChild(delivered);

      // Delivered Label
      const deliveredLabel = document.createElement("label");
      deliveredLabel.setAttribute("for", cargo.clientName);
      deliveredLabel.innerText = "Delivered";
      cargoDiv.appendChild(deliveredLabel);

      const br = document.createElement("br");
      cargoDiv.appendChild(br);

      // Delete button
      const deleteCargoBtn = document.createElement("button");
      deleteCargoBtn.id = cargo.clientName;
      deleteCargoBtn.innerText = "Delete";
      cargoDiv.appendChild(deleteCargoBtn);

      cargoList.appendChild(cargoDiv);

      // handle delivered click event
      delivered.addEventListener("click", deliverEvt);

      function deliverEvt() {
        const crg = {
          clientname: this.id,
          delivered: this.checked,
        };

        ipcRenderer.send("click:delivered", crg);
      }

      // handle delete button
      deleteCargoBtn.addEventListener("click", deleteEvt);

      function deleteEvt() {
        const crg = {
          clientname: this.id,
        };

        ipcRenderer.send("click:deleteCargo", crg);
      }
    });
  });

  ipcRenderer.on("map:addMarker", (e, arg) => {
    ipcRenderer.send("cargoStatus:addMarker", arg);
  });
});
