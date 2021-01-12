import React from "react";
import "../App.css";

import KeybindElement from "./KeybindElement";

const Keybinds = (props) => {
    return (
        <div className="Keybinds inline">
            <div className="Keybinds-display button">
                <div className="keybind-buttons">
                    {props.keybinds.map((keybind) =>
                        <KeybindElement key={keybind.key} keybind={keybind} />
                    )}
                </div>
            </div>

        </div>
    );

}

export default Keybinds;