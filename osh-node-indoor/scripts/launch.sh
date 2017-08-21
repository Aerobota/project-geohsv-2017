#!/bin/bash
now=`date +%Y%m%d_%H%M%S`
logFile="log_$now.txt"
java -Xmx384m -cp "lib/*" -Djava.system.class.loader="org.sensorhub.utils.NativeClassLoader" -Dlogback.configurationFile=./logback.xml -Djava.security.policy=./java.policy.ext.rpi -Dgnu.io.rxtx.SerialPorts=/dev/ttyAMA0:/dev/ttyACM0:/dev/ttyUSB0 org.sensorhub.impl.SensorHub config.json db | tee $logFile
