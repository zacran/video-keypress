import React from "react";
import Keybinds from "./Keybinds";
import "../App.css";

const KeybindMenu = (props) => {
  let state = props.state;
  return (
    <div className="Menu inline">
      {state.isPlaying === false && state.playedSeconds === 0 && (
        <button className="inline">Start (Space)</button>
      )}
      {state.isPlaying === true && (
        <button className="inline">Pause (Space)</button>
      )}
      {state.isPlaying === false && state.playedSeconds > 0 && (
        <button className="inline">Resume (Space)</button>
      )}
      <Keybinds keybinds={state.keybinds} />
    </div>
  );

}

export default KeybindMenu;