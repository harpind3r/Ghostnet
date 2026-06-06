const socket = io();
let currentRoom = null; 
let currentUser = null;
let replyingTo = null; 

const authPanel = document.getElementById('auth-panel'); 
const chatPanel = document.getElementById('chat-panel');
const terminal = document.getElementById('terminal'); 
const chatBox = document.getElementById('chat-box');
const watermark = document.getElementById('watermark');

function logTerminal(msg) {
    const p = document.createElement('p'); 
    p.innerText = msg;
    terminal.appendChild(p); 
    terminal.scrollTop = terminal.scrollHeight;
}

function getUserColor(username) {
    const colors = ['#00f3ff', '#00ff41', '#ff00ff', '#ffea00', '#ff7300', '#b829ff'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) { hash = username.charCodeAt(i) + ((hash << 5) - hash); }
    return colors[Math.abs(hash) % colors.length];
}

document.getElementById('btn-create').addEventListener('click', () => {
    const user = document.getElementById('username').value || 'GHOST_' + Math.floor(Math.random()*1000);
    currentUser = user; socket.emit('create_session', { username: user });
});

document.getElementById('btn-join').addEventListener('click', () => {
    const user = document.getElementById('username').value || 'GHOST_' + Math.floor(Math.random()*1000);
    const room = document.getElementById('join-code').value;
    if(!room) return alert('Enter a room code.');
    currentUser = user; socket.emit('join_session', { username: user, room_code: room });
});

socket.on('session_created', enterStealthMode);
socket.on('session_joined', enterStealthMode);

function enterStealthMode(data) {
    currentRoom = data.room; authPanel.classList.add('hidden'); chatPanel.classList.remove('hidden');
    document.getElementById('current-room').innerText = currentRoom; watermark.classList.remove('hidden');
    document.getElementById('wm-user').innerText = "USER: " + currentUser; document.getElementById('wm-room').innerText = "ROOM: " + currentRoom;
    logTerminal(`> Tunnel established. Encryption: ITD-Sym.`);
}

socket.on('terminal_log', (data) => logTerminal(data.msg));

document.getElementById('btn-send').addEventListener('click', sendTextMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') sendTextMessage(); });

function sendTextMessage() {
    const input = document.getElementById('message-input'); const rawText = input.value.trim();
    if(!rawText) return;
    const mutatedText = ITD.encode(rawText);
    socket.emit('send_message', { room: currentRoom, user: currentUser, type: 'text', data: mutatedText, id: 'msg_' + Date.now(), replyTo: replyingTo });
    input.value = ''; cancelReply(); 
}

socket.on('receive_message', (payload) => {
    const msgDiv = document.createElement('div'); msgDiv.className = 'message'; msgDiv.id = payload.id;
    let contentHTML = '';
    const userColor = getUserColor(payload.user);

    let replyBlockHTML = '';
    if (payload.replyTo) {
        replyBlockHTML = `
            <div class="reply-block" onclick="document.getElementById('${payload.replyTo.id}').scrollIntoView({behavior: 'smooth'})">
                <span style="color: ${getUserColor(payload.replyTo.user)}; font-size: 0.75rem; font-weight: bold;">↳ Replying to ${payload.replyTo.user}</span><br>
                <span class="micro-text" style="color: #fff;">${payload.replyTo.text.substring(0, 30)}...</span>
            </div>`;
    }

    if (payload.type === 'text') {
        // FIX: The raw payload.data is stored purely as innerText safely in the DOM
        contentHTML = `
            ${replyBlockHTML}
            <div class="content" id="raw_${payload.id}">${payload.data}</div>
            <div>
                <button class="btn-translate" onclick="toggleText(this, '${payload.id}')">DECRYPT</button>
                <button class="btn-translate" onclick="initReply('${payload.id}', '${payload.user}')">REPLY</button>
            </div>
            <div class="translated-content" id="trans_${payload.id}"></div>`;
    } else if (payload.type === 'image') {
        contentHTML = `
            ${replyBlockHTML}
            <div style="color: var(--cyan); font-size: 0.8rem;">[ INCOMING IMAGE DATA ]</div>
            <img src="${payload.data}" class="chat-image" id="img_${payload.id}">
            <div>
                <button class="btn-translate" onclick="toggleStego(this, '${payload.id}')">EXTRACT</button>
                <button class="btn-translate" onclick="initReply('${payload.id}', '${payload.user}')">REPLY</button>
            </div>
            <div class="translated-content" id="trans_${payload.id}"></div>`;
    }

    msgDiv.innerHTML = `<div class="meta"><span style="color: ${userColor}; font-weight: bold;">[ ${payload.user} ]</span></div>${contentHTML}`;
    chatBox.appendChild(msgDiv); chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => { if(document.getElementById(payload.id)) document.getElementById(payload.id).remove(); }, 60000); 
});

window.initReply = function(msgId, user) {
    const rawTextElem = document.getElementById(`raw_${msgId}`);
    let snippet = rawTextElem ? rawTextElem.innerText : "[ ENCRYPTED IMAGE ]";
    replyingTo = { id: msgId, user: user, text: snippet };
    document.getElementById('reply-indicator').classList.remove('hidden');
    document.getElementById('reply-to-user').innerHTML = `REPLY TO: <span style="color: ${getUserColor(user)}; font-weight: bold;">[${user}]</span>`;
    document.getElementById('message-input').focus();
};

