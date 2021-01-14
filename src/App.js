import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import 'fontsource-roboto';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Chart from "./components/Chart"
import CancelIcon from '@material-ui/icons/Cancel';
import ReactPlayer from "react-player";
import useEventListener from "@use-it/event-listener";
import KeybindMap from "./hooks/keybindMap"
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import MovieIcon from '@material-ui/icons/Movie';
import GetAppIcon from '@material-ui/icons/GetApp';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';

const SPACE_KEYS = ['32', ' '];

const useStyles = makeStyles((theme) => ({
    popoverMenu: {
        width: '200px'
    },
    slider: {
        margin: '0px 20px',
        width: '80%'
    },
    button: {
        padding: 0,
    },
    smallButton: {
        marginTop: -4,
        padding: 4,
        '& svg': {
            fontSize: 18
        }
    },
    largeButton: {
        display: 'block',
        margin: 'auto',
        '& svg': {
            fontSize: 144,
            color: "#469FAE"
        }
    },
    toolbar: {
        minHeight: 48,
        maxHeight: 48,
    },
    title: {
        flexGrow: 1,
    },
    menu: {
        width: 'fit-content',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        '& svg': {
            margin: theme.spacing(1.5),
        },
        '& hr': {
            margin: theme.spacing(0, 0.5),
        },
    },
}));

const StyledMenu = withStyles({
    paper: {
        border: '1px solid #d3d4d5',
        width: '200px',
        margin: '0px 10px',
    }
})((props) => (
    <Menu
        elevation={0}
        getContentAnchorEl={null}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
));

const StyledMenuItem = withStyles((theme) => ({
    root: {
        '&:focus': {
            backgroundColor: theme.palette.primary.main,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.common.white,
            },
        },
    },
}))(MenuItem);

