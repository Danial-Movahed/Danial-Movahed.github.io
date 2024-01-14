var SERVER_ADDR = "";
var SERVER_PORT = "";
var socket = null;
var currentProject = "";
var currentlyRunning = false;

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
    currentProject = value;
    document.getElementById("ProjectNameDisplay").innerHTML = currentProject;
  });
  SetupServer();
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
    SetupMonitors();
  }
}

function SetupMonitors() {
  if (!socket.connected) {
    setTimeout(SetupMonitors, 1000);
    return;
  }
  socket.on("RunningStatus", (arg, callback) => {
    StartBtn = document.getElementById("StartBuildBtn");
    RunningStatus = document.getElementById("RunningStatus");
    KillBtn = document.getElementById("KillBuildBtn");
    StopBtn = document.getElementById("StopBuildBtn");
    CleanBtn = document.getElementById("CleanBtn");
    if (arg["data"]) {
      StartBtn.innerHTML = "Started build";
      StartBtn.disabled = true;
      RunningStatus.innerHTML = "Running";
      currentlyRunning = true;
      KillBtn.removeAttribute("disabled");
      StopBtn.removeAttribute("disabled");
      CleanBtn.disabled=true;
      return;
    }
    RunningStatus.innerHTML = "Not Running";
    StartBtn.innerHTML = "Start build!";
    KillBtn.innerHTML = "Kill build!";
    StopBtn.innerHTML = "Stop build!";
    StartBtn.removeAttribute("disabled");
    CleanBtn.removeAttribute("disabled");
    KillBtn.disabled=true;
    StopBtn.disabled=true;
    currentlyRunning = false;
  });
  socket.on("SystemUsageStat", (arg, callback) => {
    CPUPercentage = arg["CPU"];
    MemPercentage = arg["Memory"];
    DiskPercentage = arg["Disk"];
    document
      .getElementById("CPUPercentage")
      .setAttribute("stroke-dashoffset", 314 * ((100 - CPUPercentage) / 100));
    document.getElementById("CPUPercentageText").innerHTML =
      CPUPercentage + "%";
    document
      .getElementById("MemPercentage")
      .setAttribute("stroke-dashoffset", 314 * ((100 - MemPercentage) / 100));
    document.getElementById("MemPercentageText").innerHTML =
      MemPercentage + "%";
    document
      .getElementById("DiskPercentage")
      .setAttribute("stroke-dashoffset", 314 * ((100 - DiskPercentage) / 100));
    document.getElementById("DiskPercentageText").innerHTML =
      DiskPercentage + "%";
  });
  SetupLogs();
  CheckRunning();
  GetBuildCMD();
}

function GetBuildCMD() {
  BuildCMD = document.getElementById("BuildCMD")
  socket.emit("GetBuildCMD", {})
  socket.on("BuildCMD", (arg, callback) => {
    BuildCMD.value = arg["cmd"]
  })
}

function CheckRunning() {
  socket.emit("CheckRunningStatus", { Project: currentProject });
}

function SetupLogs() {
  latestLog = document.getElementById("LatestLog");
  latestError = document.getElementById("LatestError");
  LogDisplay = document.getElementById("LogDisplay");
  socket.on("BuildLog", (arg, callback) => {
    console.log(arg);
    latestLog.innerHTML = arg["line"];
    line = document.createElement("p");
    line.classList.add("log");
    line.innerHTML = arg["line"];
    LogDisplay.appendChild(line);
    LogDisplay.scrollTo(0, LogDisplay.scrollHeight);
  });
  socket.on("BuildError", (arg, callback) => {
    console.log(arg);
    latestError.innerHTML = arg["line"];
    line = document.createElement("p");
    line.classList.add("log");
    line.classList.add("error");
    line.innerHTML = arg["line"];
    LogDisplay.appendChild(line);
    LogDisplay.scrollTo(0, LogDisplay.scrollHeight);
  });
}

