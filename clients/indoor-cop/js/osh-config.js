function init() {

    var stHostName = "botts-geo.com:8181";
    var hostName = "localhost:8181";

    // time settings
    // for real-time
    var startTime = "now";
    var endTime = "2080-01-01T00:00:00Z";
    var sync = false;
    
    // for replay
    /*var startTime = "2017-08-17T22:37:21.005Z";
    var endTime = "2017-08-17T22:47:15.042Z";
    var sync = true;*/

    var replaySpeed = "1";
    var bufferingTime = 100;
    var dataStreamTimeOut = 4000;
    var useFFmpegWorkers = true;
    
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
    cesiumView.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

    var lat = 34.72704;
    var lon = -86.59074;
    var halfsize = 0.002045;
    var aratio = 0.8;
    var east = lon + halfsize*aratio;
    var west = lon - halfsize*aratio;
    var north = lat + halfsize;
    var south = lat - halfsize;
    var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

    var vbc = cesiumView.viewer.entities.add({
        rectangle: {
	    coordinates: rectangle,
            material: new Cesium.ImageMaterialProperty({
                image: './models/vbc_facility_rot.png',
                transparent: true
            })
        }
    });

    // to get cursor coordinates
    /*cesiumView.viewer.canvas.addEventListener('click', function(e) {
        var mousePosition = new Cesium.Cartesian2(e.clientX, e.clientY);
        var ellipsoid = cesiumView.viewer.scene.globe.ellipsoid;
        var cartesian = cesiumView.viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
        if (cartesian) {
    	    var cartographic = ellipsoid.cartesianToCartographic(cartesian);
    	    var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
    	    var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
		alert(lon + ', ' + lat);
        }
    }, false);*/

    
    // --------------------------------------------------------------//
    // ------------------------- Entities ---------------------------//
    // --------------------------------------------------------------//
    
    var treeItems = [];

    addAndroidPhoneFixedLocation("android1", "South Hall - North Corridor", "urn:android:device:a0e0eac2fea3f614-sos", null, -86.591422, 34.726705, 110);
    addAndroidPhoneFixedLocation("android2", "South Hall - West Corridor", "urn:android:device:cac2076d70a6090f-sos", null, -86.592062, 34.726267, 220);

    addAxisCam("axis1", "Cam - Catwalk South", "urn:axis:cam:177", -86.591095, 34.725740, 120);
    addAxisCam("axis2", "Cam - Catwalk North", "urn:axis:cam:180", -86.591433, 34.726129, 185);
    addAxisCam("axis3", "Cam - South Corridor", "urn:axis:cam:185", -86.590567, 34.725419, 125);
    addAxisCam("axis4", "Cam - Ballroom 1", "urn:axis:cam:190", -86.590618, 34.725662, 90);
    addAxisCam("axis5", "Cam - Ballroom 2", "urn:axis:cam:195", -86.591025, 34.725376, 45);

    addMotionSensor("motion1", "Motion - South East", "urn:osh:client:c99a7368-1bc1-4f00-82ce-cf0072ffbec5", -86.590321, 34.725591);
    addMotionSensor("motion1", "Motion - South West", null, -86.590970, 34.725154);
    addMotionSensor("motion1", "Motion - North East", null, -86.591303, 34.726620);
    addMotionSensor("motion1", "Motion - North West", null, -86.591934, 34.726383);

    addDoorSensor("door1", "Access North East", "urn:osh:client:94dc0797-f0ca-497c-893d-5fb0ce350711", -86.591568, 34.726743);
    addDoorSensor("door2", "Loading Dock 1", null, -86.592039, 34.726109);
    addDoorSensor("door3", "Loading Dock 2", null, -86.591961, 34.726008);
    addDoorSensor("door4", "Access South West 1", null, -86.591290, 34.725343);
    addDoorSensor("door5", "Access South West 2", null, -86.591085, 34.725119);

    addUwbTag("uwb1", "VIP Tracker", "urn:osh:sensor:trek1000:EVB110870-sos");


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

    // start streams and display
    dataSourceController.connectAll();
    cesiumView.viewer.flyTo(vbc, {offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-90), 500)});

    //initWFST();

    //--------------------------------------------------------------//
    //------ Helper methods to add specific types of sensors -------//
    //--------------------------------------------------------------//
        
    function addAndroidPhoneFixedLocation(entityID, entityName, offeringID, flirOfferingID, lon, lat, heading) {
        
        // create data sources
        var videoData = new OSH.DataReceiver.VideoH264("Video", {
            protocol: "ws",
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
        
        var flirVideo = null;
        if (typeof(flirOfferingID) != "undefined" && flirOfferingID != null) {
            flirVideo = new OSH.DataReceiver.VideoMjpeg("FLIR Video", {
                protocol: "ws",
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
            dataSources: [videoData]
        };
        
        if (flirVideo != null)
            entity.dataSources.push(flirVideo);
        
        dataSourceController.addEntity(entity);
        
        // add item to tree
        treeItems.push({
            entity: entity,
            path: "Adhoc Cams",
            treeIcon: "images/cameralook.png",
            contextMenuId: treeMenuId + entity.id
        });
        
        // add marker to map
        cesiumView.addViewItem({
            name: entityName,
            entityId: entity.id,
            styler: new OSH.UI.Styler.PointMarker({
                location: {
                    x: lon,
                    y: lat,
                    z: 0
                },
                orientation: {
                    heading: heading
                },
                icon: 'images/cameralook.png',
                label: entityName
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
            canDisconnect: true,
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


    function addAxisCam(entityID, entityName, offeringID, lon, lat, heading) {
        
        // create data sources
        var videoData = new OSH.DataReceiver.VideoMjpeg("Video", {
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
        
        // create entity
        var entity = {
            id: entityID,
            name: entityName,
            dataSources: [videoData]
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
                location : {
                    x : lon,
                    y : lat,
                    z : 0
                },
                orientation : {
                    heading: heading
                },
                icon : 'images/cameralook.png',
                label: entityName
            }),
            contextMenuId: mapMenuId+entityID
        });
        
        // video view
        var videoDialog = new OSH.UI.DialogView("dialog-main-container", {
            draggable: false,
            css: "video-dialog",
            name: entityName,
            show: false,
            dockable: true,
            closeable: true,
            canDisconnect : true,
            swapId: "main-container",
            connectionIds: [videoData.getId()]
        });
        
        /*var videoView = new OSH.UI.FFMPEGView(videoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId : entity.id,
            css: "video",
            cssSelected: "video-selected",
            useWorker: useFFmpegWorkers,
            width: 1280,
            height: 720
        });*/
        var videoView = new OSH.UI.MjpegView(videoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId : entity.id,
            css: "video",
            cssSelected: "video-selected",
            keepRatio: true
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
        /*var dahua1Tasking = new OSH.DataSender.PtzTasking("video-tasking", {
            protocol: "http",
            service: "SPS",
            version: "2.0",
            endpointUrl: hostName + ":8181/sensorhub/sps",
            offeringID: "urn:dahua:cam:1G0215CGAK00046"
            //offeringID: "urn:axis:cam:00408CB95A55" // for axis
        });*/
        
        return entity;
    }


    function addMotionSensor(entityID, entityName, offeringID, lon, lat) {
        
        // create data sources
        var sensorData = new OSH.DataReceiver.JSON("Motion", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: stHostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/MotionSensor",
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
            dataSources: [sensorData]
        };
        dataSourceController.addEntity(entity);
        
        // add item to tree
        treeItems.push({
            entity : entity,
            path: "Motion Sensors",
            treeIcon : "images/motion-on.png"
        })
        
        // add marker to map
        cesiumView.addViewItem({
            name: entityName,
            entityId : entity.id,
            styler : new OSH.UI.Styler.PointMarker({
                location : {
                    x : lon,
                    y : lat,
                    z : 0
                },
                icon : 'images/motion-off.png',
                iconFunc : {
                   dataSourceIds: [sensorData.getId()],
                   handler : function(rec,timeStamp) {
                       if (rec.motion == 'active') {
                           return 'images/motion-on.png'
                       } else {
                           return 'images/motion-off.png';
                       }
                   }
                },
                label: entityName
            }),
            contextMenuId: mapMenuId+entityID
        });
        
        return entity;
    }


    function addDoorSensor(entityID, entityName, offeringID, lon, lat) {
        
        // create data sources
        var sensorData = new OSH.DataReceiver.JSON("Door", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: stHostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/ContactSensor",
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
            dataSources: [sensorData]
        };
        dataSourceController.addEntity(entity);
        
        // add item to tree
        treeItems.push({
            entity : entity,
            path: "Door Sensors",
            treeIcon : "images/door-closed.png"
        })
        
        // add marker to map
        cesiumView.addViewItem({
            name: entityName,
            entityId : entity.id,
            styler : new OSH.UI.Styler.PointMarker({
                location : {
                    x : lon,
                    y : lat,
                    z : 0
                },
                orientation : {
                    heading : 90
                },
                icon : 'images/door-closed.png',
                iconFunc : {
                   dataSourceIds: [sensorData.getId()],
                   handler : function(rec,timeStamp) {
                       if (rec.contact == 'open') {
                           return 'images/door-open.png'
                       } else {
                           return 'images/door-closed.png';
                       }
                   }
                },
                label: entityName
            }),
            contextMenuId: mapMenuId+entityID
        });
        
        return entity;
    }


    function addUwbTag(entityID, entityName, offeringID) {
        
        // create data sources
        var locationData = new OSH.DataReceiver.JSON("UWB", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/LocationXYZ",
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
            dataSources: [locationData]
        };
        dataSourceController.addEntity(entity);
        
        // add item to tree
        treeItems.push({
            entity : entity,
            path: "Indoor Positioning",
            treeIcon : "images/tree/blue_key.png"
        })
        
        // add marker to map
        cesiumView.addViewItem({
            name: entityName,
            entityId : entity.id,
            styler : new OSH.UI.Styler.PointMarker({
                locationFunc : {
                   dataSourceIds: [locationData.getId()],
                   handler : function(rec,timeStamp) {
                       return {
                           x : rec.x,
                           y : rec.y,
                           z : 0
                       }
                   }
                },
                icon : 'images/tree/blue_key.png',
                label: entityName
            })
        });
        
        return entity;
    }



    function initWFST() {
        var WFS_PROJECTION = "EPSG:3857";

        var wfsService = new CesiumWFST({
            featureNS: 'https://gsx.geolytix.net/geoserver/geolytix_wfs',
            featureType: 'wfs_color',
            srsName: WFS_PROJECTION,
            url:"https://gsx.geolytix.net/geoserver/geolytix_wfs/ows"
        });

        wfsService.onError = function(response) {
            console.log("Error: cannot read WFS stream: "+response);
        };

        // start the draw helper to enable shape creation and editing
        var drawHelper = new DrawHelper(cesiumView.viewer);

        var toolbar = drawHelper.addToolbar(document.getElementById("toolbar"), {
            buttons: ['marker', 'polyline', 'polygon']
        });

        // add draw helper listener
        toolbar.addListener('markerCreated', drawHelperMarkerCreatedListener);
        toolbar.addListener('polylineCreated', drawHelperPolylineCreatedListener);
        toolbar.addListener('polygonCreated', drawHelperPolygonCreatedListener);

        var i = 0;
        // read features from WFS
        var onSuccessRead = function(geometryArray) {
            for(let i=0;i < geometryArray.length;i++) {
                var primitive = geometryArray[i];

                if(primitive.isPolygon || primitive.isPolyline) {
                    cesiumView.viewer._cesiumWidget.scene.primitives.add(primitive);
                }

                else if(primitive.isPoint) {
                    var b = new Cesium.BillboardCollection();
                    cesiumView.viewer._cesiumWidget.scene.primitives.add(b);
                    var billboard = b.add(primitive);
                }
            }
        };

        var onSuccessWrite = function(message) {
            refresh();
        };

        var bounds = "-20026376.39%2C-20048966.10%2C20026376.39%2C20048966.10";
        var request = "service=WFS&version=1.1.0&request=GetFeature&typename=wfs_color&srsname=EPSG%3A3857&bbox="+bounds+"%2CEPSG%3A3857";

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
                isPoint:true
            };

            wfsService.writeTransactionAsCesiumPrimitives(point,null,null,"Point",onSuccessWrite);
        }

        function drawHelperPolylineCreatedListener(event) {
            var polyline = new DrawHelper.PolylinePrimitive({
                positions: event.positions,
                width: 5,
                geodesic: true
            });
            wfsService.writeTransactionAsCesiumPrimitives(polyline,null,null,"polyline",onSuccessWrite);
        }

        function drawHelperPolygonCreatedListener(event) {
            var cesiumPolygon = new DrawHelper.PolygonPrimitive({
                positions: event.positions
                //material : Cesium.Material.fromType('Checkerboard')
            });

            wfsService.writeTransactionAsCesiumPrimitives(cesiumPolygon,null,null,"polygon",onSuccessWrite);
        }

        function refresh() {
            cesiumView.viewer._cesiumWidget.scene.primitives.removeAll();
            wfsService.readAsCesiumPrimitives(request,onSuccessRead);
        }
    }

} // end init()
