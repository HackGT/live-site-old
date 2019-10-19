<script>
  if (document.getElementById("map")) {
    const map = new MapGT("../assets/klaus.svg");
    const BUZZER_URL = "0.0.0.0:3000";
    // const socket = io(BUZZER_URL);

    window.onload = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const building = queryParams.get("building")
      const room = queryParams.get("room")
      const view = queryParams.get("view");

      map.setActiveView(view);
      map.setDefaultPin("./location-pin.svg");
    }

    async function dropPinAtId(id) {
      const center = await map.findCenter(id);
      map.dropPinAt(center[0], center[1]);
    }

    socket.on("buzzer_message", function(msg) {
        console.dir(msg);
        map.setActiveView(msg.area);
        map.popupAt(Math.floor(Math.random() * 500), Math.floor(Math.random() * 500));

    });

    function resetUI() {
      clearMessages();
    }

    // Add a message to the messages element.
    function appendMessage(payload) {
      const messagesElement = document.querySelector("#messages");
      const dataHeaderELement = document.createElement("h5");
      const dataElement = document.createElement("pre");
      dataElement.style = "overflow-x:hidden;";
      dataHeaderELement.textContent = "Received message:";
      dataElement.textContent = JSON.stringify(payload, null, 2);
      messagesElement.appendChild(dataHeaderELement);
      messagesElement.appendChild(dataElement);
    }

    // Clear the messages element of all children.
    function clearMessages() {
      const messagesElement = document.querySelector("#messages");
      while (messagesElement.hasChildNodes()) {
        messagesElement.removeChild(messagesElement.lastChild);
      }
    }

    resetUI();
  }
</script>
