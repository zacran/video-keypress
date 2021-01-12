import React, { Component } from 'react';
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color';

class KeybindElement extends Component {
    state = {
        displayColorPicker: false
    };

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };

    handleChange = (color) => {
        this.setState({ color: color.rgb })
    };
    render() {
        const styles = reactCSS({
            'default': {
                color: {
                    width: '14px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `rgba(${this.props.keybind.color.r}, ${this.props.keybind.color.g}, ${this.props.keybind.color.b}, ${this.props.keybind.color.a})`,
                },
                swatch: {
                    padding: '2px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });
        return (
            <button className={`keybind inline-block ${this.props.keybind.active ? "button-active" : ""}`} >
                <div className="inline swatch" style={styles.swatch} onClick={this.handleClick}>
                    <div style={styles.color} />
                </div>
                <div className="inline-block"> {this.props.keybind.behavior}</div>
                <div className="inline-block"> ({this.props.keybind.key})</div>

                { this.state.displayColorPicker ? <div style={styles.popover}>
                    <div style={styles.cover} onClick={this.handleClose} />
                    <SketchPicker color={this.props.keybind.color} onChange={this.handleChange} />
                </div> : null}
            </button>
        );
    }
}

export default KeybindElement;