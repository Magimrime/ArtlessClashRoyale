import { MP_API_BASE } from '../config.js';

export default class MultiplayerManager {
    constructor(gameEngine) {
        this.eng = gameEngine;

        this.eventSource = null;
        this.code = null;
        this.isHost = false;

        // Callbacks
        this.onJoined = null;
        this.onStart = null;
        this.onOpponentDisconnected = null;

        this.userId = localStorage.getItem('clash_user_id');
        if (!this.userId) {
            this.userId = 'user_' + Math.floor(Math.random() * 1000000000);
            localStorage.setItem('clash_user_id', this.userId);
        }

        this.seed = null;
        this.gameStarted = false;

        // null = unknown/not yet checked, true/false = result of the last probe.
        this.backendAvailable = null;

        // Lockstep Queues
        this.pendingRequests = []; // For Host to collect incoming requests
        this.framePulses = {}; // For Client to collect incoming frames { tick: { actions: [] } }
        this.highestReceivedTick = -1;
    }

    // Probe whether a multiplayer backend is actually reachable. Updates
    // this.backendAvailable (true/false) when the request settles.
    checkHealth() {
        this.backendAvailable = null;
        fetch(`${MP_API_BASE}/api/health`, { method: 'GET' })
            .then(res => { this.backendAvailable = res.ok; })
            .catch(() => { this.backendAvailable = false; });
    }

    createGame(callback) {
        fetch(`${MP_API_BASE}/api/create`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.code = data.code;
                    this.isHost = true;
                    this.setupSSE(callback);
                } else {
                    if (callback) callback(false, "Failed to create");
                }
            })
            .catch(err => {
                if (callback) callback(false, err.message);
            });
    }

    joinGame(code, callback) {
        this.code = code;
        this.isHost = false;
        // Verify room exists via SSE
        this.setupSSE(callback);
    }

    setupSSE(callback) {
        this.eventSource = new EventSource(`${MP_API_BASE}/api/join?code=${this.code}`);
        
        this.eventSource.onopen = () => {
            console.log("SSE Connection opened");
        };

        this.eventSource.onerror = (err) => {
            console.error("SSE Error:", err);
            // If we haven't started, it might be a join failure (404)
            if (!this.gameStarted && callback) {
                callback(false, "Failed to connect to room.");
                this.close();
            }
        };

        this.eventSource.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                this.handleMessage(msg);
                
                // First successful message means connection is good
                if (msg.type === 'joined' && callback) {
                    callback(true, this.code);
                    callback = null; // Don't call again
                }
            } catch (err) {
                console.error("Error parsing SSE data", err);
            }
        };
    }

    handleMessage(msg) {
        if (msg.type === 'joined') {
            if (this.onJoined) this.onJoined(msg.playerIndex);
        } else if (msg.type === 'start') {
            if (this.isHost && !this.gameStarted) {
                // Host dictates seed
                this.gameStarted = true;
                this.seed = Math.floor(Math.random() * 2147483647);
                this.sendAction({ type: 'init_start', seed: this.seed });
                if (this.onStart) this.onStart(this.seed);
            }
        } else if (msg.type === 'action') {
            const data = msg.data;
            if (data.type === 'init_start') {
                if (!this.isHost && !this.gameStarted) {
                    this.gameStarted = true;
                    this.seed = data.seed;
                    if (this.onStart) this.onStart(this.seed);
                }
            } else if (data.type === 'spawn_req') {
                if (this.isHost) {
                    this.pendingRequests.push(data);
                }
            } else if (data.type === 'frame_pulse') {
                if (!this.isHost) {
                    this.framePulses[data.tick] = data;
                    if (data.tick > this.highestReceivedTick) {
                        this.highestReceivedTick = data.tick;
                    }
                }
            }
        } else if (msg.type === 'opponent_disconnected') {
            if (this.onOpponentDisconnected) this.onOpponentDisconnected();
        }
    }

    sendAction(data) {
        data.code = this.code;
        fetch(`${MP_API_BASE}/api/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(err => console.error("Send Action Error:", err));
    }

    sendSpawnRequest(cardName, x, y, team) {
        this.sendAction({
            type: 'spawn_req',
            cardName: cardName,
            x: x,
            y: y,
            team: team
        });
    }

    // Host sends frame pulse
    sendFramePulse(tick, actions, state) {
        // Send a frame pulse representing the actions executed on this tick
        this.sendAction({
            type: 'frame_pulse',
            tick: tick,
            actions: actions,
            state: state
        });
    }

    // Host retrieves queued spawn requests for the current tick
    getQueuedRequests() {
        let reqs = [...this.pendingRequests];
        this.pendingRequests = [];
        return reqs;
    }

    // Client checks if frame data is available
    hasFramePulse(tick) {
        return this.framePulses[tick] !== undefined;
    }

    // Client consumes frame data
    getFramePulse(tick) {
        const pulse = this.framePulses[tick];
        delete this.framePulses[tick]; // Cleanup
        return pulse;
    }

    close() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}
