#!/bin/bash
now=`date +%Y%m%d_%H%M%S`
logFile="log_$now.txt"
java -Xmx384m -cp "lib/*" -Djava.system.class.loader="org.sensorhub.utils.NativeClassLoader" -Dlogback.configurationFile=./logback.xml org.sensorhub.impl.SensorHub config.json db | tee $logFile
