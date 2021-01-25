import React, { useState, useRef } from "react";
import "./App.css";
import 'fontsource-roboto';
import packageJson from '../package.json';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Chart from "./components/Chart"
import CancelIcon from '@material-ui/icons/Cancel';
import ReactPlayer from "react-player";
import useEventListener from "@use-it/event-listener";
import KeybindMap from "./hooks/keybindMap"
import ImageIcon from '@material-ui/icons/Image';
import CodeIcon from '@material-ui/icons/Code';
import FolderIcon from '@material-ui/icons/Folder';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import BlockIcon from '@material-ui/icons/Block';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import GitHubIcon from '@material-ui/icons/GitHub';
import MovieIcon from '@material-ui/icons/Movie';
import GetAppIcon from '@material-ui/icons/GetApp';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';

const SPACE_KEYS = ['32', ' '];

const useStyles = makeStyles((theme) => ({
    content: {
        marginTop: '55px'
    },
    reactPlayer: {
        margin: 'auto'
    },
    slider: {
        margin: '0px 20px',
        width: '80%'
    },
    dataText: {
        height: '420px',
        width: '840px',
        overflow: 'scroll',
        margin: 'auto',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
    },
    button: {
        padding: 0,
    },
    smallButton: {
        '& svg': {
            color: "#469FAE"
        }
    },
    largeButton: {
        display: 'inline-block',
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
    restrictedText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        margin: '0px 10px',
        maxWidth: '300px'
    },
    title: {
        flexGrow: 1,
    },
    bottomAppBar: {
        top: 'auto',
        bottom: 0,
    },
    bottomToolbar: {
        margin: 'auto',
        minWidth: '700px',
        textAlign: 'center',
        minHeight: 32,
        maxHeight: 32,
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

const App = () => {
    var isPlayingBuffer = false;
    const [keybindInEdit, setKeybindInEdit] = useState({});
    const [anchorEditKeybinds, setAnchorEditKeybinds] = useState(null);
    const [state, setState] = useState({
        dataFileName: '',
        isVideo: false,
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

    const confirmVideoReset = () => {
        return window.confirm("Are you sure you wish to reset the existing video? Unsaved data will be lost.");
    };

    const resetData = () => {
        hiddenVideoUpload.current.value = "";
        setState({
            ...state,
            dataFileName: '',
            isVideo: false,
            isPlaying: false,
            data: {
                metadata: {},
                events: []
            }
        });
    };

    function resetVideo() {
        if (confirmVideoReset()) {
            resetData();
        }
    };

    const openEditKeybind = Boolean(anchorEditKeybinds);
    const handleTriggerEditKeybind = (event, keybind) => {
        setKeybindInEdit(keybind);
        setAnchorEditKeybinds(event.currentTarget);
    };
    const handleAcceptEditKeybind = (event, keybind) => {
        // setAnchorEditKeybinds(event.currentTarget);
        handleCancelEditKeybind();
    };
    const handleCancelEditKeybind = () => {
        setAnchorEditKeybinds(null);
    };

    const handleDuration = (duration) => {
        setState({ ...state, duration: duration });
    };

    const handleProgress = (progress) => {
        setState({ ...state, playedSeconds: progress.playedSeconds, loadedSeconds: progress.loadedSeconds });
    };

    const handleVideoSelect = (event) => {
        if (state.dataFileName !== '') {
            if (!confirmVideoReset()) {
                return;
            }
        }
        resetData();
        hiddenVideoUpload.current.click();
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
                    dataFileName: event.target.files[0].name,
                    isVideo: true,
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

    const handleDataSelect = () => {
        if (state.dataFileName !== '') {
            if (!confirmVideoReset()) {
                return;
            }
        }
        resetData();
        hiddenDataUpload.current.click();
    };

    const handleDataUpload = (event) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        var fileName = event.target.files[0].name;
        fileReader.onload = event => {
            // Validate data
            var obj = JSON.parse(event.target.result);
            if (obj.events && Array.isArray(obj.events) && obj.metadata && obj.metadata.fileName) {
                setState({ ...state, dataFileName: fileName, data: obj });
            } else {
                console.warn("Selected data not valid.")
            }
        };
    };

    const handleDownloadData = () => {
        if (state.data.events && state.data.events.length > 0) {
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.data));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", state.dataFileName + "-scored-behavior.json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    };

    const handleDownloadSVG = () => {
        if (state.data.events && state.data.events.length > 0) {
            var chartContainer = document.getElementById('chart-container');
            var svgData = chartContainer.getElementsByTagName('svg')[0].outerHTML;
            svgData = svgData.replace("<svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"");

            var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            var svgUrl = URL.createObjectURL(svgBlob);
            var downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = state.dataFileName + "-scored-behavior.svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const handleNavigateToGitHub = () => {
        window.open('https://github.com/zacran/video-keypress', '_blank');
    };

    // isPlayingBuffer will never allow starting a video with Space.
    // This is by design because of autoPlay restrictions in Chrome.
    // When video is started via Javascript, Chrome assumes it is 
    // autoplaying; user events such as adjusting the volume or fullsize controls can throw
    // the state variables out of sync as Chrome fires start/stop commands.
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
        if (state.videoFilePath !== '' && state.isVideo && SPACE_KEYS.includes(String(event.key))) {
            event.preventDefault();
            handleIsPlayingUpdate();
        } else if (state.isVideo && state.isPlaying) {
            handleKeyevent(event.key, recordKeydown);
        }
    };

    const handleKeyup = ({ key }) => {
        handleKeyevent(key, recordKeyup);
    };

    const handleKeyevent = (key, callback) => {
        // console.log("press " + key, state);
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
        if (value !== state.playbackRate)
            setState({ ...state, playbackRate: parseFloat(value) })
    };

    const recordKeydown = (keybind) => {
        if (!keybind.active) {
            keybind.active = true;
            // console.log("key down: " + keybind.key + " at " + state.playedSeconds + " secs");

            let activity = {
                key: keybind.key,
                behavior: keybind.behavior,
                order: keybind.order,
                start: parseFloat(state.playedSeconds.toFixed(3))
            };

            let activeRecords = state.activeRecords;
            activeRecords.push(activity);
            setState({ ...state, activeRecords: activeRecords });
        }
    };

    const recordKeyup = (keybind) => {
        let activity = state.activeRecords.find(obj => { return obj.key === keybind.key });
        let activeRecords = state.activeRecords.filter(obj => obj.key !== keybind.key);

        if (activity) {
            keybind.active = false;
            // console.log("key up: " + keybind.key + " at " + state.playedSeconds + " secs");

            activity.id = state.data.events.length;
            activity.end = parseFloat(state.playedSeconds.toFixed(3));

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
        }
    };

    useEventListener('keydown', handleKeydown);
    useEventListener('keyup', handleKeyup);

    const classes = useStyles();
    const hiddenVideoUpload = useRef(null);
    const hiddenDataUpload = useRef(null);

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
            <input type="file" ref={hiddenVideoUpload} onChange={handleVideoUpload} style={{ display: 'none' }} />
            <input type="file" ref={hiddenDataUpload} onChange={handleDataUpload} style={{ display: 'none' }} />
            <StyledMenu
                className={classes.popoverMenu}
                anchorEl={anchorSettings}
                keepMounted
                open={Boolean(anchorSettings)}
                onClose={handleSettingsClose}>
                <ListItemText primary="Settings" align="center" />
                <ListItemText secondary="Playback Speed" align="center" />
                <Grid align="center" style={{ paddingBottom: '8px' }}>
                    <ToggleButtonGroup
                        dense
                        size="small"
                        value={state.playbackRate || 1}
                        align="center"
                        exclusive
                        onChange={handlePlaybackRateChange}
                        aria-label="playback-rate-togglegroup"
                    >
                        <ToggleButton value={0.5} aria-label="centered">
                            <Typography variant="caption" align="center">0.5x</Typography>
                        </ToggleButton>
                        <ToggleButton value={1.0} aria-label="centered">
                            <Typography variant="caption" align="center">1.0x</Typography>
                        </ToggleButton>
                        <ToggleButton value={1.5} aria-label="centered">
                            <Typography variant="caption" align="center">1.5x</Typography>
                        </ToggleButton>
                        <ToggleButton value={2.0} aria-label="centered">
                            <Typography variant="caption" align="center">2.0x</Typography>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                <ListItemText secondary="Keybinds" align="center" />
                <List component="nav"
                    aria-label="keybinds-list"
                    className={classes.root}
                    style={{ paddingTop: '0px' }}
                    dense
                >
                    <ListItem dense>
                        <ListItemText primary="Pause/Resume" secondary="keybind: space" />
                    </ListItem>

                    <Popover
                        open={openEditKeybind}
                        anchorEl={anchorEditKeybinds}
                        disableRestoreFocus
                        anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'center',
                            horizontal: 'right',
                        }}
                    >
                        <Card className={classes.root} variant="outlined">
                            <CardContent>
                                <ListItemText primary="Edit Keybind" secondary="Changes are saved to your browser cache" />
                                <TextField id="keybind-behavior-input" label="Behavior Name" variant="outlined" value={keybindInEdit.behavior} />
                                <TextField id="keybind-key-input" label="Key" variant="outlined" value={keybindInEdit.key} />
                                <TextField id="keybind-order-input" label="Order" variant="outlined" value={keybindInEdit.order} />
                            </CardContent>
                            <CardActions>
                                <Tooltip title="Accept">
                                    <IconButton size="small" className={classes.smallButton} onClick={handleAcceptEditKeybind}>
                                        <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                    <IconButton size="small" color="secondary" onClick={handleCancelEditKeybind}>
                                        <CancelIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    </Popover>

                    {state.keybinds.map((keybind) =>
                        <ListItem key={keybind.key} dense>
                            <ListItemText primary={keybind.behavior} secondary={`keybind: ${keybind.key}`} />
                            <Tooltip title="Edit Keybind">
                                <IconButton size="small" className={classes.smallButton} onClick={(e) => (handleTriggerEditKeybind(e, keybind))}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Keybind">
                                <IconButton color="secondary" size="small">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                    )}
                    <Grid align="center">
                        <Tooltip title="Add New Keybind">
                            <IconButton color="primary" size="small" className={classes.smallButton}>
                                <AddCircleIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset to Defaults">
                            <IconButton color="primary" size="small" className={classes.smallButton}>
                                <SettingsBackupRestoreIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Grid>


                </List>
            </StyledMenu>

            <AppBar position="fixed" style={{ background: '#469FAE' }}>
                <Toolbar className={classes.toolbar}>
                    <Typography variant="h5" component="h1" className={classes.title}>Video Keypress</Typography>
                    <Grid container alignItems="center" className={classes.menu}>
                        {state.dataFileName && (
                            <Tooltip title={state.dataFileName}>
                                <Grid item>
                                    <Typography variant="caption" display="block" className={classes.restrictedText}>Current {state.isVideo ? "Video" : "Data"}:</Typography>
                                    <Typography variant="overline" display="block" className={classes.restrictedText}>{state.dataFileName}</Typography>
                                </Grid>
                            </Tooltip>

                        )}
                        {state.dataFileName && (
                            <Divider orientation="vertical" flexItem />
                        )}
                        {state.dataFileName && (
                            <Tooltip title="Download Data">
                                <IconButton aria-label="download data"
                                    color="inherit"
                                    className={classes.button}
                                    onClick={handleDownloadData}>
                                    <GetAppIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        {state.dataFileName && (
                            <Divider orientation="vertical" flexItem />
                        )}
                        {state.dataFileName && (
                            <Tooltip title="Download SVG">
                                <IconButton aria-label="download svg"
                                    color="inherit"
                                    className={classes.button}
                                    onClick={handleDownloadSVG}>
                                    <ImageIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        {state.dataFileName && (
                            <Divider orientation="vertical" flexItem />
                        )}
                        {state.dataFileName && (
                            <Tooltip title="Unset Video">
                                <IconButton aria-label="unset video"
                                    color="inherit"
                                    className={classes.button}
                                    onClick={resetVideo}>
                                    <CancelIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        {state.dataFileName && (
                            <Divider orientation="vertical" flexItem />
                        )}

                        <Tooltip title="Select Video">
                            <IconButton aria-label="select video"
                                color="inherit"
                                className={classes.button}
                                onClick={(e) => handleVideoSelect(e)}>
                                <MovieIcon />
                            </IconButton>
                        </Tooltip>
                        <Divider orientation="vertical" flexItem />
                        <Tooltip title="Select Data">
                            <IconButton aria-label="select data"
                                color="inherit"
                                className={classes.button}
                                onClick={handleDataSelect}>
                                <CodeIcon />
                            </IconButton>
                        </Tooltip>
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
            <div className={classes.content}>
                {!state.dataFileName && (
                    <div align="center">
                        <Typography variant="caption" display="block" align="center" gutterBottom>Please select a video or select data from a previous session!</Typography>
                        <Tooltip title="Select Video" align="center">
                            <IconButton aria-label="select video"
                                color="inherit"
                                className={classes.largeButton}
                                onClick={(e) => handleVideoSelect(e)}>
                                <MovieIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Select Data" align="center">
                            <IconButton aria-label="select video"
                                color="inherit"
                                className={classes.largeButton}
                                onClick={(e) => handleDataSelect(e)}>
                                <CodeIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                )}

                <div className="Row">
                    <div className="VideoPlay">
                        {state.dataFileName && !state.isVideo && (
                            <div className={classes.dataText}><pre>{JSON.stringify(state.data, undefined, 2)}</pre></div>
                        )}
                        {state.dataFileName && state.isVideo && (
                            <ReactPlayer url={state.videoFilePath}
                                className={classes.reactPlayer}
                                playing={isPlayingBuffer}
                                width="840px"
                                height="100%"
                                autoPlay={false}
                                muted={true}
                                controls={true}
                                onDuration={handleDuration}
                                onProgress={handleProgress}
                                playbackRate={state.playbackRate || 1}
                                onPause={handleOnPauseStop}
                                onStart={handleOnStartPlay}
                                onPlay={handleOnStartPlay}
                            />
                        )}
                        <div className="Row">
                            <Chart state={state} />
                        </div>
                    </div>
                </div>
            </div>

            <AppBar position="fixed" color="transparent" className={classes.bottomAppBar}>
                <Toolbar className={classes.bottomToolbar}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" align="center" gutterBottom>
                                No data is transfered. All data remains in your browser.
                            </Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Tooltip title="Visit GitHub Repo">
                                <IconButton aria-label="visit github repo"
                                    color="inherit"
                                    className={classes.button}
                                    onClick={handleNavigateToGitHub}>
                                    <GitHubIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography variant="caption" align="center" gutterBottom>
                                Version {packageJson.version}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="caption" align="center" gutterBottom>
                                GNU General Public License
                            </Typography>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </div >
    );
}

export default App;