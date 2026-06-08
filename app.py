from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room, emit
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ghostnet-temp-key-84839'

 
socketio = SocketIO(app, cors_allowed_origins="*", ping_interval=5, ping_timeout=10, max_http_buffer_size=1e8)

active_rooms = {}

def generate_room_code():
    part1 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=2))
    part2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=3))
    part3 = ''.join(random.choices(string.ascii_uppercase, k=5))
    return f"{part1}-{part2}-{part3}"

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('create_session')
def handle_create(data):
    username = data.get('username', 'Anonymous')
    room_code = generate_room_code()
    active_rooms[room_code] = {'users': 1}
    join_room(room_code)
    emit('session_created', {'room': room_code, 'username': username})
    emit('terminal_log', {'msg': f'> Session {room_code} initialized...'}, room=room_code)

@socketio.on('join_session')
def handle_join(data):
    username = data.get('username', 'Anonymous')
    room = data.get('room_code')
    
    if room in active_rooms:
        active_rooms[room]['users'] += 1
        join_room(room)
        emit('session_joined', {'room': room, 'username': username})
        emit('terminal_log', {'msg': f'> Secure relay established with {username}...'}, room=room)
    else:
        emit('error', {'msg': 'Room does not exist or has been destroyed.'})

@socketio.on('send_message')
def handle_message(data):
    room = data.get('room')
    emit('receive_message', data, room=room)

@socketio.on('system_alert')
def handle_alert(data):
    room = data.get('room')
    emit('receive_alert', data, room=room)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
