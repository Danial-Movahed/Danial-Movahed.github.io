const SERVER_ADDR = "127.0.0.1";
const SERVER_PORT = "5000";
const socket = io("ws://" + SERVER_ADDR + ":" + SERVER_PORT);

function clone() {
    progress = document.getElementById("GitProgress");
  
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://" + SERVER_ADDR + ":" + SERVER_PORT + "/git/clone", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        URL: "https://github.com/Danial-Movahed/SOAS",
        Directory: "/home/danial/asghar"
    }));
  
    progress.style.display = "inline";
    progress.removeAttribute("value");
    socket.on("CloneMaxProgress", (arg, callback) => {
      progress.max = arg;
      console.log(arg);
    });
    socket.on("CloneStatus", (arg, callback) => {
      console.log(arg);
    });
    socket.on("CloneProgress", (arg, callback) => {
      console.log(arg);
      progress.value = arg;
    });
  }