# Video Keypress

React app to record events while watching a video. Data is collated into a JSON array of events with the following structure:

``` yaml
    {
        "id": 0, # unique ordinal id for the event;
        "key": "key", # key pressed
        "behavior": "Behavior", # behavior name
        "start": 0.0, # start time of event (in seconds)
        "end": 4.037488,  # end time of event (in seconds)
        "order: 1 # ordinal position of the behavior wihtin the generated chart; starts at 1
    }
```

