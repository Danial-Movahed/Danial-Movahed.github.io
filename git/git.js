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
  if(SERVER_ADDR != "" && SERVER_PORT != "" && socket == null) {
    socket = io("wss://" + SERVER_ADDR + ":" + SERVER_PORT);
  }
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

  var xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    "https://" + SERVER_ADDR + ":" + SERVER_PORT + "/git/clone",
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
    arg = arg.split(" ");
    console.log(arg);
    if (arg[0] === "Success") {
      window.Telegram.WebApp.sendData(JSON.stringify(
        {
          "type": "Load",
          "Project": arg[1]
        }
      ));
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
