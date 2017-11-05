/**
 *
 * @class
 * @classdesc
 * @type {OSH.UI.View}
 * @augments OSH.UI.View
 *
 */
 var htmlTaskingComponent="";
 htmlTaskingComponent += "<div class=\"ptz-zoom\">";
 htmlTaskingComponent += "   <div class=\"ptz-zoom-in\"><i class=\"fa fa-plus-circle\" aria-hidden=\"true\"></i></div>";
 htmlTaskingComponent += "   <div class=\"ptz-zoom-bar\"></div>";
 htmlTaskingComponent += "   <div class=\"ptz-zoom-out\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></div>";
 htmlTaskingComponent += "<\/div>";
 htmlTaskingComponent += "<div class=\"ptz\">";
 htmlTaskingComponent += "   <div tag=\"0\" class='moveUp' name=\"\"><\/div>";
 htmlTaskingComponent += "   <div tag=\"91\" class='moveTopLeft' name=\"\"><\/div>";
 htmlTaskingComponent += "   <div tag=\"90\" class=\"moveTopRight\" name=\"\"><\/div>";
 htmlTaskingComponent += "   <div tag=\"6\" class=\"moveLeft\" name=\"\"><\/div>";
 htmlTaskingComponent += "   <div cmd=\"ptzReset\" class=\"reset\" title=\"Center\" name=\"\"><\/div>";
 htmlTaskingComponent += "   <div tag=\"4\" class=\"moveRight\" name=\"\"><\/div>";
 htmlTaskingComponent += "   <div tag=\"93\" class=\"moveBottomLeft\" name=\"\"><\/div>";
 htmlTaskingComponent += "   <div tag=\"92\" class=\"moveBottomRight\" name=\"\"><\/div>";
 htmlTaskingComponent += "   <div tag=\"2\" class=\"moveDown\" name=\"\"><\/div>";
 htmlTaskingComponent += "<\/div>";
 htmlTaskingComponent += "<div class=\"ptz-right\">";
 htmlTaskingComponent += "                <p>Presets:<\/p>";
 htmlTaskingComponent += "                <div class=\"ptz-select-style\">";
 htmlTaskingComponent += "                     <select class=\"ptz-presets\" required pattern=\"^(?!Select a Preset).*\">";
 htmlTaskingComponent += "                         <option value=\"\" disabled selected>Select a Preset<\/option>";
 htmlTaskingComponent += "                     <\/select>";
 htmlTaskingComponent += "                <\/div>";
 htmlTaskingComponent += "                <\/br>";
 htmlTaskingComponent += "                <p>Tasking Sources:<\/p>";
 htmlTaskingComponent += "                <div class=\"ptz-task-sources\">";
 htmlTaskingComponent += "                     <select class=\"ptz-sources\" required pattern=\"^(?!Select a Source).*\">";
 htmlTaskingComponent += "                         <option value=\"\" disabled selected>Select a Source<\/option>";
 htmlTaskingComponent += "                     <\/select>";
 htmlTaskingComponent += "                     <div class = \"checkboxWrap\">";
 htmlTaskingComponent += "                          <input class=\"keepZoomCheckbox\" type=\"checkbox\" name=\"keepZoom\" value=\"KeepZoom\"\/><a>Keep Zoom<\/a>";
 htmlTaskingComponent += "                     <\/div>";
 htmlTaskingComponent += "                <\/div>";
 htmlTaskingComponent += "<\/div>";

