"use strict";
var _ = require('lodash');

var messagesForWebview = function (logs, wvId) {
  var msgs = [];
  _.each(logs, function (log) {
    var msg;
    msg = JSON.parse(log.message);
    if (msg.webview.toString() === wvId.toString()) {
      msgs.push(msg.message);
    }
  });
  return msgs;
};

var filteredEvents = function (logs, filter) {
  var msgs = messagesForWebview(logs, 0);
  return _.filter(msgs, function (msg) {
    return msg.method.indexOf(filter) !== -1;
  });
};

exports.networkEvents = function (logs) {
  return filteredEvents(logs, "Network");
};

exports.networkEventsById = function (logs) {
  var netEvts = exports.networkEvents(logs);
  var groupedEvts = {};
  _.each(netEvts, function (netEvt) {
    if (netEvt.params.requestId) {
      if (!_.has(groupedEvts, netEvt.params.requestId)) {
        groupedEvts[netEvt.params.requestId] = [];
      }
      groupedEvts[netEvt.params.requestId].push(netEvt);
    }
  });
  return groupedEvts;
};

var durationForGroupedEvent = function (groupedEvt) {
  if (groupedEvt.length < 2) {
    throw new Error("Not enough events");
  }
  var t1 = groupedEvt[0].params.timestamp;
  var t2 = groupedEvt[groupedEvt.length - 1].params.timestamp;
  return t2 - t1;
};

exports.durationForNetworkEvents = function (logs) {
  var groupedEvts = exports.networkEventsById(logs);
  if (_.size(groupedEvts) < 1) {
    throw new Error("Cannot find duration; no events");
  }
  var total = 0;
  _.each(groupedEvts, function (groupedEvt) {
    total += durationForGroupedEvent(groupedEvt);
  });
  return {total: total, avg: (total / _.size(groupedEvts))};
};

exports.sizeForNetworkEvents = function (logs) {
  var evts = filteredEvents(logs, "Network.loadingFinished");
  return _.reduce(
    _.map(evts, function (evt) { return evt.params.encodedDataLength; }),
    function (sum, len) {
      return sum + len;
    }
  );
};

exports.timelineEvents = function (logs) {
  return filteredEvents(logs, "Timeline");
};

var countsForEvents = function (evts, isChild) {
  var counts = {};
  _.each(evts, function (evt) {
    var record = evt;
    if (!isChild) {
      record = evt.params.record;
    }
    if (record) {
      if (!_.has(counts, record.type)) {
        counts[record.type] = 0;
      }
      counts[record.type]++;

      if (record.children && record.children.length) {
        var childCounts = countsForEvents(record.children, true);
        _.each(childCounts, function (childCount, type) {
          if (!_.has(counts, type)) {
            counts[type] = 0;
          }
          counts[type] += childCount;
        });
      }
    }
  });
  return counts;
};

var memoryForEvents = function (evts, isChild) {
  var total = 0;
  _.each(evts, function (evt) {
    var record = evt;
    if (!isChild) {
      record = evt.params.record;
    }
    if (record) {
      if (record.usedHeapSizeDelta) {
        total += record.usedHeapSizeDelta;
      }

      if (record.children && record.children.length) {
        total += memoryForEvents(record.children, true);
      }
    }
  });
  return total;
};

var cpuTimeForEvents = function (evts, isChild) {
  var total = 0;
  _.each(evts, function (evt) {
    var record = evt;
    if (!isChild) {
      record = evt.params.record;
    }
    if (record) {
      if (record.startTime && record.endTime) {
        total += record.endTime - record.startTime;
      }

      if (record.children && record.children.length) {
        total += memoryForEvents(record.children, true);
      }
    }
  });
  return total;
};

exports.countsForTimelineEvents = function (logs) {
  var evts = exports.timelineEvents(logs);
  return countsForEvents(evts);
};

exports.memoryForTimelineEvents = function (logs) {
  return memoryForEvents(exports.timelineEvents(logs));
};

exports.cpuTimeForTimelineEvents = function (logs) {
  return cpuTimeForEvents(exports.timelineEvents(logs));
};
