import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { DataGrid } from "@material-ui/data-grid";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MuiAlert from "@material-ui/lab/Alert";
import { useEffect, useState } from "react";
import React, { useGlobal } from "reactn";
import { Chart as GoogleChart } from "react-google-charts";
import "./App.css";

const COMPUTE_DERIVED_FIELDS_INTERVAL = 250; // In milliseconds
const MIN_EVENT_DURATION = 0.01; // In seconds
const EVENT_LABEL = "Event: ";

function convertToMilliseconds(value) {
  return value * 1000;
}

function formatTime(value) {
  var fixedValue = value.toFixed(2);
  if (isNaN(fixedValue)) fixedValue = 0;
  return `${value.toFixed(2)}ms`;
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: "auto",
    maxWidth: "600px",
  },
  accordion: {
    margin: "auto",
    maxWidth: "840px",
    marginBottom: "20px",
  },
  details: {
    flexDirection: "column",
  },
  paper: {
    padding: theme.spacing(1),
    fontSize: "12px",
    textAlign: "center",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.contrastText,
    flexBasis: "25%",
  },
  control: {
    padding: theme.spacing(2),
  },
}));

const Chart = (props) => {
  const [formattedData, setFormattedData] = useState([]);
  const [derivedFields, setDerivedFields] = useState([]);
  const [cachedNumHeaderRows, setCachedNumHeaderRows] = useState(0);
  const [cachedFormattedDataSize, setCachedFormattedDataSize] = useState(0);
  const [selectedChartElement, setSelectedChartElement] = useState({});
  const [deletedChartElement, setDeletedChartElement] = useState({});
  const [state, setState] = useGlobal("state");

  const classes = useStyles();

  useEffect(() => {
    const interval = setInterval(() => {
      if (formattedData.length !== cachedFormattedDataSize) {
        setCachedFormattedDataSize(formattedData.length);
        computeDerivedFields();
        console.log("computeDerivedFields");
      }
    }, COMPUTE_DERIVED_FIELDS_INTERVAL);
    return () => clearInterval(interval);
  });

  const computeDerivedFields = () => {
    // Remove header row of formatted data
    var data = formattedData.filter((obj) => typeof obj[0] === "string" && obj[1] !== "Meta");
    console.log(formattedData);

    // Find unique behaviors in existing data
    const uniqueBehaviors = [];
    data.forEach((event) => {
      if (uniqueBehaviors.indexOf(event[0]) === -1) {
        uniqueBehaviors.push(event[0]);
      }
    });

    var tempDerivedFields = [];
    const keybindMap = state.keybinds;

    var id = 0;
    // Derive fields for each unique behavior
    uniqueBehaviors.forEach((behavior) => {
      var occurrences = 0,
        totalDuration = 0;
      var matchingEvents = data.filter((event) => event[0] === behavior);
      var order = keybindMap.filter((keybind) => keybind.behavior === behavior).order;

      console.log("finding derived fields for " + behavior + " found " + matchingEvents.length + " events");

      occurrences = matchingEvents.length;

      matchingEvents.forEach((event) => {
        totalDuration += event[3] - event[2];
      });

      var avgDuration = totalDuration / occurrences;
      if (occurrences === 0) avgDuration = 0;

      var derivedField = {
        id: id,
        order: null,
        behavior: behavior,
        occurrences: occurrences,
        totalDuration: totalDuration,
        avgDuration: avgDuration,
      };

      tempDerivedFields.push(derivedField);
      id++;
    });

    // Sort derived fields by order property
    tempDerivedFields.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order > b.order ? 1 : -1;
      } else {
        var textA = a.behavior.toUpperCase();
        var textB = b.behavior.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      }
    });

    setDerivedFields((derivedFields) => {
      derivedFields = tempDerivedFields;
      return derivedFields;
    });
    state.derivedFields = derivedFields;
  };

  const formatEvent = (latestEvent) => {
    // for display purposes, set a minimum value for durations
    if (latestEvent.end - latestEvent.start < MIN_EVENT_DURATION) latestEvent.end += MIN_EVENT_DURATION;

    // Search existing records for similar start, end, duration times and adjust by the MIN_EVENT_DURATION
    // This is to account for key presses that happen faster than the update cycle of React
    state.data.events.forEach((obj) => {
      if (obj.id !== latestEvent.id && obj.behavior === latestEvent.behavior) {
        if (obj.start === latestEvent.start) {
          console.warn("Adjusted event start time due to existing similar events: " + latestEvent.id);
          latestEvent.start += MIN_EVENT_DURATION + 0.1 * MIN_EVENT_DURATION;
        }

        if (obj.behavior === latestEvent.behavior && obj.end === latestEvent.start) {
          console.warn("Adjusted event start time due to existing similar events: " + latestEvent.id);
          latestEvent.start += 0.1 * MIN_EVENT_DURATION;
        }

        if (obj.end === latestEvent.end) {
          console.warn("Adjusted event end time due to existing similar events: " + latestEvent.id);
          latestEvent.end += MIN_EVENT_DURATION + 0.1 * MIN_EVENT_DURATION;
        }
      }
    });

    return [latestEvent.behavior, EVENT_LABEL + latestEvent.id, convertToMilliseconds(latestEvent.start), convertToMilliseconds(latestEvent.end)];
  };

  useEffect(() => {
    var isDataLoaded = state.dataFileName !== "";
    var isFormattedDataEmpty = formattedData.length === 0;
    var areEventsEmpty = state.data.events && state.data.events.length === 0;

    // Video has been cleared, reset the chart
    if (!isDataLoaded && formattedData.length !== 0) {
      setFormattedData([]);
      setDerivedFields([]);
    }

    if (isDataLoaded && isFormattedDataEmpty) {
      var headerRows = [
        [
          { type: "string", id: "Behavior" },
          { type: "string", id: "Event" },
          { type: "number", id: "Start" },
          { type: "number", id: "End" },
        ],
        ["Behavior", "Meta", 0, convertToMilliseconds(state.data.metadata.duration)],
      ];

      if (state.isVideo && areEventsEmpty) {
        // Adding empty Behavior records to force a consistent order
        state.keybinds.forEach((obj) => {
          headerRows.push([obj.behavior, "Meta", 0, 0]);
        });
      } else if (!areEventsEmpty) {
        // Likely coming from a data upload - find unique behaviors and sort them alphabetically if order property does not exist
        // Find unique behaviors in existing data
        const uniqueBehaviors = [];
        state.data.events.forEach((event) => {
          if (uniqueBehaviors.indexOf(event.behavior) === -1) {
            uniqueBehaviors.push(event.behavior);
          }
        });
        console.log(JSON.stringify(uniqueBehaviors));
        uniqueBehaviors.sort((a, b) => {
          var textA = a.toUpperCase();
          var textB = b.toUpperCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
        uniqueBehaviors.forEach((behavior) => {
          headerRows.push([behavior, "Meta", 0, 0]);
        });
      }

      setCachedNumHeaderRows(headerRows.length);
      setFormattedData(headerRows);
    }

    // Check if events exist to avoid running code when idle
    var eventsExist = state.data.events && state.data.events.length > 0;
    // Check if a new event exists -- length of data.events plus header rows
    var newEventExists = state.data.events.length + cachedNumHeaderRows > formattedData.length;

    // Add new event and compute derived fields when new record is persisted
    if (eventsExist && newEventExists) {
      var eventsDiff = state.data.events.length + cachedNumHeaderRows - formattedData.length;
      var formattedEvents = [],
        unformattedEvent,
        formattedEvent;

      while (eventsDiff > 0) {
        unformattedEvent = state.data.events[state.data.events.length - eventsDiff];
        formattedEvent = formatEvent(unformattedEvent);
        formattedEvents.push(formattedEvent);
        eventsDiff--;
      }

      setFormattedData((formattedData) => formattedData.concat(formattedEvents));
    }
  });

  const derivedFieldsColumns = [
    { field: "behavior", headerName: "Behavior", width: 200 },
    { field: "occurrences", headerName: "Occurrences", type: "number", width: 200, valueFormatter: (params) => params.value },
    { field: "avgDuration", headerName: "Avg Duration", type: "number", width: 200, valueFormatter: (params) => formatTime(params.value) },
    { field: "totalDuration", headerName: "Total Duration", type: "number", width: 200, valueFormatter: (params) => formatTime(params.value) },
  ];

  const getDerivedFieldsTableHeight = () => {
    return derivedFields.length > 0 ? 55 * derivedFields.length + 3 : 75;
  };

  const handleResolveSelectedChartElement = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSelectedChartElement({ active: false });
    setDeletedChartElement({ active: false });
  };

  const handleResolveDeletedChartElement = (event, reason) => {
    setDeletedChartElement({ active: false });
  };

  const handleUndoDeletedChartElement = () => {
    var formattedData = [deletedChartElement.behavior, deletedChartElement.id];
  };

  const handleDeleteSelectedChartElement = () => {
    // Remove data with that ID from formattedData and from the data
    var adjustedFormattedData = formattedData.filter(function (arr) {
      return arr[1] !== selectedChartElement.id;
    });
    setFormattedData(adjustedFormattedData);

    var id = parseInt(selectedChartElement.id.replace(EVENT_LABEL, ""));
    var adjustedData = state.data.events.filter(function (obj) {
      return obj.id !== id;
    });
    setState({
      ...state,
      data: {
        events: adjustedData,
        metadata: {
          ...state.data.metadata,
        },
      },
    });

    setDeletedChartElement(selectedChartElement);
    setSelectedChartElement({ active: false });
  };

  return (
    <div className="Row">
      {props.state.dataFileName !== "" && (
        <Accordion className={classes.accordion}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="derivedfields-content">
            <Typography variant="caption">Derived Fields</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordion}>
            <div style={{ height: getDerivedFieldsTableHeight(), width: "100%" }}>
              <DataGrid rows={derivedFields} columns={derivedFieldsColumns} autoPageSize={true} density="compact" hideFooter={true} />
            </div>
          </AccordionDetails>
        </Accordion>
      )}
      <div id="chart-container" className="GoogleChart">
        {formattedData.length > 1 && (
          <GoogleChart
            readonly
            width={"840px"}
            height={"400px"}
            chartType="Timeline"
            data={formattedData}
            options={{
              timeline: {
                colorByRowLabel: true,
                margin: "auto",
                showBarLabels: false,
              },
              colors: ["transparent", "#469FAE", "#3ECDB6", "#C09BD8", "#F67E5C", "#CA1252", "#DD5B5C", "#D9959A", "#938D99", "#5E614A"],
            }}
            rootProps={{ "data-testid": "6" }}
            chartEvents={[
              {
                eventName: "select",
                callback: ({ chartWrapper }) => {
                  var chart = chartWrapper.getChart();
                  var selection = chart.getSelection()[0];
                  var formattedSelection = formattedData[selection.row + 1];
                  var selectedObject = {
                    behavior: formattedSelection[0],
                    id: formattedSelection[1],
                    start: formattedSelection[2],
                    end: formattedSelection[3],
                    active: true,
                  };
                  if (selectedObject.id !== "Meta") setSelectedChartElement(selectedObject);

                  console.log(selectedObject);
                },
              },
            ]}
          />
        )}
      </div>
      <div>
        <Snackbar
          readonly
          open={selectedChartElement.active}
          autoHideDuration={null}
          onClose={handleResolveSelectedChartElement}
          message={`Selected: ${selectedChartElement.id}`}
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="delete" color="secondary" onClick={handleDeleteSelectedChartElement}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="close" color="inherit" onClick={handleResolveSelectedChartElement}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        ></Snackbar>
        {/* <Snackbar
                    open={deletedChartElement.active}
                    autoHideDuration={6000}
                    onClose={handleResolveDeletedChartElement}
                    message={`Deleted: ${deletedChartElement.id}`}
                    action={
                        <Button color="secondary" size="small" onClick={handleUndoDeletedChartElement}>
                            Undo
                        </Button>
                    }>
                </Snackbar> */}
      </div>
    </div>
  );
};

export default Chart;
