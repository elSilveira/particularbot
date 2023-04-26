const chat = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const historiesDiv = document.getElementById("histories");

const OPENAI_API_KEY = "ADICIONE A SUA API KEY AQUI!!!!";


const histories = JSON.parse(localStorage.getItem('histories')) ?? [];
let history = [];
let selectedHistory;
addHistories()
async function addHistories() {
  const messageContainer = document.createElement("div");
  await histories.forEach(element => {
    let place = document.createElement("a");
    place.onclick = function () {
      selectedHistory = element.name;
      history = histories.filter(e => e.name === selectedHistory);
      history = history[0]?.history ?? []
      console.log(selectedHistory)
    }
    place.classList.add("history");
    place.textContent = element.name;
    messageContainer.appendChild(place);
  });

  historiesDiv.appendChild(messageContainer);
}

sendButton.addEventListener("click", sendMessage);

userInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const userMessage = userInput.value;
  if (userMessage.trim() === "") {
    return;
  }

  addMessage("user", userMessage);
  history.push({ role: 'user', content: userMessage });
  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: history
    })
  }).then((response) => response.json())
    .then((data) => {
      const chatbotMessage = data.choices[0].message.content;
      history.push({ role: 'assistant', content: chatbotMessage });
      addMessage("chatbot", chatbotMessage);
      addToHistories();
    })
    .catch(error => console.error(error));

  userInput.value = "";
}

function addToHistories() {
  if (selectedHistory) {
    histories = histories.filter(function (h) {
      if (h.name === selectedHistory) {
        h.history = history;
        return h;
      }
    });
  }
  else {
    selectedHistory = 'History ' + histories.length;
    histories.push({ name: selectedHistory, history: history });
  }
  localStorage.setItem('histories', JSON.stringify(histories))
}

function addMessage(sender, message) {
  const messageContainer = document.createElement("div");
  let place = document.createElement("pre");
  place.classList.add("message", sender);
  place.textContent = message;
  messageContainer.appendChild(place);
  chat.appendChild(messageContainer);
}