const App = () => {
    var isPlayingBuffer = false;
    const [state, setState] = useState({
        videoFilePath: '',
        isPlaying: false,
        duration: 0,
        playedSeconds: 0,
        loadedSeconds: 0,
        playbackRate: 1,
        keybinds: KeybindMap.Keybinds,
        data: {
            metadata: {},
            events: []
        }, // persisted data records
        activeRecords: [], // activity record between keypress down and keypress up
        derivedFields: []
    });

    function resetVideo() {
        var confirmReset = window.confirm("Are you sure you wish to reset the video? Unsaved data will be lost.");
        if (confirmReset) {
            hiddenInput.current.value = "";
            setState({ ...state, videoFilePath: '', videoFileName: '', data: { metadata: {}, events: [] } });
        }
    };

    const handleDuration = (duration) => {
        setState({ ...state, duration: duration });
    };

    const handleProgress = (progress) => {
        setState({ ...state, playedSeconds: progress.playedSeconds, loadedSeconds: progress.loadedSeconds });
    };

    const handleVideoUpload = (event) => {
        var uploadedFile = event.target.files[0];
        if (uploadedFile) {
            var video = document.createElement('video');
            var videoFilePath = URL.createObjectURL(uploadedFile);
            video.src = videoFilePath;
            video.addEventListener('loadedmetadata', function () {
                var duration = parseFloat(video.duration.toFixed(2));
                setState({
                    ...state,
                    videoFilePath: videoFilePath,
                    videoFileName: event.target.files[0].name,
                    data: {
                        metadata: {
                            fileName: event.target.files[0].name,
                            scoringDate: Date.now(),
                            scoringDateText: new Date().toISOString(),
                            duration: duration
                        },
                        events: []
                    }
                });
                document.activeElement.blur();
            });
        }
    };

    const handleDownloadData = () => {
        if (state.data.events && state.data.events.length > 0) {
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.data));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", state.videoFileName + "-scored-behavior.json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    };

    const handleIsPlayingUpdate = () => {
        isPlayingBuffer = !isPlayingBuffer;
    };

    const handleOnStartPlay = () => {
        setState({ ...state, isPlaying: true });
    };

    const handleOnPauseStop = () => {
        setState({ ...state, isPlaying: false });
    };

    const handleKeydown = (event) => {
        if (state.videoFilePath !== '' && SPACE_KEYS.includes(String(event.key))) {
            console.log("space " + event.key, state);
            event.preventDefault();
            handleIsPlayingUpdate();
        } else if (state.isPlaying) {
            handleKeyevent(event.key, recordKeydown);
        }
    };

    const handleKeyup = ({ key }) => {
        handleKeyevent(key, recordKeyup);
    };

    const handleKeyevent = (key, callback) => {
        console.log("press " + key, state);
        state.keybinds.forEach(function (keybind) {
            if ((keybind.key === (String(key)) || keybind.code === (String(key)))) {
                callback(keybind);
            }
        });
    };

    const getPlaybackRate = (value) => {
        return `${value}x`;
    };

    const handlePlaybackRateChange = (event, value) => {
        if (value != state.playbackRate)
            setState({ ...state, playbackRate: parseFloat(value) })
    };

    const recordKeydown = (keybind) => {
        if (!keybind.active) {
            keybind.active = true;
            console.log("key down: " + keybind.key + " at " + state.playedSeconds + " secs");

            let activity = {
                key: keybind.key,
                behavior: keybind.behavior,
                start: state.playedSeconds
            };

            let activeRecords = state.activeRecords;
            activeRecords.push(activity);
            setState({ ...state, activeRecords: activeRecords });
            console.log("recorded activity start: ", activity);
            console.log(state.activeRecords);
        }
    };

    const recordKeyup = (keybind) => {
        let activity = state.activeRecords.find(obj => { return obj.key === keybind.key });
        let activeRecords = state.activeRecords.filter(obj => obj.key !== keybind.key);

        if (activity) {
            keybind.active = false;
            console.log("key up: " + keybind.key + " at " + state.playedSeconds + " secs");

            activity.id = state.data.events.length;
            activity.end = state.playedSeconds;

            console.log("recorded activity end: ", activity);
            console.log(state.activeRecords);

            let dataEvents = state.data.events;
            dataEvents.push(activity);

            setState({
                ...state,
                activeRecords: activeRecords,
                data: {
                    events: dataEvents,
                    metadata: {
                        ...state.data.metadata
                    }
                }
            });
            console.log(state.data);
        }
    };

    useEventListener('keydown', handleKeydown);
    useEventListener('keyup', handleKeyup);

    const classes = useStyles();
    const hiddenInput = useRef(null);
    const keybindMenu = useRef(null);

    const [anchorKeybinds, setAnchorKeybinds] = useState(null);
    const [anchorSettings, setAnchorSettings] = useState(null);

    const handleKeybindMenuClick = (event) => {
        setAnchorKeybinds(event.currentTarget);
    };

    const handleKeybindMenuClose = () => {
        setAnchorKeybinds(null);
    };

    const handleSettingsClick = (event) => {
        setAnchorSettings(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setAnchorSettings(null);
    };


    return (
        <div className="App">
            <input type="file" ref={hiddenInput} onChange={handleVideoUpload} style={{ display: 'none' }} />
            <StyledMenu
                className={classes.popoverMenu}
                anchorEl={anchorSettings}
                keepMounted
                open={Boolean(anchorSettings)}
                onClose={handleSettingsClose}>

                {/* <Typography id="discrete-slider" gutterBottom>Playback Speed</Typography> */}
                <ListItemText id="playbackRate-slider" primary="Playback Speed" align="center" />
                <Slider
                    key={`playbackRate-slider`}
                    className={classes.slider}
                    value={state.playbackRate || 1}
                    getAriaValueText={getPlaybackRate}
                    aria-labelledby="playbackRate-slider"
                    step={0.25}
                    marks
                    min={0.25}
                    max={2}
                    valueLabelDisplay="auto"
                    onChange={handlePlaybackRateChange}
                />

            </StyledMenu>
            <StyledMenu
                className={classes.popoverMenu}
                anchorEl={anchorKeybinds}
                keepMounted
                open={Boolean(anchorKeybinds)}
                onClose={handleKeybindMenuClose}>
                <StyledMenuItem>
                    {state.isPlaying === false && state.playedSeconds === 0 && (
                        <ListItemText primary="Start" secondary="space" align="center" />
                    )}
                    {state.isPlaying === true && (
                        <ListItemText primary="Pause" secondary="space" align="center" />
                    )}
                    {state.isPlaying === false && state.playedSeconds > 0 && (
                        <ListItemText primary="Resume" secondary="space" align="center" />
                    )}
                </StyledMenuItem>
                {state.keybinds.map((keybind) =>
                    <StyledMenuItem key={keybind.key}>
                        <ListItemText primary={keybind.behavior} secondary={keybind.key} align="center" />
                    </StyledMenuItem>
                )}
                {/* <StyledMenuItem>
                    <ListItemIcon>
                        <AddCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText secondary="Add Keybind" align="center" />
                </StyledMenuItem> */}
            </StyledMenu>
            <AppBar position="static" style={{ background: '#469FAE' }}>
                <Toolbar className={classes.toolbar}>
                    <Typography variant="h5" component="h1" className={classes.title}>Behavior Recorder</Typography>
                    <Grid container alignItems="center" className={classes.menu}>
                        <Tooltip title="Select Video">
                            <IconButton aria-label="select video" color="inherit" className={classes.button} onClick={(e) => hiddenInput.current.click()}>
                                <MovieIcon />
                            </IconButton>
                        </Tooltip>
                        <Divider orientation="vertical" flexItem />
                        <Tooltip title="Download Data">
                            <IconButton aria-label="download data"
                                color="inherit"
                                className={classes.button}
                                onClick={handleDownloadData}>
                                <GetAppIcon />
                            </IconButton>
                        </Tooltip>
                        <Divider orientation="vertical" flexItem />
                        <Tooltip title="Keybinds">
                            <IconButton aria-label="keybinds"
                                color="inherit"
                                aria-haspopup="true"
                                onClick={handleKeybindMenuClick}
                                className={classes.button}>
                                <KeyboardIcon />
                            </IconButton>
                        </Tooltip>
                        {/* <Divider orientation="vertical" flexItem />
                        <Tooltip title="Data">
                            <IconButton aria-label="data" color="inherit" className={classes.button}>
                                <FolderIcon />
                            </IconButton>
                        </Tooltip> */}
                        <Divider orientation="vertical" flexItem />
                        <Tooltip title="Settings">
                            <IconButton aria-label="settings"
                                color="inherit"
                                aria-haspopup="true"
                                onClick={handleSettingsClick}
                                className={classes.button}>
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Toolbar>
            </AppBar>
            {state.videoFilePath ?
                <Typography variant="button" display="block" align="center" gutterBottom>
                    Current Video: {state.videoFileName}
                    <Tooltip title="Unset Video">
                        <IconButton aria-label="unset video" color="inherit" className={classes.smallButton} onClick={resetVideo}>
                            <CancelIcon />
                        </IconButton>
                    </Tooltip>
                </Typography>
                : ""}
            {!state.videoFilePath ?
                <div>
                    <Typography variant="button" display="block" align="center" gutterBottom>
                        No video selected
                    </Typography>
                    <Tooltip title="Select Video">
                        <IconButton aria-label="select video" color="inherit" className={classes.largeButton} onClick={(e) => hiddenInput.current.click()}>
                            <MovieIcon />
                        </IconButton>
                    </Tooltip>
                </div>
                : ""}
            <div className="Row">
                <div className="VideoPlay">
                    <ReactPlayer url={state.videoFilePath}
                        className="ReactPlayer"
                        playing={isPlayingBuffer}
                        width="840px"
                        height="100%"
                        controls={true}
                        onDuration={handleDuration}
                        onProgress={handleProgress}
                        playbackRate={state.playbackRate || 1}
                        onPause={handleOnPauseStop}
                        onStop={handleOnPauseStop}
                        onStart={handleOnStartPlay}
                        onPlay={handleOnStartPlay}
                    />
                    <div className="Row">
                        <Chart state={state} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;