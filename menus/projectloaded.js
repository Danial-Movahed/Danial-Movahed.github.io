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
  ShowDashboard();
});

function HideAll() {
  document.getElementById("DashboardDisplay").style.display = "none";
  document.getElementById("StatsDisplay").style.display = "none";
  document.getElementById("OutputDisplay").style.display = "none";
  document.getElementById("ConsoleDisplay").style.display = "none";
}

function ShowDashboard() {
  HideAll();
  document.getElementById("DashboardDisplay").style.display = "flex";
}

function ShowStats() {
  HideAll();
  document.getElementById("StatsDisplay").style.display = "flex";
}

function ShowOutput() {
  HideAll();
  document.getElementById("OutputDisplay").style.display = "flex";
}

function ShowConsole() {
  HideAll();
  document.getElementById("ConsoleDisplay").style.display = "flex";
}
