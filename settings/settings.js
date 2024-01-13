function SetupServerInfo() {
  ServerIP = document.getElementById("ServerIP");
  ServerPort = document.getElementById("ServerPort");
  re =
    /\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b/;
  if (!re.test(ServerIP)) {
    Telegram.WebApp.showAlert("Enter server ip correctly.");
    return;
  }
  re =
    /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;
  if (!re.test(ServerPort)) {
    Telegram.WebApp.showAlert("Enter port number correctly.");
    return;
  }
  Telegram.WebApp.CloudStorage.setItem("ServerAddress", ServerIP.value);
  Telegram.WebApp.CloudStorage.setItem("ServerPort", ServerPort.value);
  Telegram.WebApp.sendData(JSON.stringify({"type":"InfoSet","Address":ServerIP.value,"Port":ServerPort.value}));
  Telegram.WebApp.close();
}
