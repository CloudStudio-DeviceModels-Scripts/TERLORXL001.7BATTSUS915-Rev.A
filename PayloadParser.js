function parseUplink(device, payload)
{
    // Basic checks
    var bytes = payload.asBytes();
    if (bytes.length != 5)
    {
        env.log("Incorrect payload length, must be 5 bytes");
        return;
    }
    if (payload.port > 0 && payload.port != 103)
    {
        env.log("Incorrect LoRaWAN port, must be 103");
        return;
    }

    // Calculate the different fields from the payload
    var batteryVoltage = ((bytes[1] & 0b00001111) + 25.00) / 10.00;
    var humidity = (bytes[3] & 0b01111111);
    var co2 = bytes[4] + (bytes[5] << 8);
    var voc = bytes[6] + (bytes[7] << 8);
    var aqi = bytes[8] + (bytes[9] << 8);
    var temp = (bytes[10] & 0x7f) - 32;

    // Store humidity
    var e = device.endpoints.byType(endpointType.humiditySensor);
    if (e != null)
        e.updateHumiditySensorStatus(humidity);

    // Store CO2
    e = device.endpoints.byType(endpointType.ppmConcentrationSensor, ppmConcentrationSensorSubType.carbonDioxide);
    if (e != null)
        e.updatePpmConcentrationSensorStatus(co2);

    // Store VOC
    e = device.endpoints.byType(endpointType.ppmConcentrationSensor, ppmConcentrationSensorSubType.voc);
    if (e != null)
        e.updatePpmConcentrationSensorStatus(voc);

    // Store AQI
    e = device.endpoints.byType(endpointType.airQualityIndexSensor);
    if (e != null)
        e.updateAqiSensorStatus(aqi);

    // Store temperature
    e = device.endpoints.byType(endpointType.temperatureSensor);
    if (e != null)
        e.updateTemperatureSensorStatus(temp);

    // Store battery voltage
    device.updateDeviceBattery( { voltage: batteryVoltage } );
}

function buildDownlink(device, endpoint, command, payload) 
{ 
    // This function allows you to convert a command from the platform 
    // into a payload to be sent to the device.
    // Learn more at https://wiki.cloud.studio/page/200

    // The parameters in this function are:
    // - device: object representing the device to which the command will
    //   be sent. 
    // - endpoint: endpoint to which the command will be sent. May be null
    //   if the command is to be sent to the device, and not to an individual
    //   endpoint within the device.
    // - command: object containing the command that needs to be sent. More
    //   information at https://wiki.cloud.studio/page/1195.

    // This example is written assuming a device that contains a single endpoint, 
    // of type appliance, that can be turned on, off, and toggled. 
    // It is assumed that a single byte must be sent in the payload, 
    // which indicates the type of operation.

     payload.port = 25;          // This device receives commands on LoRaWAN port 25 
     //payload.buildResult = downlinkBuildResult.ok;
     payload.buildResult = downlinkBuildResult.ok; 
     payload.setAsBytes([1, 2, 3, 4, 5, 6, 7, 8]);
     payload.errorbytes = "This is an error bytes!";
     payload.requiresResponse = false;     
}