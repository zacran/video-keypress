import React, { useState, useEffect } from "react";
import { Chart as GoogleChart } from "react-google-charts";
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import KeybindMap from "../hooks/keybindMap"
import { makeStyles } from '@material-ui/core/styles';
import "../App.css";

const COMPUTE_DERIVED_FIELDS_INTERVAL = 500;
const MIN_EVENT_DURATION = 0.1;

function convertToMilliseconds(value) {
    return value * 1000
}

function formatTime(value) {
    var fixedValue = value.toFixed(2);
    if (isNaN(fixedValue)) fixedValue = 0;
    return `${value.toFixed(2)}ms`;
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        margin: 'auto',
        maxWidth: '600px'
    },
    paper: {
        padding: theme.spacing(1),
        fontSize: '12px',
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    control: {
        padding: theme.spacing(2),
    },
}));

const Chart = (props) => {
    const [formattedData, setFormattedData] = useState([]);
    const [derivedFields, setDerivedFields] = useState([]);
    const [cachedFormattedDataSize, setCachedFormattedDataSize] = useState(0);

    const classes = useStyles();

    useEffect(() => {
        const interval = setInterval(() => {
            if (formattedData.length !== cachedFormattedDataSize) {
                setCachedFormattedDataSize(formattedData.length);
                computeDerivedFields();
            }
        }, COMPUTE_DERIVED_FIELDS_INTERVAL);
        return () => clearInterval(interval);
    });

    function computeDerivedFields() {
        // Remove header row of formatted data
        var data = formattedData.filter(obj => typeof obj[0] === 'string' && obj[1] !== 'Meta');
        console.log(formattedData);

        // Find unqiue behaviors in existing data
        const uniqueBehaviors = [];
        data.forEach(event => {
            if (uniqueBehaviors.indexOf(event[0]) === -1) {
                uniqueBehaviors.push(event[0])
            }
        });

        var tempDerivedFields = [];
        const keybindMap = KeybindMap.Keybinds;

        // Derive fields for each unique behavior
        uniqueBehaviors.forEach(behavior => {
            var occurences = 0, totalDuration = 0;
            var matchingEvents = data.filter(event => event[0] === behavior);
            var order = keybindMap.filter(keybind => keybind.behavior === behavior).order;
            console.log("finding derived fields for " + behavior + " found " + matchingEvents.length + " events");

            // Minus 1 to factor for placeholder events to force order of Derived Fields
            occurences = matchingEvents.length - 1;

            matchingEvents.forEach(event => {
                totalDuration += (event[3] - event[2]);
            });

            var avgDuration = (totalDuration / occurences);
            if (occurences === 0) avgDuration = 0;

            var derivedField = {
                order: order,
                behavior: behavior,
                occurences: occurences,
                totalDuration: totalDuration,
                avgDuration: avgDuration
            }

            tempDerivedFields.push(derivedField);
        });

        // Sort derived fields by order property
        tempDerivedFields.sort((a, b) => (a.order > b.order) ? 1 : -1);

        setDerivedFields((derivedFields) => {
            derivedFields = tempDerivedFields;
            console.log(derivedFields);

            return derivedFields;
        });
        props.state.derivedFields = derivedFields;
    };

    useEffect(() => {
        var isVideoLoaded = (props.state.videoFilePath !== '');
        var areEventsEmpty = (formattedData.length === 0 && props.state.data.events && props.state.data.events.length === 0);

        // Video has been cleared, reset the chart
        if (!isVideoLoaded && formattedData.length !== 0) {
            setFormattedData([]);
            setDerivedFields([]);
        }

        if (isVideoLoaded && areEventsEmpty) {
            var headerRows = [
                [
                    { type: 'string', id: 'Behavior' },
                    { type: 'string', id: 'Event' },
                    { type: 'number', id: 'Start' },
                    { type: 'number', id: 'End' },
                ],
                [
                    "Behavior", "Meta", 0, convertToMilliseconds(props.state.data.metadata.duration)
                ]
            ];

            // Adding empty Behavior records to force a consistent order
            props.state.keybinds.forEach(obj => {
                headerRows.push([obj.behavior, "", 0, 0]);
            });
            setFormattedData(headerRows);
        }

        // Check if events exist to avoid running code when idle
        var eventsExist = (props.state.data.events && props.state.data.events.length > 0);
        // Check if a new event exists -- length of data.events plus 2 base header rows
        var newEventExists = (props.state.data.events.length + 2 > formattedData.length);

        // Add new event and compute derived fields when new record is persisted
        if (eventsExist && newEventExists) {
            // Get latest row
            var latestEvent = props.state.data.events[props.state.data.events.length - 1];

            // for display purposes, set a minimum value for durations
            if ((latestEvent.end - latestEvent.start) < MIN_EVENT_DURATION) latestEvent.end += MIN_EVENT_DURATION;

            // Seach existing records for similar start, end, duration times and adjust by the MIN_EVENT_DURATION
            // This is to account for key presses that happen faster than the update cycle of React
            props.state.data.events.forEach(obj => {
                if (obj.id !== latestEvent.id) {
                    if (obj.start === latestEvent.start) {
                        console.warn("Adjusted event start time due to existing similar events: " + latestEvent.id);
                        latestEvent.start += (MIN_EVENT_DURATION + (0.1 * MIN_EVENT_DURATION));
                    }

                    if (obj.behavior === latestEvent.behavior && obj.end === latestEvent.start) {
                        console.warn("Adjusted event start time due to existing similar events: " + latestEvent.id);
                        latestEvent.start += (0.1 * MIN_EVENT_DURATION);
                    }

                    if (obj.end === latestEvent.end) {
                        console.warn("Adjusted event end time due to existing similar events: " + latestEvent.id);
                        latestEvent.end += (MIN_EVENT_DURATION + (0.1 * MIN_EVENT_DURATION));
                    }
                }
            });

            var formattedEvent = [
                latestEvent.behavior,
                "Event: #" + latestEvent.id,
                convertToMilliseconds(latestEvent.start),
                convertToMilliseconds(latestEvent.end)
            ];
            setFormattedData(formattedData => [...formattedData, formattedEvent]);
        }
    });

    return (
        <div className="Row">
            {derivedFields.length > 0 ?
                derivedFields.map((derivedField) =>
                    <Grid container className={classes.root} spacing={2} key={derivedField.behavior}>
                        <Grid item xs={3}>
                            <Paper className={classes.paper}>
                                <Typography variant="caption" display="inline" gutterBottom>    Behavior:   </Typography>
                                <Typography variant="subtitle2" display="block" align="center" gutterBottom >{derivedField.behavior}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={3}>
                            <Paper className={classes.paper}>
                                <Typography variant="caption" display="inline" gutterBottom>    Occurences: </Typography>
                                <Typography variant="subtitle2" display="block" align="center" gutterBottom >{derivedField.occurences}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={3}>
                            <Paper className={classes.paper}>
                                <Typography variant="caption" display="inline" gutterBottom>    Avg Duration:   </Typography>
                                <Typography variant="subtitle2" display="block" align="center" gutterBottom >{formatTime(derivedField.avgDuration)}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={3}>
                            <Paper className={classes.paper}>
                                <Typography variant="caption" display="inline" gutterBottom>    Total Duration:    </Typography>
                                <Typography variant="subtitle2" display="block" align="center" gutterBottom >{formatTime(derivedField.totalDuration)}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                )
                : ""}
            <div id="chart-container" className="GoogleChart">
                {
                    formattedData.length > 1 ?
                        <GoogleChart
                            width={'840px'}
                            height={'400px'}
                            chartType="Timeline"
                            data={formattedData}
                            options={{
                                timeline: {
                                    colorByRowLabel: true,
                                    margin: 'auto',
                                    showBarLabels: false,
                                },
                                colors: ['transparent', '#469FAE', '#3ECDB6', '#C09BD8', '#F67E5C', '#CA1252', '#DD5B5C', '#D9959A', '#938D99', '#5E614A'],
                            }}
                            rootProps={{ 'data-testid': '6' }}
                        />
                        : ""
                }
            </div>
        </div>
    );
}

export default Chart;