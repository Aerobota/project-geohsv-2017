var readyToSend = false; // flag to signal insertResult websocket is open
var clickToTaskEnabled = false; // flag to enable/disable click-to-task
var keepZoom = false; // flag to enable/disable keep zoom factor when tasking
var hostName, uid, name, offering, geoProcessId, template, insertWs, getWs;

function connectToWebSocket (incHostName, incUid, incName) {
  hostName = incHostName;
  uid = incUid;
  name = incName;
  sendInsertSensor(); // begin cascade of function calls
}

function sendInsertSensor () {
  var xmlSensorRequest = '' +
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<swes:InsertSensor service="SOS" version="2.0" ' +
    'xmlns:gml="http://www.opengis.net/gml/3.2" ' +
    'xmlns:sml="http://www.opengis.net/sensorml/2.0" ' +
    'xmlns:sos="http://www.opengis.net/sos/2.0" ' +
    'xmlns:swe="http://www.opengis.net/swe/2.0" ' +
    'xmlns:swes="http://www.opengis.net/swes/2.0" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink">' +
    '<swes:procedureDescriptionFormat>http://www.opengis.net/sensorml/2.0</swes:procedureDescriptionFormat>' +
    '<swes:procedureDescription>' +
      '<sml:PhysicalSystem gml:id="SENSORNET">' +
        '<gml:identifier codeSpace="uid">' + uid + '</gml:identifier>' +
        '<gml:name>' + name + '</gml:name>' +
      '</sml:PhysicalSystem>' +
    '</swes:procedureDescription>' +
    '<swes:metadata>' +
      '<sos:SosInsertionMetadata>' +
        '<sos:observationType>http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_ComplexObservation</sos:observationType>' +
        '<sos:featureOfInterestType>gml:Feature</sos:featureOfInterestType>' +
      '</sos:SosInsertionMetadata>' +
    '</swes:metadata>' +
  '</swes:InsertSensor>';

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      // Parse response and extract offering ID
      var offeringTemp = this.responseText.split("swes:assignedOffering"); // returns >urn:osh:client:locationsource:001-sos</
      offering = offeringTemp[1].substring(1,offeringTemp[1].length - 2); // trims to return urn:osh:client:locationsource:001-sos

      // if post was successful, call function to insert template
      sendInsertTemplate(); // call insert template function with host name and offering ID
    } else {
      // alert(this.responseText);
    }
  };
  xhr.open("POST", 'http://' + hostName + ':8181/sensorhub/sos', true);
  xhr.setRequestHeader("Content-type", "application/xml");
  xhr.send(xmlSensorRequest);
}

function sendInsertTemplate () {
  var xmlTemplateRequest = '' +
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<sos:InsertResultTemplate service="SOS" version="2.0" ' +
    'xmlns:gml="http://www.opengis.net/gml/3.2" ' +
    'xmlns:om="http://www.opengis.net/om/2.0" ' +
    'xmlns:sos="http://www.opengis.net/sos/2.0" ' +
    'xmlns:swe="http://www.opengis.net/swe/2.0" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    '<sos:proposedTemplate>' +
      '<sos:ResultTemplate>' +
        '<sos:offering>' + offering + '</sos:offering>' +
        '<sos:observationTemplate>' +
          '<om:OM_Observation gml:id="OBS_001">' +
            '<om:phenomenonTime>' +
              '<gml:TimeInstant gml:id="T1">' +
                '<gml:timePosition indeterminatePosition="unknown"/>' +
              '</gml:TimeInstant>' +
            '</om:phenomenonTime>' +
            '<om:resultTime>' +
              '<gml:TimeInstant gml:id="T2">' +
                '<gml:timePosition indeterminatePosition="unknown"/>' +
              '</gml:TimeInstant>' +
            '</om:resultTime>' +
            '<om:procedure xsi:nil="true"/>' +
            '<om:observedProperty xsi:nil="true"/>' +
            '<om:featureOfInterest xsi:nil="true"/>' +
            '<om:result/>' +
          '</om:OM_Observation>' +
        '</sos:observationTemplate>' +
        '<sos:resultStructure>' +
          '<swe:DataRecord>' +
            '<swe:field name="time">' +
              '<swe:Time ' +
                'definition="http://www.opengis.net/def/property/OGC/0/SamplingTime" referenceFrame="http://www.opengis.net/def/trs/BIPM/0/UTC">' +
                '<swe:label>Sampling Time</swe:label>' +
                '<swe:uom xlink:href="http://www.opengis.net/def/uom/ISO-8601/0/Gregorian"/>' +
              '</swe:Time>' +
            '</swe:field>' +
            '<swe:field name="location">' +
              '<swe:Vector ' +
                'definition="http://www.opengis.net/def/property/OGC/0/SensorLocation" referenceFrame="http://www.opengis.net/def/crs/EPSG/0/4979">' +
                '<swe:coordinate name="lat">' +
                  '<swe:Quantity axisID="Lat">' +
                    '<swe:label>Geodetic Latitude</swe:label>' +
                    '<swe:uom code="deg"/>' +
                  '</swe:Quantity>' +
                '</swe:coordinate>' +
                '<swe:coordinate name="lon">' +
                  '<swe:Quantity axisID="Long">' +
                    '<swe:label>Longitude</swe:label>' +
                    '<swe:uom code="deg"/>' +
                  '</swe:Quantity>' +
                '</swe:coordinate>' +
                '<swe:coordinate name="alt">' +
                  '<swe:Quantity axisID="h">' +
                    '<swe:label>Altitude</swe:label>' +
                    '<swe:uom code="m"/>' +
                  '</swe:Quantity>' +
                '</swe:coordinate>' +
              '</swe:Vector>' +
            '</swe:field>' +
            '<swe:field name="keepZoom">' +
              '<swe:Boolean definition="http://sensorml.com/ont/swe/property/KeepZoom">' +
              '<swe:label>Keep Zoom</swe:label>' +
              '</swe:Boolean>' +
            '</swe:field>' +
          '</swe:DataRecord>' +
        '</sos:resultStructure>' +
        '<sos:resultEncoding>' +
          '<swe:TextEncoding blockSeparator="&#xa;" collapseWhiteSpaces="true" decimalSeparator="." tokenSeparator=","/>' +
        '</sos:resultEncoding>' +
      '</sos:ResultTemplate>' +
    '</sos:proposedTemplate>' +
  '</sos:InsertResultTemplate>';

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      // Parse response and extract offering ID
      var templateTemp = this.responseText.split("acceptedTemplate"); // returns >urn:osh:client:locationsource:001-sos#output1</
      template = templateTemp[1].substring(1,templateTemp[1].length - 2); // trims to return urn:osh:client:locationsource:001-sos#output1

      makeInsertResultConnection();

    } else {
      // alert(this.responseText);
    }
  };
  xhr.open("POST", 'http://' + hostName + ':8181/sensorhub/sos', true);
  xhr.setRequestHeader("Content-type", "application/xml");
  xhr.send(xmlTemplateRequest);
}