function HideAll() {
  document.getElementById("DashboardDisplay").style.display = "none";
  document.getElementById("StatsDisplay").style.display = "none";
  document.getElementById("OutputDisplay").style.display = "none";
  document.getElementById("ConsoleDisplay").style.display = "none";
  document.getElementById("SettingsDisplay").style.display = "none";
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
  document.getElementById("ConsoleDisplay").style.display = "flex";
}

function ShowSettings() {
  HideAll();
  document.getElementById("SettingsDisplay").style.display = "flex";
}

function UnloadProject() {
  var data = {
    type: "Unload",
    Project: currentProject,
  };
  Telegram.WebApp.CloudStorage.removeItem("LoadedProject");
  Telegram.WebApp.sendData(JSON.stringify(data));
  Telegram.WebApp.close();
}

function StartConsole() {
  ConsolePort = document.getElementById("ConsolePort").value;
  ConsoleBar = document.getElementById("ConsoleStartBar");
  re =
    /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;
  if (!re.test(ConsolePort)) {
    Telegram.WebApp.showAlert("Enter port number correctly.");
    return;
  }
  ConsoleBar.style.display = "block";
  socket.emit("Console", { data: "Start", port: ConsolePort });
  socket.on("ConsoleStarted", (arg, callback) => {
    Telegram.WebApp.showAlert(
      "Console started on port " +
        ConsolePort +
        ". If the console does not work, try the change the port and check if ttyd is installed in the backend server."
    );
    ConsoleBar.style.display = "none";
    Telegram.WebApp.sendData(
      JSON.stringify({
        type: "ConsoleStart",
        URL: "http://" + SERVER_ADDR + ":" + ConsolePort,
      })
    );
    Telegram.WebApp.close();
  });
}

function StartBuild() {
  StartBtn = document.getElementById("StartBuildBtn");
  StartBtn.disabled = true;
  StartBtn.innerHTML = "Starting Build...";
  socket.emit("StartBuild", { Project: currentProject });
}

function StopBuild() {
  Telegram.WebApp.showConfirm(
    "Are you sure you want to stop this build?",
    (state) => {
      if (!state) return;
      socket.emit("StopBuild", { Project: currentProject });
      StopBtn = document.getElementById("StopBuildBtn");
      StopBtn.disabled = true;
      StopBtn.innerHTML = "Stopping build...";
    }
  );
}

function KillBuild() {
  Telegram.WebApp.showConfirm(
    "Are you sure you want to kill this build?",
    (state) => {
      if (!state) return;
      if (!currentlyRunning) return;
      socket.emit("KillBuild", { Project: currentProject });
      KillBtn = document.getElementById("KillBuildBtn");
      KillBtn.disabled = true;
      KillBtn.innerHTML = "Killing build...";
    }
  );
}

function CleanProject() {
  Telegram.WebApp.showConfirm(
    "Are you sure you want to clean this project?",
    (state) => {
      if (!state) return;
      if (!currentProject) return;
      socket.emit("CleanProject", { Project: currentProject });
      CleanBtn = document.getElementById("CleanBtn");
      CleanBtn.disabled = true;
      CleanBtn.innerHTML = "Cleaning...";
      socket.on("CleanProjectStatus", (arg, callback) => {
        if (arg["data"]) {
          CleanBtn.innerHTML = "Clean Project";
          CleanBtn.removeAttribute("disabled");
        }
      });
    }
  );
}

function SetBuildCommand() {
  BuildCMD=document.getElementById("BuildCMD");
  BuildBtn = document.getElementById("BuildApplyBtn");
  BuildBtn.innerHTML = "Applying";
  socket.emit("SetBuildCMD", {"cmd": BuildCMD.value})
  socket.on("ConfirmSetBuildCMD", (arg, callback) => {
    Telegram.WebApp.showAlert("Successfully set build command!")
  })
}