window.cancelReply = function() { replyingTo = null; document.getElementById('reply-indicator').classList.add('hidden'); };

window.toggleText = function(btn, id) {
    const transDiv = document.getElementById(`trans_${id}`);
    if (transDiv.style.display === 'block') { 
        transDiv.style.display = 'none'; 
        btn.innerText = "DECRYPT"; 
    } else { 
        // Read raw safely from DOM
        const rawMutatedText = document.getElementById(`raw_${id}`).innerText;
        transDiv.innerText = `[ DECRYPTED ]\n\n${ITD.decode(rawMutatedText)}`; 
        transDiv.style.display = 'block'; 
        btn.innerText = "HIDE"; 
        chatBox.scrollTop = chatBox.scrollHeight; 
    }
};

window.toggleStego = function(btn, id) {
    const transDiv = document.getElementById(`trans_${id}`);
    if (transDiv.style.display === 'block') { transDiv.style.display = 'none'; btn.innerText = "EXTRACT"; } 
    else { STEGO.decode(document.getElementById(`img_${id}`).src, (mutatedData) => { transDiv.innerText = `[ EXTRACTED ]\n\n${ITD.decode(mutatedData)}`; transDiv.style.display = 'block'; btn.innerText = "HIDE"; chatBox.scrollTop = chatBox.scrollHeight; }); }
};

const stegoModal = document.getElementById('stego-modal');
document.getElementById('btn-stego').addEventListener('click', () => stegoModal.classList.remove('hidden'));
document.getElementById('btn-stego-cancel').addEventListener('click', () => stegoModal.classList.add('hidden'));

document.getElementById('btn-stego-send').addEventListener('click', () => {
    const file = document.getElementById('stego-file').files[0]; const secretText = document.getElementById('stego-secret').value;
    if(!file || !secretText) return alert("Select an image and enter a secret message.");
    const sendBtn = document.getElementById('btn-stego-send'); sendBtn.innerText = "COMPRESSING..."; sendBtn.disabled = true;

    const reader = new FileReader();
    reader.onload = (e) => {
        STEGO.encode(e.target.result, ITD.encode(secretText), (stegoImageBase64) => {
            if(!stegoImageBase64) { sendBtn.innerText = "ENCODE"; sendBtn.disabled = false; return; }
            socket.emit('send_message', { room: currentRoom, user: currentUser, type: 'image', data: stegoImageBase64, id: 'msg_' + Date.now(), replyTo: replyingTo });
            stegoModal.classList.add('hidden'); logTerminal('> Payload injected & sent.');
            sendBtn.innerText = "ENCODE"; sendBtn.disabled = false;
            document.getElementById('stego-file').value = ''; document.getElementById('stego-secret').value = ''; cancelReply();
        });
    };
    reader.readAsDataURL(file);
});

const STEGO = {
    encode: function(imgBase64, text, callback) {
        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const img = new Image();
        img.onload = () => {
            const MAX_SIZE = 600; let width = img.width; let height = img.height;
            if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } 
            else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
            canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height);
            const imgData = ctx.getImageData(0, 0, width, height); const data = imgData.data;
            const secretData = unescape(encodeURIComponent(text + '|^|')); let binText = '';
            for (let i = 0; i < secretData.length; i++) binText += secretData[i].charCodeAt(0).toString(2).padStart(8, '0');
            if (binText.length > data.length / 4) { alert('Text is too long for this image!'); return callback(null); }
            for (let i = 0, dataIndex = 0; i < binText.length; i++, dataIndex += 4) { data[dataIndex] = (data[dataIndex] & 254) | parseInt(binText[i]); }
            ctx.putImageData(imgData, 0, 0); callback(canvas.toDataURL('image/png'));
        };
        img.src = imgBase64;
    },
    decode: function(imgBase64, callback) {
        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const img = new Image();
        img.onload = () => {
            canvas.width = img.width; canvas.height = img.height; ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); const data = imgData.data;
            let binText = ''; for (let i = 0; i < data.length; i += 4) binText += (data[i] & 1).toString();
            let secretText = '';
            for (let i = 0; i < binText.length; i += 8) {
                secretText += String.fromCharCode(parseInt(binText.slice(i, i + 8), 2));
                if (secretText.endsWith('|^|')) return callback(decodeURIComponent(escape(secretText.slice(0, -3))));
            }
            callback("[ERROR] No hidden message found.");
        };
        img.src = imgBase64;
    }
};

window.addEventListener('blur', () => document.body.classList.add('blur-active'));
window.addEventListener('focus', () => document.body.classList.remove('blur-active'));

window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') {
        alert('SECURITY ALERT: Screen capture attempt detected. Session flagged.');
        socket.emit('system_alert', { room: currentRoom, user: currentUser, msg: 'SCREENSHOT DETECTED BY ' + currentUser });
    }
});

socket.on('receive_alert', (data) => {
    const alertDiv = document.createElement('div'); alertDiv.className = 'system-alert';
    alertDiv.innerText = `⚠️ SECURITY BREACH: ${data.msg} ⚠️`; chatBox.appendChild(alertDiv); chatBox.scrollTop = chatBox.scrollHeight;
});

document.getElementById('btn-panic').addEventListener('click', () => { chatBox.innerHTML = ''; setTimeout(() => location.reload(), 1500); });
