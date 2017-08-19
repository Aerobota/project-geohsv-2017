function init() {

    var hostName = "botts-geo.com:8181";
    var localhostName = "localhost:8181";

    // time settings
    // for real-time
    var startTime = "now";
    var endTime = "2080-01-01T00:00:00Z";
    var sync = false;
    
    // for replay
    /*var startTime = "2017-08-17T20:59:06Z";
    var endTime = "2017-08-17T21:17:33Z";
    var sync = true;*/

    var replaySpeed = "1";
    var bufferingTime = 100;
    var dataStreamTimeOut = 4000;
    var useFFmpegWorkers = true;
        
    // MSL to ellipsoid correction
    //var mslToWgs84 = 53.5; // Toulouse
    //var mslToWgs84 = -29.5+5; // Huntsville Airport Road
    var mslToWgs84 = -40; // Huntsville VBC roof
    //var mslToWgs84 = -29-4; // Madison
    var soloHeadingAdjust = 0.0;
    var soloAltitudeAdjust = 0.0; 
    
    // menu ids
    var treeMenuId = "tree-menu-";
    var mapMenuId = "map-menu-";
    var menuGroupId = "allmenus";
    
    
    // ---------------------------------------------------------------//
    // ------------------- Data Sources Controller -------------------//
    // ---------------------------------------------------------------//

    var dataSourceController = new OSH.DataReceiver.DataReceiverController({
        replayFactor: 1.0
    });
    
    
    //--------------------------------------------------------------//
    //------------------------  Map View(s)  -----------------------//
    //--------------------------------------------------------------//
        
    var cesiumView = new OSH.UI.CesiumView("main-container", []);
    
    // add building models
    var position = Cesium.Cartesian3.fromDegrees(-86.59079648585, 34.72699075691, 153.0);
    var orientation = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(0.2331612632112), 0, 0);
    var quat = Cesium.Transforms.headingPitchRollQuaternion(position, orientation);
    cesiumView.viewer.entities.add({
        name : "Von Braun Center",
        position : position,
        orientation : quat,
        model : {
            uri : "./models/von_braun_center.glb"
        }
    });

    // --------------------------------------------------------------//
    // ------------------------- Entities ---------------------------//
    // --------------------------------------------------------------//
    
    var treeItems = [];
    //addSoloUav("solo1-local", "3DR Solo", "urn:osh:solo-nav", "urn:osh:solo-video");
    addSoloUav("solo1", "3DR Solo", "urn:osh:sensor:mavlink:solo:S115A58000000-sos", "urn:osh:sensor:rtpcam:solo:S115A58000000-sos");
    addAndroidPhone("android1", "Officer Alex", "urn:android:device:a0e0eac2fea3f614-sos", null, 0.0);
    addAndroidPhone("android2", "Officer Mike", "urn:android:device:89845ed469b7edc7-sos", null, 0.0);
    addAndroidPhone("android3", "Officer LRF", "urn:android:device:e7e86a0c6539c18a-sos", null, 0.0);
    //addAndroidPhone("android4", "Alex - Nexus5X", "urn:android:device:cac2076d70a6090f-sos", null, 0.0);
    //addAndroidPhone("android5", "Ian - HTC", "urn:android:device:1aea89f8ebbd4b09-sos", null, 0.0);
    addDahuaCam("cityhall", "City Hall Camera", "urn:osh:cityhall", 24.0);
    

    // --------------------------------------------------------------//
    // ------------------------ Tree View ---------------------------//
    // --------------------------------------------------------------//
    
    var entityTreeDialog = new OSH.UI.DialogView(document.body.id, {
        css: "tree-dialog",
        name: "Entities",
        show: true,
        draggable: true,
        dockable: false,
        closeable: true
    });
    
    var entityTreeView = new OSH.UI.EntityTreeView(entityTreeDialog.popContentDiv.id, treeItems, {
        css: "tree-container"
    });
    
    // time slider view
    if (startTime !== 'now') {
        var rangeSlider = new OSH.UI.RangeSlider("rangeslider-container", {
            startTime: startTime,
            endTime: endTime,
            css: "rangeSlider"
        });
    }

    // drone adjustment sliders
    addAdjusmentSliders();

    // start streams and display
    dataSourceController.connectAll();

    initWFST();

    //--------------------------------------------------------------//
    //------ Helper methods to add specific types of sensors -------//
    //--------------------------------------------------------------//
    
    function addSoloUav(entityID, entityName, navOfferingID, videoOfferingID) {
        
        // create data sources
        var videoData = new OSH.DataReceiver.VideoH264("Video", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: videoOfferingID,
            observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var locationData = new OSH.DataReceiver.LatLonAlt("Location", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: navOfferingID,
            observedProperty: "http://www.opengis.net/def/property/OGC/0/PlatformLocation",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var attitudeData = new OSH.DataReceiver.EulerOrientation("Orientation", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: navOfferingID,
            observedProperty: "http://www.opengis.net/def/property/OGC/0/PlatformOrientation",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var gimbalData = new OSH.DataReceiver.EulerOrientation("Orientation", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: navOfferingID,
            observedProperty: "http://sensorml.com/ont/swe/property/OSH/0/GimbalOrientation",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        // create entity
        var entity = {
            id: entityID,
            name: entityName,
            dataSources: [videoData, locationData, attitudeData, gimbalData]
        };
        dataSourceController.addEntity(entity);
        
        // add item to tree
        treeItems.push({
            entity : entity,
            path: "UAVs",
            treeIcon : "images/drone.png",
            contextMenuId: treeMenuId + entityID
        });
        
        // video view
        var videoDialog = new OSH.UI.DialogView("dialog-main-container", {
            draggable: false,
            css: "video-dialog",
            name: entityName,
            show: true,
            dockable: true,
            closeable: true,
            canDisconnect : true,
            swapId: "main-container",
            connectionIds: [videoData.getId()]
        });
        
        var videoView = new OSH.UI.FFMPEGView(videoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId : entity.id,
            css: "video",
            cssSelected: "video-selected",
            useWorker: useFFmpegWorkers,
            width: 1280,
            height: 720
        });
        /*var videoView = new OSH.UI.H264View(soloVideoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId : entity.id,
            css: "video",
            cssSelected: "video-selected",
            width: 1280,
            height: 720
        });*/
        
        // add 3D model marker to Cesium view
        var pointMarker = new OSH.UI.Styler.PointMarker({
            label: "3DR Solo",
            locationFunc : {
                dataSourceIds : [locationData.getId()],
                handler : function(rec) {
                    return {
                        x : rec.lon,
                        y : rec.lat,
                        z : rec.alt+mslToWgs84-5. // model offset
                    };
                }
            },
            orientationFunc : {
                dataSourceIds : [attitudeData.getId()],
                handler : function(rec) {
                    return {
                        heading : rec.heading
                    };
                }
            },
            icon: "./models/Drone+06B.glb"
        });
        
        cesiumView.addViewItem({
            name: "3DR Solo",
            entityId: entityID,
            styler:  pointMarker,
            contextMenuId: mapMenuId+entityID
        });        
        
        // add draped imagery to Cesium view
        var videoCanvas = document.getElementById(videoView.getId()).getElementsByTagName("canvas")[0];
        cesiumView.addViewItem({
            name: "Geolocated Imagery",
            entityId: entityID,
            styler:  new OSH.UI.Styler.ImageDraping({
                platformLocationFunc: {
                    dataSourceIds: [locationData.getId()],
                    handler: function(rec) {
                        return {
                            x: rec.lon,
                            y: rec.lat,
                            z: rec.alt + mslToWgs84 + soloAltitudeAdjust
                        };
                    }
                },
                platformOrientationFunc: {
                    dataSourceIds: [attitudeData.getId()],
                    handler: function(rec) {
                        return {
                            heading: rec.heading + soloHeadingAdjust,
                            pitch: 0,// rec.pitch,
                            roll: 0,// rec.roll
                        };
                    }
                },
                gimbalOrientation: {
                    heading: 0,
                    pitch: -90,
                    roll: 0
                },
                gimbalOrientationFunc: {
                    dataSourceIds: [gimbalData.getId()],
                    handler: function(rec) {
                        return {
                            heading: rec.heading,
                            pitch: rec.pitch, //-90,
                            roll: 0,// rec.roll
                        };
                    }
                },
                /*snapshotFunc: function() {
                    var enabled = takePicture;
                    takePicture = false; return enabled;
                },*/                
                /* GoPro Alex */
                /*
                 * cameraModel: { camProj: new Cesium.Matrix3(435.48/752., 0.0,
                 * 370.20/752., 0.0, 436.62/423., 216.52/423., 0.0, 0.0, 1.0),
                 * camDistR: new Cesium.Cartesian3(-2.60e-01, 8.02e-02, 0.0),
                 * camDistT: new Cesium.Cartesian2(-2.42e-04, 2.61e-04) },
                 */
                /* GoPro Mike */
                cameraModel: {
                    camProj: new Cesium.Matrix3(747.963/1280.,     0.0,       650.66/1280.,
                                                   0.0,        769.576/738.,  373.206/738.,
                                                   0.0,            0.0,          1.0),
                    camDistR: new Cesium.Cartesian3(-2.644e-01, 8.4e-02, 0.0),
                    camDistT: new Cesium.Cartesian2(-8.688e-04, 6.123e-04)
                },
                imageSrc: videoCanvas
            })
        });
        
        // altitude chart view        
        var altChartDialog = new OSH.UI.DialogView("dialog-main-container", {
            draggable: false,
            css: "video-dialog",
            name: entityName + " - Altitude",
            show: false,
            dockable: true,
            closeable: true,
            canDisconnect : true,
            swapId: "main-container",
            connectionIds: [locationData.getId()]
        });
        
        var altChartView = new OSH.UI.Nvd3CurveChartView(altChartDialog.popContentDiv.id,
        [{
            styler: new OSH.UI.Styler.Curve({
                valuesFunc: {
                    dataSourceIds: [locationData.getId()],
                    handler: function (rec, timeStamp) {
                        return {
                            x: timeStamp,
                            y: rec.alt+mslToWgs84
                        };
                    }
                }
            })
        }],
        {
            dataSourceId: locationData.getId(),
            yLabel: 'Altitude (m)',
            xLabel: 'Time',
            maxPoints: 200,
            css:"chart-view",
            cssSelected: "video-selected"
        });
        
        // add tree and map context menus        
        var treeMenuItems = [{
            name: "Show Video",
            viewId: videoDialog.getId(),
            css: "fa fa-video-camera",
            action: "show"
        },{
            name: "Show Altitude",
            viewId: altChartDialog.getId(),
            css: "fa fa-bar-chart",
            action: "show"
        }];
        
        var mapView = cesiumView;
        var mapMenuItems = [{
            name: "Go Here",
            viewId: mapView.getId(),
            css: "fa fa-crosshairs fa-3x",
            action: "uav:goto"
        },{
            name: "Orbit Here",
            viewId: mapView.getId(),
            css: "fa fa-undo fa-3x",
            action: "uav:orbit"
        },{
            name: "Look Here",
            viewId: mapView.getId(),
            css: "fa fa-eye fa-3x",
            action: "uav:lookat"
        },{
            name: "Land Here",
            viewId: mapView.getId(),
            css: "fa fa-download fa-3x",
            action: "uav:land"
        }];
    
        var treeMenu = new OSH.UI.ContextMenu.StackMenu({id: treeMenuId+entityID, groupId: menuGroupId, items: treeMenuItems});   
        var mapMenu = new OSH.UI.ContextMenu.CircularMenu({id:mapMenuId+entityID, groupId: menuGroupId, items: mapMenuItems});
        
        return entity;
    }
    
    
    function addAndroidPhone(entityID, entityName, offeringID, flirOfferingID, headingOffset) {
        
        // create data sources
        var videoData = new OSH.DataReceiver.VideoH264("Video", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var locationData = new OSH.DataReceiver.LatLonAlt("Location", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/Location",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
    
        var attitudeData = new OSH.DataReceiver.OrientationQuaternion("Orientation", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/OrientationQuaternion",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var flirVideo = null;
        if (typeof(flirOfferingID) != "undefined" && flirOfferingID != null) {
            flirVideo = new OSH.DataReceiver.VideoMjpeg("FLIR Video", {
                protocol : "ws",
                service: "SOS",
                endpointUrl: hostName + "/sensorhub/sos",
                offeringID: flirOfferingID,
                observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
                startTime: startTime,
                endTime: endTime,
                replaySpeed: "1",
                syncMasterTime: sync,
                bufferingTime: bufferingTime,
                timeOut: dataStreamTimeOut
            });
        }
        
        // create entity
        var entity = {
            id: entityID,
            name: entityName,
            dataSources: [videoData, locationData, attitudeData]
        };
        
        if (flirVideo != null)
            entity.dataSources.push(flirVideo);
        
        dataSourceController.addEntity(entity);
        
        // add item to tree
        treeItems.push({
            entity : entity,
            path: "Body Cams",
            treeIcon : "images/cameralook.png",
            contextMenuId: treeMenuId + entity.id
        });
        
        // add marker to map
        cesiumView.addViewItem({
            name: entityName,
            entityId : entity.id,
            styler : new OSH.UI.Styler.PointMarker({
                locationFunc : {
                    dataSourceIds : [locationData.getId()],
                    handler : function(rec) {
                        return {
                            x : rec.lon,
                            y : rec.lat,
                            z : rec.alt
                        };
                    }
                },
                orientationFunc : {
                    dataSourceIds : [attitudeData.getId()],
                    handler : function(rec) {
                        return {
                            heading : rec.heading + headingOffset
                        };
                    }
                },
                icon : 'images/rover-fov.png',
                label : entityName
            }),
            contextMenuId: mapMenuId+entityID                     
        });
        
        // video view
        var videoDialog = new OSH.UI.DialogView("dialog-main-container", {
            draggable: false,
            css: "video-dialog-43",
            name: entityName,
            show: false,
            dockable: true,
            closeable: true,
            canDisconnect : true,
            swapId: "main-container",
            connectionIds: [videoData.getId()]
        });
        
        var videoView = new OSH.UI.FFMPEGView(videoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId : entity.id,
            css: "video",
            cssSelected: "video-selected",
            useWorker: useFFmpegWorkers,
            width: 800,
            height: 600
        });
        
        var flirVideoDialog = null;
        if (flirVideo != null) {
            flirVideoDialog = new OSH.UI.DialogView("dialog-main-container", {
                draggable: false,
                css: "video-dialog",
                name: entityName + " - FLIR Cam",
                show: false,
                dockable: true,
                closeable: true,
                canDisconnect : true,
                swapId: "main-container",
                connectionIds: [flirVideo.getId()]
            });
            
            var flirVideoView = new OSH.UI.MjpegView(flirVideoDialog.popContentDiv.id, {
                dataSourceId: flirVideo.getId(),
                entityId : entity.id,
                css: "video",
                cssSelected: "video-selected",
                rotation: -90
            });
        }
        
        // add tree and map context menus
        var menuItems = [];
        menuItems.push({
            name: "Show Video",
            viewId: videoDialog.getId(),
            css: "fa fa-video-camera",
            action: "show"
        });
        
        if (flirVideoDialog != null) {
            menuItems.push({
                name: "Show FLIR Video",
                viewId: flirVideoDialog.getId(),
                css: "fa fa-video-camera",
                action: "show"
            });
        }
    
        var markerMenu = new OSH.UI.ContextMenu.CircularMenu({id:mapMenuId+entityID, groupId: menuGroupId, items: menuItems});
        var treeMenu = new OSH.UI.ContextMenu.StackMenu({id: treeMenuId+entityID, groupId: menuGroupId, items: menuItems});
        
        return entity;
    }


    function addDahuaCam(entityID, entityName, offeringID, heading) {
        
        // create data sources
        var videoData = new OSH.DataReceiver.VideoH264("Video", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var locationData = new OSH.DataReceiver.LatLonAlt("Location", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://www.opengis.net/def/property/OGC/0/SensorLocation",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });

        var headingData = new OSH.DataReceiver.EulerOrientation("Orientation", {
	    protocol : "ws",
	    service: "SOS",
	    endpointUrl: hostName + "/sensorhub/sos",
	    offeringID: offeringID,
	    observedProperty: "http://sensorml.com/ont/swe/property/Pan",
	    startTime: startTime,
	    endTime: endTime,
	    replaySpeed: "1",
	    syncMasterTime: sync,
	    bufferingTime: bufferingTime,
	    timeOut: dataStreamTimeOut
        });
        
        // create entity
        var entity = {
            id: entityID,
            name: entityName,
            dataSources: [videoData, locationData, headingData]
        };
        dataSourceController.addEntity(entity);
        
        // add item to tree
        treeItems.push({
            entity : entity,
            path: "PTZ Cams",
            treeIcon : "images/cameralook.png",
            contextMenuId: treeMenuId + entity.id
        })
        
        // add marker to map
        cesiumView.addViewItem({
            name: entityName,
            entityId : entity.id,
            styler : new OSH.UI.Styler.PointMarker({
                locationFunc : {
                    dataSourceIds : [locationData.getId()],
                    handler : function(rec) {
                        return {
                            x : rec.lon,
                            y : rec.lat,
                            z : rec.alt
                        };
                    }
                },
                orientationFunc : {
                    dataSourceIds: [headingData.getId()],
                    handler : function(rec,timeStamp,options) {
                      return {
                        heading: heading - rec.heading
                      }
                    }
                },
                icon : 'images/cameralook.png',
                iconFunc : {
                    dataSourceIds: [locationData.getId()],
                    handler : function(rec,timeStamp,options) {
                        if(options.selected) {
                            return 'images/cameralook-selected.png'
                        } else {
                            return 'images/cameralook.png';
                        }
                    }
                }
            }),
            contextMenuId: mapMenuId+entityID
        });
        
        // video view
        var videoDialog = new OSH.UI.DialogView("dialog-main-container", {
            draggable: false,
            css: "video-dialog",
            name: entityName,
            show: true,
            dockable: true,
            closeable: true,
            canDisconnect : true,
            swapId: "main-container",
            connectionIds: [videoData.getId()]
        });
        
        var videoView = new OSH.UI.FFMPEGView(videoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId : entity.id,
            css: "video",
            cssSelected: "video-selected",
            useWorker: useFFmpegWorkers,
            width: 1280,
            height: 720
        });
        
        // add tree and map context menus
        var menuItems = [{
            name: "Show Video",
            viewId: videoDialog.getId(),
            css: "fa fa-video-camera",
            action: "show"
        }];
    
        var markerMenu = new OSH.UI.ContextMenu.CircularMenu({id:mapMenuId+entityID, groupId: menuGroupId, items: menuItems});
        var treeMenu = new OSH.UI.ContextMenu.StackMenu({id: treeMenuId+entityID, groupId: menuGroupId, items: menuItems});   
        
        // tasking controller
        var dahua1Tasking = new OSH.DataSender.PtzTasking("video-tasking", {
            protocol: "http",
            service: "SPS",
            version: "2.0",
            endpointUrl: hostName + ":8181/sensorhub/sps",
            offeringID: "urn:dahua:cam:1G0215CGAK00046"
            //offeringID: "urn:axis:cam:00408CB95A55" // for axis
        });
        
        return entity;
    }


    function initWFST() {
        
        var WFS_PROJECTION = "EPSG:3857";
        
	var featureType = 'wfs_color';
        var wfsService = new CesiumWFST({
            featureNS: 'https://gsx.geolytix.net/geoserver/geolytix_wfs',
            featureType: featureType,
            srsName: WFS_PROJECTION,
            url:"https://gsx.geolytix.net/geoserver/geolytix_wfs/ows"
        });

        wfsService.onError = function(response) {
            console.log("Error: cannot read WFS stream: "+response);
        };

        // start the draw helper to enable shape creation and editing
        var drawHelper = new DrawHelper(cesiumView.viewer);

        var toolbar = drawHelper.addToolbar(document.getElementById("toolbar"), {
            buttons: ['marker', 'polyline', 'polygon', 'delete']
        });

        // add draw helper listener
        toolbar.addListener('markerCreated', drawHelperMarkerCreatedListener);
        toolbar.addListener('polylineCreated', drawHelperPolylineCreatedListener);
        toolbar.addListener('polygonCreated', drawHelperPolygonCreatedListener);
        toolbar.addListener('primitiveDeleted', drawHelperPrimitiveDeletedListener);

        var i = 0;
        // read features from WFS
        var onSuccessRead = function(geometryArray) {
            for(let i=0;i < geometryArray.length;i++) {
                var primitive = geometryArray[i];

                if(primitive.isPolygon || primitive.isPolyline) {
                    cesiumView.viewer.scene.primitives.add(primitive);
                    primitive.setShowName();
                }

                else if(primitive.isPoint) {
                    var b = new Cesium.BillboardCollection();
                    cesiumView.viewer.scene.primitives.add(b);
                    var billboard = b.add(primitive);
                    
                    // for test server only, should map the real name from the name field
                    billboard.name = primitive.extra.color;
                    //billboard.name = primitive.name

                    billboard.setShowName();
                }
            }
        };

        var onSuccessWrite = function(message) {
            refresh();
        };

        var bounds = "-20026376.39%2C-20048966.10%2C20026376.39%2C20048966.10";
        var request = "service=WFS&version=1.1.0&request=GetFeature&typename="+featureType+"&srsname=EPSG%3A3857&bbox="+bounds+"%2CEPSG%3A3857";

        wfsService.readAsCesiumPrimitives(request,onSuccessRead);

        //-------- CESIUM DRAW HELPER LISTENERS ---------------//

        function drawHelperMarkerCreatedListener(event) {
            // create one common billboard collection for all billboards

            var point = {
                show : true,
                position : event.position,
                pixelOffset : new Cesium.Cartesian2(0, 0),
                eyeOffset : new Cesium.Cartesian3(0.0, 0.0, 0.0),
                horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
                verticalOrigin : Cesium.VerticalOrigin.CENTER,
                scale : 1.0,
                image: './img/glyphicons_242_google_maps.png',
                color : new Cesium.Color(1.0, 1.0, 1.0, 1.0),
                isPoint:true,
                name: prompt("Please enter a name for the feature", "")
            };

            wfsService.writeTransactionAsCesiumPrimitives(point,null,null,"marker",onSuccessWrite);
        }

        function drawHelperPolylineCreatedListener(event) {
            var polyline = new DrawHelper.PolylinePrimitive({
                positions: event.positions,
                width: 5,
                geodesic: true
            });
            polyline.name = prompt("Please enter a name for the feature", "");

            wfsService.writeTransactionAsCesiumPrimitives(polyline,null,null,"polyline",onSuccessWrite);
        }

        function drawHelperPolygonCreatedListener(event) {
            var cesiumPolygon = new DrawHelper.PolygonPrimitive({
                positions: event.positions
                //material : Cesium.Material.fromType('Checkerboard')
            });

            cesiumPolygon.name = prompt("Please enter a name for the feature", "");

            wfsService.writeTransactionAsCesiumPrimitives(cesiumPolygon,null,null,"polygon",onSuccessWrite);
        }

        function drawHelperPrimitiveDeletedListener(event) {
            var primitive = event.primitive;
            var type = "polygon";
            if(primitive.isPoint) {
                type = "marker";
            } else if(primitive.isPolyline) {
                type = "polyline";
            }
            wfsService.writeTransactionAsCesiumPrimitives(null,null,primitive,type,onSuccessWrite);
        }

        function refresh() {
            //cesiumView.viewer._cesiumWidget.scene.primitives.removeAll();
            wfsService.readAsCesiumPrimitives(request,onSuccessRead);
        }
    }


    function addAdjusmentSliders() {
        
        var headingAdj = document.getElementById("headingAdj");
        var headingAdjVal = document.getElementById("headingAdjVal");
        headingAdj.min = -200;
        headingAdj.max = 200;
        headingAdj.value = 0;
        headingAdj.oninput = function() {
            soloHeadingAdjust = headingAdj.value/10.0;
            headingAdjVal.innerHTML = " "+soloHeadingAdjust+"°";
        };

        var altitudeAdj = document.getElementById("altitudeAdj");
        var altitudeAdjVal = document.getElementById("altitudeAdjVal");
        altitudeAdj.min = -250;
        altitudeAdj.max = 250;
        altitudeAdj.value = 0;
        altitudeAdj.oninput = function() {
            soloAltitudeAdjust = altitudeAdj.value/10.0;
            altitudeAdjVal.innerHTML = " "+soloAltitudeAdjust+"m";
        };
    }

} // end init()



var takePicture = false;
function snapshotClick () {
    takePicture=true;
}