OSH.UI.PtzSrcTaskingView = OSH.UI.View.extend({
    initialize: function (divId, options) {
        this._super(divId,[],options);
        var width = "640";
        var height = "480";
        this.css = "tasking";

        this.cssSelected = "";

        if(typeof (options) !== "undefined") {
            if (options.width) {
                width = options.width;
            }

            if (options.height) {
                height = options.height;
            }

            if (options.css) {
                this.css += options.css;
            }

            if (options.cssSelected) {
                this.cssSelected = options.cssSelected;
            }

            if(options.dataSenderId) {
                this.dataSenderId = options.dataSenderId;
            }
        }

        // creates video tag element
        this.rootTag = document.createElement("div");
        this.rootTag.setAttribute("height", height);
        this.rootTag.setAttribute("width", width);
        this.rootTag.setAttribute("class", this.css);
        this.rootTag.setAttribute("id", "dataview-" + OSH.Utils.randomUUID());

        // appends <img> tag to <div>
        document.getElementById(this.divId).appendChild(this.rootTag);

        this.rootTag.innerHTML = htmlTaskingComponent;

        this.pan = 0;
        this.tilt = 0;
        this.zoom = 0;

        this.camLat = 34.728587;
        this.camLon = -86.586514;

        this.selectedSource = false;

        this.taskSrcIds = [];
        this.taskSrcData = [];
        this.srcIndex = -1;
        this.intervalIdArr = [];

        var ptIncrement = 5;
        if(typeof (options) !== "undefined" && (options.ptIncrement)) {
          ptIncrement = options.ptIncrement;
        }

        var zIncrement = 0.1;
        if(typeof (options) !== "undefined" && (options.zIncrement)) {
          zIncrement = options.zIncrement;
        }

        var panRotFactor = 1.0
        if(typeof (options) !== "undefined" && (options.panRotFactor)) {
          panRotFactor = options.panRotFactor;
        }

        this.observers = [];

        document.querySelector('#'+this.rootTag.id+ " >  .ptz > .moveUp").onclick = function(){this.onTiltClick(ptIncrement)}.bind(this);
        document.querySelector('#'+this.rootTag.id+ " >  .ptz > .moveTopLeft").onclick = function(){this.onTiltPanClick(-1*ptIncrement,panRotFactor*ptIncrement)}.bind(this);
        document.querySelector('#'+this.rootTag.id+ " >  .ptz > .moveTopRight").onclick =  function(){this.onTiltPanClick(ptIncrement,panRotFactor*ptIncrement)}.bind(this);
        document.querySelector('#'+this.rootTag.id+ " >  .ptz > .moveRight").onclick =  function(){this.onPanClick(panRotFactor*ptIncrement)}.bind(this);
        document.querySelector('#'+this.rootTag.id+ " >  .ptz > .moveLeft").onclick =  function(){this.onPanClick(-1*panRotFactor*ptIncrement)}.bind(this);
        document.querySelector('#'+this.rootTag.id+ " >  .ptz > .moveDown").onclick =  function(){this.onTiltClick(-1*ptIncrement)}.bind(this);
        document.querySelector('#'+this.rootTag.id+ " >  .ptz > .moveBottomLeft").onclick = function(){this.onTiltPanClick(-1*ptIncrement,-1*panRotFactor*ptIncrement)}.bind(this);
        document.querySelector('#'+this.rootTag.id+ " >  .ptz > .moveBottomRight").onclick =  function(){this.onTiltPanClick(ptIncrement,-1*panRotFactor*ptIncrement)}.bind(this);
        document.querySelector('#'+this.rootTag.id+ " >  .ptz-zoom > .ptz-zoom-in").onclick =  function(){this.onZoomClick(zIncrement)}.bind(this);
        document.querySelector('#'+this.rootTag.id+ " >  .ptz-zoom > .ptz-zoom-out").onclick =  function(){this.onZoomClick(-1*zIncrement)}.bind(this);
        document.querySelector('.keepZoomCheckbox').onclick =  function(){this.getCheckboxStatus()}.bind(this); // Get status of checkbox on click


        // add presets if any
        if(typeof (options) !== "undefined" && (options.presets)) {
            this.addPresets(options.presets);

            // add listeners
            document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-select-style  .ptz-presets").onchange = this.onSelectedPresets.bind(this);
        }

        // add task sources if any
        if(typeof (options) !== "undefined" && (options.taskers)) {
            this.addSources(options.taskers);

            // add listeners
            document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-task-sources  .ptz-sources").onchange = this.onSelectedSources.bind(this);
        }
    },

    getCheckboxStatus : function () {
      var checkedValue = document.querySelector('.keepZoomCheckbox');
      if (checkedValue.checked === true) {
        console.log("Keep Zoom Enabled");
        enableKeepZoom();
      } else {
        console.log("Keep Zoom Disabled");
        disableKeepZoom();
      }
    },

    /**
     *
     * @param presets array
     * @instance
     * @memberof OSH.UI.PtzSrcTaskingView
     */
    addPresets:function(presetsArr) {
        var selectTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-select-style  .ptz-presets");
        for(var i in presetsArr) {
            var option = document.createElement("option");
            option.text = presetsArr[i];
            option.value = presetsArr[i];
            selectTag.add(option);
        }
    },

    /**
     *
     * @param sources array
     * @instance
     * @memberof OSH.UI.PtzSrcTaskingView
     */
    addSources:function(taskersArr) {
        var selectTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-task-sources  .ptz-sources");

        // Add option to task with left mouse double-click on map
        var clickOption = document.createElement("option");
        clickOption.text = "Double-Click";
        clickOption.value = "mouseclick";
        selectTag.add(clickOption);

        for(var i in taskersArr) {
            var option = document.createElement("option");
            option.text = taskersArr[i].name;
            option.value = taskersArr[i].properties.offeringID;
            selectTag.add(option);

            // this.taskSrcIds.push(taskersArr[i].properties.offeringID); // Add each source ID to this array
            // this.registerSource(taskersArr[i].properties.offeringID); // Register a listener for each task source
        }
    },

    /**
     *
     * @param event
     * @memberof OSH.UI.PtzSrcTaskingView
     * @instance
     */
    onSelectedPresets : function(event) {
        var serverTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-select-style  .ptz-presets");
        var option = serverTag.options[serverTag.selectedIndex];
        this.selectedSource = false;

        // If preset is selected from drop-down, set task source option to "Select a Source" (index 0)
        var sourceServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-task-sources  .ptz-sources");
        sourceServerTag.selectedIndex = 0;
        closeGetResultWsConnection(); // close GetResult ws connection to task source

        this.onChange(null,null,null,null,null,null,option.value,null);
    },

    /**
     *
     * @param event
     * @memberof OSH.UI.PtzSrcTaskingView
     * @instance
     */
    onSelectedSources : function(event) {
        var serverTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-task-sources  .ptz-sources");
        var option = serverTag.options[serverTag.selectedIndex];
        var sourceId = option.value; // this is the SOS offering ID (e.g. urn:osh:sim:gps01-sos)

        this.selectedSource = true;

        // If task source is selected from drop-down, set preset option to "Select a Preset" (index 0)
        var presetServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-select-style  .ptz-presets");
        presetServerTag.selectedIndex = 0;

        console.log("sourceId: " + sourceId);
        // if the GetResult websocket is open, close it!
        if (getGetResultWsConnectionStatus() == WebSocket.OPEN) {
          closeGetResultWsConnection(); // closes websocket
        }
        if (sourceId === "mouseclick") {
          enableClickToTask(); // Only enable click-to-task if mouseclick is selected
        } else {
          disableClickToTask(); // If Map Double-Click is not selected, disable click-to-task
          makeGetResultWsConnection(sourceId); // create connection to selected data source; pass in SOS offering ID
        }
    },

    // sendTaskSourceCommand: function(taskOfferingID) {
    //   var numRemove = 0; // counter to keep track of how many elements need to be removed from intervalIdArr
    //   for (var itr = 0; itr < this.intervalIdArr.length - 1; itr++) {
    //     numRemove++;
    //     clearInterval(this.intervalIdArr[itr]); // clear all intervals except last one
    //   }
    //   this.intervalIdArr.splice(0,numRemove); // remove "old" intervalID from array, so only one intervalID is active
    //
    //   if (this.selectedSource) {
    //     this.onChange(bearing,null,null,null,null,null,null,null); // For now, send bearing to ptz sender as pan angle
    //   }
    // },

    /**
     *
     * @param interval
     * @instance
     * @memberof OSH.UI.PtzSrcTaskingView
     */
    removeInterval: function(interval) {
        if(this.timerIds.length > 0) {
            setTimeout(clearInterval(this.timerIds.pop()),interval+50);
        }
    },

    /**
     *
     * @param value
     * @instance
     * @memberof OSH.UI.PtzSrcTaskingView
     */
    onTiltClick: function (value) {
      this.tilt += value;
      this.selectedSource = false;
      closeGetResultWsConnection(); // close GetResult ws connection to task source

      // If tilt is clicked, set task source option to "Select a Source" (index 0)
      var sourceServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-task-sources  .ptz-sources");
      sourceServerTag.selectedIndex = 0;

      // If tilt is clicked, set preset option to "Select a Preset" (index 0)
      var presetServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-select-style  .ptz-presets");
      presetServerTag.selectedIndex = 0;

      this.onChange(null,null,null,null,value,null,null,null);
    },

    /**
     *
     * @param tiltValue the titl value
     * @param panValue the panValue value
     * @instance
     * @memberof OSH.UI.PtzSrcTaskingView
     */
    onTiltPanClick:function(tiltValue,panValue) {
      this.tilt += tiltValue;
      this.pan += panValue;
      this.selectedSource = false;
      closeGetResultWsConnection(); // close GetResult ws connection to task source

      // If tilt/pan is clicked, set task source option to "Select a Source" (index 0)
      var sourceServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-task-sources  .ptz-sources");
      sourceServerTag.selectedIndex = 0;

      // If tilt/pan is clicked, set preset option to "Select a Preset" (index 0)
      var presetServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-select-style  .ptz-presets");
      presetServerTag.selectedIndex = 0;

      this.onChange(null,null,null,tiltValue,panValue,null,null,null);
    },

    /**
     *
     * @param value
     * @instance
     * @memberof OSH.UI.PtzSrcTaskingView
     */
    onPanClick: function(value) {
      this.pan += value;
      this.selectedSource = false;
      closeGetResultWsConnection(); // close GetResult ws connection to task source

      // If pan is clicked, set task source option to "Select a Source" (index 0)
      var sourceServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-task-sources  .ptz-sources");
      sourceServerTag.selectedIndex = 0;

      // If pan is clicked, set preset option to "Select a Preset" (index 0)
      var presetServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-select-style  .ptz-presets");
      presetServerTag.selectedIndex = 0;

      this.onChange(null,null,null,value,null,null,null,null);
    },

    /**
     *
     * @param value
     * @instance
     * @memberof OSH.UI.PtzSrcTaskingView
     */
    onZoomClick: function(value) {
      this.zoom += value;
      this.selectedSource = false;
      closeGetResultWsConnection(); // close GetResult ws connection to task source

      // If zoom is clicked, set task source option to "Select a Source" (index 0)
      var sourceServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-task-sources  .ptz-sources");
      sourceServerTag.selectedIndex = 0;

      // If zoom is clicked, set preset option to "Select a Preset" (index 0)
      var presetServerTag = document.querySelector('#'+this.rootTag.id+ "  .ptz-right  .ptz-select-style  .ptz-presets");
      presetServerTag.selectedIndex = 0;

      this.onChange(null,null,null,null,null,value,null,null);
    },

    /**
     *
     * @param rpan
     * @param rtilt
     * @param rzoom
     * @instance
     * @memberof OSH.UI.PtzSrcTaskingView
     */
     onChange: function(pan, tilt, zoom, rpan, rtilt, rzoom, preset, loc) {
         OSH.EventManager.fire(OSH.EventManager.EVENT.PTZ_SEND_REQUEST+"-"+this.dataSenderId,{
             cmdData : {pan, tilt, zoom, rpan,rtilt,rzoom,preset,loc},
             onSuccess:function(event){console.log("Failed to send request: "+event);},
             onError:function(event){console.log("Request sent successfully: "+event);}
         });
     }
});
