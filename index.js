var request = require("request");
var NodeCache = require("node-cache");
var inherits = require('util').inherits;
var netatmo = require("netatmo");

var DEFAULT_CACHE_TTL = 10; 

var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  


  // Service.Thermostat = function(displayName, subtype) {
  //   Service.call(this, displayName, "0000004A-0000-1000-8000-0026BB765291", subtype);
  //   this.addCharacteristic(Characteristic.CurrentTemperature);
  //   this.addCharacteristic(Characteristic.TargetTemperature);
  // };
  // inherits(Service.Thermostat, Service);

  Service.TargetTemperature = function(displayName, subtype) {
    Service.call(this, displayName, "00000035-0000-1000-8000-0026BB765291", subtype);
    this.addCharacteristic(Characteristic.TargetTemperature)
  };
  inherits(Service.TargetTemperature, Service);

  Service.CurrentTemperature = function(displayName, subtype) {
    Service.call(this, displayName, "00000011-0000-1000-8000-0026BB765291", subtype);
    this.addCharacteristic(Characteristic.CurrentTemperature)
  };
  inherits(Service.CurrentTemperature, Service);

  homebridge.registerAccessory("homebridge-Heating", "Heating", HeatingAccessory);
}

function HeatingAccessory(log, config) {
  this.log       = log;
  this.name      = config["name"];
  this.module_id = config["module_id"];
  this.log("Getting current state...", this.name);
  
  var ttl        = typeof config["ttl"] !== 'undefined' ?  config["ttl"] : DEFAULT_CACHE_TTL;
  this.cache     = new NodeCache( { stdTTL: ttl } );
  this.api       = new netatmo(config["auth"]);

  // this.service   = new Service.Thermostat(this.name);
  
  
  // this.addCharacteristic(Characteristic.CurrentHeatingCoolingState);
  // this.addCharacteristic(Characteristic.TargetHeatingCoolingState);
  // this.addCharacteristic(Characteristic.CurrentTemperature);
  // this.addCharacteristic(Characteristic.TargetTemperature);
  // this.addCharacteristic(Characteristic.TemperatureDisplayUnits);


  // this.service
  // .addCharacteristic(Characteristic.TargetTemperature)
  // .on('get', this.getTargetTemperature.bind(this));
  //
  // this.service
  // .getCharacteristic(Characteristic.CurrentTemperature)
  // .on('get', this.getCurrentTemperature.bind(this));
  
}


HeatingAccessory.prototype.getTargetTemperature = function(callback) {
  this.log("Getting target state...");
  
  
  var options = {
    device_id: '70:ee:50:04:3c:78',
    module_id: '04:00:00:06:18:58',
  };

  this.api.getThermstate(options, function(err, result) {
     console.log(result.measured.setpoint_temp);
     if (!err){
         temp = result.measured.setpoint_temp
         callback(null, temp); // success
     }
     else{
         this.log("Error getting state");
         callback(err);
     }
     
  }.bind(this));
}

HeatingAccessory.prototype.getCurrentTemperature = function(callback) {
  this.log("Getting current state...");
  
  
  var options = {
    device_id: 'CHANGE ME',
    module_id: 'CHANGE ME',
  };

  this.api.getThermstate(options, function(err, result) {
     console.log(result.measured.temperature);
     if (!err){
         temp = result.measured.temperature
         callback(null, temp); // success
     }
     else{
         this.log("Error getting state");
         callback(err);
     }
     
  }.bind(this));
  

}
 
HeatingAccessory.prototype.getServices = function() {
  var services = [];
  

  // New Services
  // var informationService = new Service.AccessoryInformation();
  // var firmwareCharacteristic = informationService.getCharacteristic(Characteristic.FirmwareRevision)
  //                        || informationService.addCharacteristic(Characteristic.FirmwareRevision);
  // services.push( informationService );
  //
  // informationService
  //   .setCharacteristic(Characteristic.Manufacturer, "Netatmo")
  //   .setCharacteristic(Characteristic.Model, "Thermostat")
  //   .setCharacteristic(Characteristic.Name, this.name)
  //   .setCharacteristic(Characteristic.SerialNumber, "XXX")
  //   .setCharacteristic(Characteristic.FirmwareRevision, "YYY");
  
  // var thermostat = new Service.Thermostat(this.name + "Thermostat");
  // services.push(thermostat);
  //New Services
  
  var currentTemperature = new Service.CurrentTemperature(this.name + " Current Temperature");
  services.push( currentTemperature );
  currentTemperature.getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', this.getCurrentTemperature.bind(this));
  
  var targetTemperature = new Service.TargetTemperature(this.name + " Target Temperature");
  services.push( targetTemperature );
  targetTemperature.getCharacteristic(Characteristic.TargetTemperature)
  .on('get', this.getTargetTemperature.bind(this));
  

  return services;
}