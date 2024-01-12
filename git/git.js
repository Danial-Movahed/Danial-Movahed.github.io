const SERVER_ADDR = "";
const SERVER_PORT = "";

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
});

const socket = null;

function clone() {
  if(socket === null) {
    socket = io("wss://" + SERVER_ADDR + ":" + SERVER_PORT);
  }
  if (!socket.connected) {
    Telegram.WebApp.showAlert(
      "Something is wrong with the server connection, Please check your settings and try again!"
    );
    return;
  }
  ProgressBar = document.getElementById("GitProgressBar");
  ProgressPercentage = document.getElementById("GitProgressPercentage");

  var xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    "http://" + SERVER_ADDR + ":" + SERVER_PORT + "/git/clone",
    true
  );
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(
    JSON.stringify({
      URL: document.getElementById("CloneURLInput").value,
      Directory: document.getElementById("CloneDirInput").value,
    })
  );

  ProgressBar.style.display = "inline";
  ProgressPercentage.style.display = "inline";
  ProgressBar.removeAttribute("value");
  socket.on("CloneMaxProgress", (arg, callback) => {
    ProgressBar.max = arg;
  });
  socket.on("CloneStatus", (arg, callback) => {
    ProgressBar.style.display = "none";
    ProgressPercentage.style.display = "none";
    console.log(arg);
    if (arg === "Success") {
      return;
    }
    Telegram.WebApp.showAlert(
      "Error occurred while cloning the repository: " + arg
    );
  });
  socket.on("CloneProgress", (arg, callback) => {
    ProgressBar.value = arg;
    ProgressPercentage.innerHTML =
      String(Math.round((arg / ProgressBar.max) * 100 * 100) / 100) + "%";
  });
}
