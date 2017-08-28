# Cloud Node


This OSH node is set-up with an SOS-T that collects the following data:

- Location, look direction and video feeds of instrumented first responders (outdoor)
- Location, orientation and video feed from UAV (through the outdoor server)
- Raw data from Laser Range Finder (range, azimuth and elevation)
- Door and motion sensor data pushed from SmartThings


It is also set-up with drivers to connect with the following sensors:

- Location, orientation and video feed from City Hall camera (RTSP over VPN)
- Processing for tasking of City Hall camera (conversion between Lat/Lon/Alt command to PTZ)
- PRocessing for computing LRF target location (using raw LRF range+azimuth+elevation data)
