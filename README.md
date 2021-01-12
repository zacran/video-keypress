# Video Keypress

React app to record events while watching a video. Data is collated into a JSON array of events with the following structure:

``` yaml
    {
        "id": 0, # unique ordinal id for the event;
        "key": "key", # key pressed
        "behavior": "Behavior", # behavior name
        "start": 0.0, # start time of event (in seconds)
        "end": 4.037488  # end time of event (in seconds)
    }
```

Default keybinds are:
  - Space - Play/Pause
  - S - Scratching
  - G - Grooming

These can be modified by changing `src/hooks/keybindMap.js` to add or remove keybinds. Space as Play/Pause is hard-coded into the application though! 

