var wsReady = false;
var template = null;

function connectToWebSocket (hostName, uid, name, offeringId) {
  sendInsertSensor(hostName, uid, name, offeringId);
}


function sendInsertSensor (hostName, uid, name, offeringId) {
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
    if(xhr.readyState == 4 && xhr.status == 200) {
      // Parse response and extract offering ID
      var offeringTemp = xhr.responseText.split("swes:assignedOffering"); // returns >urn:osh:client:locationsource:001-sos</
      var offering = offeringTemp[1].substring(1,offeringTemp[1].length - 2); // trims to return urn:osh:client:locationsource:001-sos

      // if post was successful, call function to insert template
      sendInsertTemplate(hostName, offering, offeringId); // call insert template function with host name and offering ID
    } else {
      // alert(xhr.responseText);
    }
  };
  xhr.open("POST", 'http://' + hostName + ':8181/sensorhub/sos', true);
  xhr.setRequestHeader("Content-type", "application/xml");
  xhr.send(xmlSensorRequest);
}

function sendInsertTemplate (hostName, offering, offeringId) {
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
    if(xhr.readyState == 4 && xhr.status == 200) {
      // Parse response and extract offering ID
      var templateTemp = xhr.responseText.split("acceptedTemplate"); // returns >urn:osh:client:locationsource:001-sos#output1</
      template = templateTemp[1].substring(1,templateTemp[1].length - 2); // trims to return urn:osh:client:locationsource:001-sos#output1

      wsReady = true;
      // makeWsConnection(hostName, template, offeringId);

    } else {
      // alert(xhr.responseText);
    }
  };
  xhr.open("POST", 'http://' + hostName + ':8181/sensorhub/sos', true);
  xhr.setRequestHeader("Content-type", "application/xml");
  xhr.send(xmlTemplateRequest);
}

function makeWsConnection (hostName, template, offeringId) {

if (wsReady) {
    var getUrl = 'ws://' + hostName +
      ':8181/sensorhub/sos?service=SOS&version=2.0&request=GetResult&offering=' + offeringId +
      '&observedProperty=http://www.opengis.net/def/property/OGC/0/SensorLocation&temporalFilter=phenomenonTime,now/2100-01-01';
    var getWs = new WebSocket(getUrl);
    getWs.binaryType = 'arraybuffer';

    var insertUrl = 'ws://' + hostName + ':8181/sensorhub/sos?service=SOS&version=2.0&request=InsertResult&template=' + encodeURIComponent(template);
    var insertWs = new WebSocket(insertUrl);
    insertWs.binaryType = 'arraybuffer';

    var readyToSend = false;
    insertWs.onopen = function(e) {
      readyToSend = true;
    }

    insertWs.onerror = function(event) {
      console.log("InsertResult websocket error");
      insertWs.close();
    }

    getWs.onmessage = function(event) {
      // console.log("inserting " + String.fromCharCode.apply(null, new Uint8Array(event.data)));
      if(readyToSend) {
        insertWs.send(event.data);
      }
    }

    getWs.onerror = function(event) {
      console.log("GetResult websocket error");
      getWs.close();
    }
  }
  else {
    console.log("not ready for websocket connection");
  }
}