function makeInsertResultConnection (){
  console.log("establishing InsertResult ws connection");
  console.log("template = " + template);
  var insertUrl = 'ws://' + hostName + ':8181/sensorhub/sos?service=SOS&version=2.0&request=InsertResult&template=' + encodeURIComponent(template);
  insertWs = new WebSocket(insertUrl);
  insertWs.binaryType = 'arraybuffer';
  insertWs.onopen = function(event) {
    readyToSend = true;
  }

  insertWs.onerror = function(event) {
    console.log("InsertResult websocket error");
    readyToSend = false;
    insertWs.close();
  }

  insertWs.onclose = function() {
    console.log("ws disconnected");
    readyToSend = false;
    // setTimeout(makeInsertResultConnection, 1000);
  };
}

function makeGetResultWsConnection (offeringId) {
  var getUrl = 'ws://' + hostName +
    ':8181/sensorhub/sos?service=SOS&version=2.0&request=GetResult&offering=' + offeringId +
    '&observedProperty=http://www.opengis.net/def/property/OGC/0/SensorLocation&temporalFilter=phenomenonTime,now/2100-01-01';
  console.log("making ws connction with " + offeringId);
  getWs = new WebSocket(getUrl);
  getWs.binaryType = 'arraybuffer';

  getWs.onmessage = function(event) {
    // console.log("getting data from " + offeringId);
    if(readyToSend) {
      // Incoming records are in format [time, lat, lon, alt]
      // So parse incoming record and create new record in format [time, lat, lon, alt, keepZoom]
      var eventDataString = String.fromCharCode.apply(null, new Uint8Array(event.data));
      var eventDataStringTokens = eventDataString.split(",");
      var eventTime = eventDataStringTokens[0];
      var eventLat = parseFloat(eventDataStringTokens[1]);
      var eventLon = parseFloat(eventDataStringTokens[2]);
      var eventAlt = parseFloat(eventDataStringTokens[3]);
      var eventKeepZoom = getKeepZoom();
      // Create new event data string
      var eventString = eventTime + ',' + eventLat + ',' + eventLon + ',' + eventAlt + ',' + eventKeepZoom;
      var tempEventString = btoa(unescape(encodeURIComponent(eventString))); // Base 64 string
      var eventCharList = eventString.split(''); // Split string into individual chars
      var eventUintArray = []; // Declare empty array
      for (var i = 0; i < eventCharList.length; i++) {
        eventUintArray.push(eventCharList[i].charCodeAt(0)); // Load uintArray with chars from string
      }
      // console.log("sending " + String.fromCharCode.apply(null, new Uint8Array(new Uint8Array(eventUintArray).buffer)) + " to ws...");
      insertWs.send(new Uint8Array(eventUintArray).buffer); // send new array buffer to websocket
    }
  }

  getWs.onerror = function(event) {
    console.log("GetResult websocket error");
    getWs.close();
  }
}

function closeGetResultWsConnection () {
  if (typeof(getWs) != "undefined") {
    console.log("closing get Result websocket");
    getWs.close();
  }
}

function getGetResultWsConnectionStatus () {
  if (typeof(getWs) != "undefined") {
    return getWs.readyState;
  }
  else {
    return WebSocket.CLOSED;
  }
}

function insertClickToTaskData (locData) {
  if(readyToSend && clickToTaskEnabled) {
    console.log("inserting location from click");
    console.log("sending " + String.fromCharCode.apply(null, new Uint8Array(locData)) + " to ws");
    insertWs.send(locData);
  }
}

function enableClickToTask () {
  clickToTaskEnabled = true;
}

function disableClickToTask () {
  clickToTaskEnabled = false;
}

function enableKeepZoom () {
  keepZoom = true;
}

function disableKeepZoom () {
  keepZoom = false;
}

function getKeepZoom () {
  if (typeof(keepZoom) !== 'undefined') {
    return keepZoom;
  } else {
    return false;
  }
}

function getElevation (lat, lon, tileLevel, fn) {
  var terrainProvider = new Cesium.CesiumTerrainProvider({
    url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles'
  });
  var position = [ Cesium.Cartographic.fromDegrees(lon, lat) ];
  var promise = Cesium.sampleTerrain(terrainProvider, tileLevel, position);
  Cesium.when(promise, function(updatedPositions) {
    // position[0].height has been updated.
    fn(position[0].height);
  });
}
