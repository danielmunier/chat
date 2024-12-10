const socket = io();

let username = 'Anônimo';  // Valor inicial, caso o usuário não tenha setado um nickname

const mainContent = document.getElementById("main-content");
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const form = document.getElementById("form");

const usernameForm = document.getElementById("usernameForm");
const usernameInput = document.getElementById("username");

window.addEventListener('DOMContentLoaded', () => {
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) {
        socket.emit("setUsername", savedNickname); // Envia o nickname ao servidor
        mainContent.classList.remove("hidden");
        usernameForm.classList.add("hidden");
    }
});

usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    socket.emit("setUsername", usernameInput.value);
    localStorage.setItem("nickname", usernameInput.value); // Salva o nickname no localStorage
    console.log(mainContent);
    mainContent.classList.remove("hidden");
    usernameForm.classList.add("hidden");
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit("message", input.value);  // Envia a mensagem para o servidor
        input.value = "";  // Limpa o campo de input
    }
});

function scrollToBottom() {
    const lastMessage = messages.lastElementChild;  // Última mensagem na lista
    if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

// Recebe o histórico de mensagens ao se conectar
socket.on("messageHistory", (history) => {
    history.forEach((msg) => {
        const li = document.createElement('li');
        li.textContent = msg;
        li.className = "";  // Adicione um estilo padrão às mensagens
        messages.appendChild(li);
    });
    scrollToBottom();  // Rola para a última mensagem
});

// Recebe uma nova mensagem do servidor e exibe
socket.on("message", (msg) => {
    const li = document.createElement('li');
    li.textContent = msg;
    li.className = "";  // Adicione um estilo padrão às mensagens
    messages.appendChild(li);
    scrollToBottom();  // Rola para a última mensagem
});
