const SPACE_KEYS = ['32', ' '];
const G_KEYS = ['71', 'g'];
const S_KEYS = ['83', 's'];

export function checkKeycodeSpace(key) {
    return checkKeycode(key, SPACE_KEYS);
}

export function checkKeycodeG(key) {
    return checkKeycode(key, G_KEYS);
}

export function checkKeycodeS(key) {
    return checkKeycode(key, S_KEYS);
}

export function checkKeycode(key, keycode) {
    if (keycode.includes(String(key))) return true;

    return false;
}