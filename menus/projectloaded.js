var SERVER_ADDR = "";
var SERVER_PORT = "";
var socket = null;

document.addEventListener("DOMContentLoaded", function (event) {
  const showNavbar = (toggleId, navId, bodyId, headerId) => {
    const toggle = document.getElementById(toggleId),
      nav = document.getElementById(navId),
      bodypd = document.getElementById(bodyId),
      headerpd = document.getElementById(headerId);

    // Validate that all variables exist
    if (toggle && nav && bodypd && headerpd) {
      toggle.addEventListener("click", () => {
        // show navbar
        nav.classList.toggle("show");
        // change icon
        toggle.classList.toggle("bx-x");
        // add padding to body
        bodypd.classList.toggle("body-pd");
        // add padding to header
        headerpd.classList.toggle("body-pd");
      });
    }
  };

  showNavbar("header-toggle", "nav-bar", "body-pd", "header");

  /*===== LINK ACTIVE =====*/
  const linkColor = document.querySelectorAll(".nav_link");

  function colorLink() {
    if (linkColor) {
      linkColor.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    }
  }
  linkColor.forEach((l) => l.addEventListener("click", colorLink));

  Telegram.WebApp.ready();
  Telegram.WebApp.CloudStorage.getItem("LoadedProject", (error, value) => {
    if (error) {
      Telegram.WebApp.showAlert(
        "An error occurred while getting the loaded project"
      );
      Telegram.WebApp.close();
      return;
    }
    if (!value) {
      Telegram.WebApp.showAlert("No value found for loaded project!");
      Telegram.WebApp.close();
      return;
    }
    console.log("Retrieved loaded project from cloud storage:", value);
    document.getElementById("ProjectNameDisplay").innerHTML = value;
  });
  SetupServer();
  SetupMonitors();
  ShowDashboard();
});

function SetupServer() {
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
}

function SetupSocket() {
  if (SERVER_ADDR != "" && SERVER_PORT != "" && socket == null) {
    socket = io("wss://" + SERVER_ADDR + ":" + SERVER_PORT);
  }
}

function SetupMonitors() {
  socket.on("SystemMonitorStat", (arg, callback) => {
    CPUPercentage = arg["CPU"];
    MemPercentage = arg["Memory"];
    DiskPercentage = arg["Disk"];
    document
      .getElementById("CPUPercentage")
      .setAttribute("stroke-dashoffset", 628 * ((100 - CPUPercentage) / 100));
    document.getElementById("CPUPercentageText").innerHTML =
      CPUPercentage + "%";
    document
      .getElementById("MemPercentage")
      .setAttribute("stroke-dashoffset", 628 * ((100 - MemPercentage) / 100));
    document.getElementById("MemPercentageText").innerHTML =
      MemPercentage + "%";
    document
      .getElementById("DiskPercentage")
      .setAttribute("stroke-dashoffset", 628 * ((100 - DiskPercentage) / 100));
    document.getElementById("DiskPercentageText").innerHTML = DiskPercentage + "%";
  });
}

function HideAll() {
  document.getElementById("DashboardDisplay").style.display = "none";
  document.getElementById("StatsDisplay").style.display = "none";
  document.getElementById("OutputDisplay").style.display = "none";
  document.getElementById("ConsoleDisplay").style.display = "none";
}

function ShowDashboard() {
  HideAll();
  document.getElementById("DashboardDisplay").style.display = "inline";
}

function ShowStats() {
  HideAll();
  document.getElementById("StatsDisplay").style.display = "inline";
}

function ShowOutput() {
  HideAll();
  document.getElementById("OutputDisplay").style.display = "inline";
}

function ShowConsole() {
  HideAll();
  document.getElementById("ConsoleDisplay").style.display = "inline";
}
