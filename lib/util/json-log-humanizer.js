var humanizer = module.exports;
var http      = require('http');
var _         = require('lodash');

var typeProcessors = {};
typeProcessors.message = function(data) {
  return data.message;
};

typeProcessors.request = function(data) {
  var requestLine = data.method + " " + data.url;
  var bodyJson    = JSON.stringify(data.body, null, 2);
  return requestLine + "\n" + bodyJson;
};

typeProcessors.response = function(data) {
  var statusText = http.STATUS_CODES[data.status];

  return data.status + " " + statusText + " (" + data.duration.toFixed(3) + "ms)";
};

typeProcessors.error = function(data) {
  var initialLine = data.error.className + ": " + data.error.message;
  var stackLines  = _.map(data.error.stack, function(line) {
                      return "  " + line;
                    }).join("\n");
  var extras = "  {\n";
  extras += "    'timestamp': " + data.timestamp + "\n";
  extras += "    'date': " + data.date + "\n";
  extras += "    'request-id': " + data.requestId + "\n";
  extras += "  }";
  return initialLine + "\n" + extras + "\n" + stackLines;
};

typeProcessors.query = function(data) {
  //TODO: figure out how to get timing info from knex
  return "SQL: " + data.sql;
};

humanizer.target = function(options, severity, date, message) {
  process.stdout.write(humanizer.processLine(message));
};

humanizer.processLine = function(line) {
  try {
    var data      = JSON.parse(line);
    var type      = data.type || 'message';
    var processor = typeProcessors[type] || defaultProcessor;

    return processor(data) + '\n';
  } catch (e) {
    return 'LOGERROR: Cannot humanize "' + line + '"\n';
  }
};


function defaultProcessor(data) {
  return JSON.stringify(data, null, 2);
}