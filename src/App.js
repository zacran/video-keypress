import AppBar from '@material-ui/core/AppBar';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import Popover from '@material-ui/core/Popover';
import { makeStyles, ThemeProvider, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CodeIcon from '@material-ui/icons/Code';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';
import GitHubIcon from '@material-ui/icons/GitHub';
import ImageIcon from '@material-ui/icons/Image';
import MovieIcon from '@material-ui/icons/Movie';
import SettingsIcon from '@material-ui/icons/Settings';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import useEventListener from "@use-it/event-listener";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import React, { useGlobal } from 'reactn';
import packageJson from '../package.json';
import "./App.css";
import Chart from "./Chart";
import KeybindMap from "./keybindMap";
import Theme from './Theme';

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
    largeButton: {
        display: 'inline-block',
        margin: 'auto',
        '& svg': {
            fontSize: 144
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
    const [state, setState] = useGlobal('state');

    useEffect(() => {
        var savedKeybinds = JSON.parse(localStorage.getItem('keybinds')) || undefined;
        if (savedKeybinds && Array.isArray(savedKeybinds)) {
            setState({ ...state, keybinds: savedKeybinds });
        }
    }, []);

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

    const handleUpdateKeybinds = (keybinds) => {
        localStorage.setItem('keybinds', JSON.stringify(keybinds));

        var savedKeybinds = JSON.parse(localStorage.getItem('keybinds')) || undefined;
        if (savedKeybinds && Array.isArray(savedKeybinds)) {
            setState({ ...state, keybinds: savedKeybinds });
        }
    }

    const handleEditKeybindChange = (prop) => (event) => {
        var value = event.target.value;

        if (value !== undefined) {
            if (prop === 'order' && value !== '' && !isNaN(value))
                value = parseInt(value);

            if (prop === 'key') {
                var existingKey = state.keybinds.find(k => k.key === value);
                if (existingKey) {
                    setKeybindInEdit({ ...keybindInEdit, keyError: true });
                    return;
                }
            }

            if (prop === 'behavior') {
                var existingBehavior = state.keybinds.find(k => k.behavior === value);
                if (existingBehavior) {
                    setKeybindInEdit({ ...keybindInEdit, behaviorError: true });
                    return;
                }
            }

            setKeybindInEdit((keybindInEdit) => {
                keybindInEdit = { ...keybindInEdit, [prop]: value };

                if (prop === 'behavior' && keybindInEdit.behaviorError)
                    keybindInEdit.behaviorError = false;

                if (prop === 'key' && keybindInEdit.keyError)
                    keybindInEdit.keyError = false;

                return keybindInEdit;
            });
        }

    };

    const handleTriggerEditKeybind = (event, keybind) => {
        setKeybindInEdit(keybind);
        setAnchorEditKeybinds(event.currentTarget);
    };

    const handleAddNewKeybind = () => {
        var keybinds = state.keybinds;
        var id = Math.max.apply(Math, keybinds.map(function (k) { return k.id; }));
        id = (isFinite(id) ? id + 1 : 0);
        var order = Math.max.apply(Math, keybinds.map(function (k) { return k.order; }));
        order = (isFinite(order) ? order + 1 : 0);

        keybinds.push({
            id: id, key: '0', order: order, behavior: "New Behavior", active: false
        });

        setState({ ...state, keybinds: keybinds });
        handleUpdateKeybinds(keybinds);
    };

    const handleAcceptEditKeybind = (event) => {
        var keybinds = state.keybinds;
        var index = keybinds.findIndex(k => k.id === keybindInEdit.id);
        keybinds[index] = keybindInEdit;


        setState({ ...state, keybinds: keybinds });
        handleUpdateKeybinds(keybinds);
        handleCancelEditKeybind();
    };

    const handleCancelEditKeybind = () => {
        setAnchorEditKeybinds(null);
    };

    const handleDeleteKeybind = (event, keybind) => {
        if (window.confirm("Are you sure you wish to delete this keybind?")) {
            var keybinds = state.keybinds.filter(k => k.id !== keybind.id);

            setState({ ...state, keybinds: keybinds });
            handleUpdateKeybinds(keybinds);
        }
    }

    const handleResetSettings = () => {
        if (window.confirm("Are you sure you wish to clear local settings?")) {
            localStorage.clear();
            setState({ ...state, keybinds: KeybindMap.Keybinds });
        }
    }

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
        state.keybinds.forEach(function (keybind) {
            if (keybind.key === (String(key))) {
                callback(keybind);
            }
        });
    };

    const handleVideoSizeChange = (event, value) => {
        if (value !== state.videoSize)
            setState({ ...state, videoSize: value })
    };

    const handlePlaybackRateChange = (event, value) => {
        if (value !== state.playbackRate)
            setState({ ...state, playbackRate: parseFloat(value) })
    };

    const recordKeydown = (keybind) => {
        if (!keybind.active) {
            keybind.active = true;
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
            var end = state.playedSeconds.toFixed(3);
            var id = Math.max.apply(Math, state.data.events.map(function (e) { return e.id; }));
            id = (isFinite(id) ? id + 1 : 0);
            keybind.active = false;
            activity.id = id;
            activity.end = parseFloat(end);

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

    const [anchorSettings, setAnchorSettings] = useState(null);

    const handleSettingsClick = (event) => {
        setAnchorSettings(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setAnchorSettings(null);
    };


    return (
        <ThemeProvider theme={Theme}>
            <CssBaseline />
            <div className="App">
                <input type="file" ref={hiddenVideoUpload} onChange={handleVideoUpload} style={{ display: 'none' }} />
                <input type="file" ref={hiddenDataUpload} onChange={handleDataUpload} style={{ display: 'none' }} />
                <StyledMenu
                    className={classes.popoverMenu}
                    anchorEl={anchorSettings}
                    keepMounted
                    open={Boolean(anchorSettings)}
                    onClose={handleSettingsClose}>
                    <ListItemText primary="Settings" align="center" disabled />
                    <ListItemText secondary="Video Size" align="center" disabled />
                    <Grid align="center" style={{ paddingBottom: '8px' }}>
                        <ToggleButtonGroup
                            size="small"
                            value={state.videoSize || '840px'}
                            align="center"
                            exclusive
                            onChange={handleVideoSizeChange}
                            aria-label="video-size-togglegroup"
                        >
                            <ToggleButton value={'600px'} aria-label="centered">
                                <Typography variant="caption" align="center">600px</Typography>
                            </ToggleButton>
                            <ToggleButton value={'840px'} aria-label="centered">
                                <Typography variant="caption" align="center">840px</Typography>
                            </ToggleButton>
                            <ToggleButton value={'1080px'} aria-label="centered">
                                <Typography variant="caption" align="center">1080px</Typography>
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <ListItemText secondary="Playback Speed" align="center" disabled />
                    <Grid align="center" style={{ paddingBottom: '8px' }}>
                        <ToggleButtonGroup
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
                    <ListItemText secondary="Keybinds" align="center" disabled />
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
                                    <TextField id="keybind-behavior-input" variant="outlined" size="small"
                                        error={keybindInEdit.behaviorError ? true : false}
                                        helperText={keybindInEdit.behaviorError ? "Invalid value" : ""}
                                        label="Behavior Name"
                                        defaultValue={keybindInEdit.behavior}
                                        onChange={handleEditKeybindChange('behavior')}
                                    />
                                    <TextField id="keybind-key-input" variant="outlined" size="small"
                                        error={keybindInEdit.keyError ? true : false}
                                        helperText={keybindInEdit.keyError ? "Invalid value" : ""}
                                        label="Key"
                                        inputProps={{ maxLength: 1 }}
                                        defaultValue={keybindInEdit.key}
                                        onChange={handleEditKeybindChange('key')}
                                    />
                                    {/* <TextField id="keybind-order-input" variant="outlined" size="small"
                                    label="Order"
                                    value={keybindInEdit.order}
                                    onChange={handleEditKeybindChange('order')} /> */}
                                </CardContent>
                                <CardActions>
                                    <Tooltip title="Accept">
                                        <IconButton size="small"
                                            className={classes.smallButton}
                                            color="primary"
                                            disabled={keybindInEdit.keyError || keybindInEdit.behaviorError ? true : false}
                                            onClick={handleAcceptEditKeybind}>
                                            <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancel">
                                        <IconButton size="small"
                                            color="secondary"
                                            onClick={handleCancelEditKeybind}>
                                            <CancelIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Popover>

                        {state.keybinds.map((keybind) =>
                            <ListItem key={keybind.id} dense>
                                <ListItemText primary={keybind.behavior} secondary={`keybind: ${keybind.key}`} />
                                <Tooltip title="Edit Keybind">
                                    <IconButton size="small" color="primary" onClick={(e) => (handleTriggerEditKeybind(e, keybind))}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Keybind">
                                    <IconButton size="small" color="secondary" onClick={(e) => (handleDeleteKeybind(e, keybind))}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </ListItem>
                        )}
                        <Grid align="center">
                            <Tooltip title="Add New Keybind">
                                <IconButton color="primary" size="small" onClick={handleAddNewKeybind}>
                                    <AddCircleIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset to Defaults">
                                <IconButton color="primary" size="small" onClick={handleResetSettings}>
                                    <SettingsBackupRestoreIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Grid>


                    </List>
                </StyledMenu>

                <AppBar position="fixed" color="primary" >
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
                                    color="primary"
                                    className={classes.largeButton}
                                    onClick={(e) => handleVideoSelect(e)}>
                                    <MovieIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Select Data" align="center">
                                <IconButton aria-label="select video"
                                    color="primary"
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
                                    width={state.videoSize}
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

                <AppBar position="fixed" color="primary" className={classes.bottomAppBar}>
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
                            <Grid item xs={1}>
                                <Typography variant="caption" align="center" gutterBottom>
                                    v{packageJson.version}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="caption" align="center" gutterBottom>
                                    GNU General Public License
                            </Typography>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
            </div >
        </ThemeProvider>
    );
}

export default App;