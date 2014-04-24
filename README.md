chrome-ops
==========

This is a Node.js helper library for dealing with [Chromedriver](https://code.google.com/p/selenium/wiki/ChromeDriver) performance logs. These logs come in a raw JSON format and have a ton of information about Network events, Page Load events, and other elements of app performance. This library exposes various methods to which you can pass the raw logs retrieved from Chromedriver:

```js
var chromeOps = require('chrome-ops');

// assume we have a 'logs' object that we got from Chromedriver

// how much network time do these logs represent?
chromeOps.durationForNetworkEvents(logs);
//>> {total: 12361, avg: 7.6}

// how much was downloaded?
chromeOps.sizeForNetworkEvents(logs);
//>> 51923

// how many times did various events occur in this log set?
chromeOps.countsForTimelineEvents(logs);
//>> { BeginFrame: 207,
//     RequestMainThreadFrame: 9,
//     Program: 536,
//     FunctionCall: 16,
//     ScheduleStyleRecalculation: 17,
//     ParseHTML: 38,
//     RecalculateStyles: 17,
//     InvalidateLayout: 20,
//     MarkDOMContent: 3,
//     MarkLoad: 2,
//     TimerInstall: 1,
//     Layout: 15,
//     AutosizeText: 15,
//     Paint: 27,
//     CompositeLayers: 9,
//     TimerFire: 1,
//     Rasterize: 185,
//     ActivateLayerTree: 9,
//     DrawFrame: 8,
//     ResourceSendRequest: 33,
//     ResourceReceiveResponse: 33,
//     ResourceReceivedData: 195,
//     ResourceFinish: 33,
//     EvaluateScript: 8,
//     GCEvent: 2,
//     EventDispatch: 3,
//     MarkFirstPaint: 1,
//     DecodeImage: 12 }

// how much memory was consumed by the events in these logs?
chromeOps.memoryForTimelineEvents(logs);
//>> 1062852

// how much cpu time was used by the events in these logs?
chromeOps.cpuTimeForTimelineEvents(logs);
//>> 46826.219
