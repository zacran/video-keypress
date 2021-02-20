import React, { setGlobal } from 'reactn'
import ReactDOM from "react-dom";
import KeybindMap from "./keybindMap";
import App from "./App";

// Set an initial global state directly:
setGlobal({
    state: {
        dataFileName: '',
        isVideo: false,
        isPlaying: false,
        duration: 0,
        playedSeconds: 0,
        loadedSeconds: 0,
        playbackRate: 1,
        videoSize: '840px',
        keybinds: KeybindMap.Keybinds,
        data: {
            recordedEvents: 0,
            metadata: {},
            events: []
        },
        activeRecords: [],
        derivedFields: []
    }
});

ReactDOM.render(<App />, document.getElementById("root"));