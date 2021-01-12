import { useState } from "react";
import useEventListener from "@use-it/event-listener";

const SPACE_KEYS = ['32', ' '];
const G_KEYS = ['71', 'g'];
const S_KEYS = ['83', 's'];

const useKeypress = () => {
    const [key, setKey] = useState("");
    function handler({ key }) {
        if (SPACE_KEYS.includes(String(key))) {
            console.log("space");
        }
        if (G_KEYS.includes(String(key))) {
            console.log("g");
        }
        if (S_KEYS.includes(String(key))) {
            console.log("s");
        }
        setKey(key);
    }

    useEventListener('keydown', handler);

    return key;
}

export default useKeypress;