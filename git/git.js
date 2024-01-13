Telegram.WebApp.ready();
var SERVER_ADDR = "";
var SERVER_PORT = "";

Telegram.WebApp.CloudStorage.getItem("ServerAddress", (error, value) => {
  if (error) {
    Telegram.WebApp.showAlert(
      "An error occurred while getting the server address"
    );
    return;
  }
  if (!value) {
    Telegram.WebApp.showAlert("No value found for server address!");
    return;
  }
  console.log("Retrieved server address from cloud storage:", value);
  SERVER_ADDR = value;
  SetupSocket();
});

Telegram.WebApp.CloudStorage.getItem("ServerPort", (error, value) => {
  if (error) {
    Telegram.WebApp.showAlert(
      "An error occurred while getting the server port"
    );
    return;
  }
  if (!value) {
    Telegram.WebApp.showAlert("No value found for server port!");
    return;
  }
  console.log("Retrieved server port from cloud storage:", value);
  SERVER_PORT = value;
  SetupSocket();
});

var socket = null;

function SetupSocket() {
  if (SERVER_ADDR != "" && SERVER_PORT != "" && socket == null) {
    socket = io("wss://" + SERVER_ADDR + ":" + SERVER_PORT);
  }
  currURL = window.location.href.split("/")
  if (currURL[currURL.length-1] === "load-project.html") {
    LoadAvailableProjects();
  }
}

function LoadAvailableProjects() {
  if (!socket.connected) {
    LoadAvailableProjects();
    return;
  }
  Dropdown = document.getElementById("ProjectsDropdown");
  Spinner = document.getElementById("spinner");
  socket.emit("GetAvailableProjects", "");
  socket.on("ListAvailableProjects", (arg, callback) => {
    Spinner.style.display = "none";
    arg["Projects"].forEach(element => {
      var opt = document.createElement("option");
      opt.value = element;
      opt.innerHTML = element;
      Dropdown.appendChild(opt);
    });
  });
}

function Clone() {
  if (!socket.connected) {
    Telegram.WebApp.showAlert(
      "Something is wrong with the server connection, Please check your settings and try again!"
    );
    return;
  }
  ProgressBar = document.getElementById("GitProgressBar");
  ProgressPercentage = document.getElementById("GitProgressPercentage");
  CloneURL = document.getElementById("CloneURLInput");
  CloneDir = document.getElementById("CloneDirInput");

  var xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    "https://" + SERVER_ADDR + ":" + SERVER_PORT + "/git/clone",
    true
  );
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(
    JSON.stringify({
      URL: CloneURL.value,
      Directory: CloneDir.value,
    })
  );

  ProgressBar.style.display = "inline";
  ProgressPercentage.style.display = "inline";
  ProgressBar.removeAttribute("value");
  CloneURL.disabled = "true";
  CloneDir.disabled = "true";
  socket.on("CloneMaxProgress", (arg, callback) => {
    ProgressBar.max = arg;
  });
  socket.on("CloneStatus", (arg, callback) => {
    ProgressBar.style.display = "none";
    ProgressPercentage.style.display = "none";
    CloneURL.removeAttribute("disabled");
    CloneDir.removeAttribute("disabled");
    console.log(arg);
    if (arg["data"] === "Success") {
      var data = {
        type: "Load",
      };
      if (CloneDir.value === "") {
        gitName =
          CloneURL.value.split("/")[CloneURL.value.split("/").length - 1];
        data["Project"] =
          gitName.substring(0, gitName.lastIndexOf(".git")) || gitName;
      } else {
        data["Project"] =
          CloneDir.value.split("/")[CloneURL.value.split("/").length - 1];
      }
      Telegram.WebApp.CloudStorage.setItem("LoadedProject", data["Project"]);
      Telegram.WebApp.sendData(JSON.stringify(data));
      Telegram.WebApp.close();
      return;
    }
    Telegram.WebApp.showAlert(
      "Error occurred while cloning the repository: " + arg["data"]
    );
  });
  socket.on("CloneProgress", (arg, callback) => {
    ProgressBar.value = arg;
    ProgressPercentage.innerHTML =
      String(Math.round((arg / ProgressBar.max) * 100 * 100) / 100) + "%";
  });
}
