#!/bin/bash
java -Xmx384m -cp "lib/*" -Djava.system.class.loader="org.sensorhub.utils.NativeClassLoader" -Dlogback.configurationFile=./logback.xml org.sensorhub.impl.SensorHub config.json db
