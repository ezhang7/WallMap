$(function () {
    'use strict';

    var drivers = {};
    var passengers = {};

    var drivers2 = {};
    var passengers2 = {};

    var hangoutLocation = [];
    var driverPaths = {};
    var driverBurdens = {};

    var driverToPassenger = [];
    var passengerToDestination = [];
    var driverToDestination = [];
    var driverPassengerDestination = [];

    var data = {
    	"andrew": "32 Chester Circle Los Altos, CA 94022", 
    	"chongs": "5988 Starwood Dr. San Jose, CA 95120",
    	"sean": "1724 Glen Una Ave. San Jose, CA 95125", 
    	"andre": "12101 Stonebrook Dr. Los Altos Hills, CA 94022",
    	"eric": "1307 Chessington Dr. San Jose, CA 95131", 
    	"panda": "Garden Gate Dr. Cupertino, CA 95014",
    	"mike": "Fruitvale Ave. Saratoga, CA 95070"
    }

    //Autofills the location field when the name field has been filled with a preset name
    $("input.pl").on("click", function(elem) {
    	var $target = $(elem.target);
    	var name = $target.prev()[0].value;
    	name = name.toLowerCase();
    	if(name in data) {
    		elem.target.value = data[name];
    	}
    });

    //Autofills the hangout location field on click (For testing purposes)
    $("input.hl").on("click", function(elem) {
    	var $target = $(elem.target);
    	elem.target.value = "Santana Row, San Jose, CA";
    })

    var getValues = function(input_array) {
    	return input_array.map(function() {
    		return this.value;
    	}).get();
    }

    var getData = function() {
    	var driverNames = getValues($("#drivers input.pn"));
    	var driverLocations = getValues($("#drivers input.pl"));
    	var passengerNames = getValues($("#passengers input.pn"));
    	var passengerLocations = getValues($("#passengers input.pl"));
    	driverLocations.forEach(function(elem, index) {
    		if(elem !== "" && driverNames[index] !== "") {
	    		drivers[elem] = driverNames[index];
	    		drivers2[driverNames[index]] = elem;
    		}
    	});
    	passengerLocations.forEach(function(elem, index) {
    		if(elem !== "" && passengerNames[index] !== "") {
	    		passengers[elem] = passengerNames[index];
	    		passengers2[passengerNames[index]] = elem;
    		}
    	});
    	hangoutLocation.push($("input.hl")[0].value);
    }

    //DRIVER TO PASSENGER DISTANCES

    var getDriverDistances = function() {
    	var d = $.Deferred();
    	var service = new google.maps.DistanceMatrixService();
    	service.getDistanceMatrix(
    	{
    		origins: Object.keys(drivers),
    		destinations: Object.keys(passengers),
    		travelMode: google.maps.TravelMode.DRIVING,
    		unitSystem: google.maps.UnitSystem.METRIC,
    		avoidHighways: false,
    		avoidTolls: false
    	}, function(response, status) {
    		if (status != google.maps.DistanceMatrixStatus.OK) {
    			d.reject(status);
    		} else {
    			d.resolve(response);
    		}
    	});
    	return d.promise();
    } 

    var processResponseDrivers = function(response) {
		var origins = response.originAddresses;
		var destinations = response.destinationAddresses;
		var outputDiv = $('#outputDiv1')[0];
		outputDiv.innerHTML = '';
		for (var i = 0; i < origins.length; i++) {
			var results = response.rows[i].elements;
			for (var j = 0; j < results.length; j++) {
				var curr = [];
				curr.push(drivers[Object.keys(drivers)[i]]);
				curr.push(passengers[Object.keys(passengers)[j]]);
				curr.push(results[j].distance.text);
				curr.push(results[j].duration.text);
				driverToPassenger.push(curr);
				// outputDiv.innerHTML += drivers[Object.keys(drivers)[i]] + ' to ' + passengers[Object.keys(passengers)[j]]
				// + ': ' + results[j].distance.text + ' in '
				// + results[j].duration.text + '<br>';
			}
		}
    }

    //DRIVER DESTINATIONS

    var getDriverDestinationDistances = function() {
    	var d = $.Deferred();
    	var service = new google.maps.DistanceMatrixService();
	    service.getDistanceMatrix(
	    {
	    	origins: Object.keys(drivers),
	    	destinations: hangoutLocation,
	    	travelMode: google.maps.TravelMode.DRIVING,
	    	unitSystem: google.maps.UnitSystem.METRIC,
	    	avoidHighways: false,
	    	avoidTolls: false
	    }, function(response, status) {
	    	if (status != google.maps.DistanceMatrixStatus.OK) {
	    		d.reject(status);
	    	} else {
	    		d.resolve(response);
	    	}
	    });
	    return d.promise();
    }

    var processResponseDriverDestination = function(response, status) {
    	var origins = response.originAddresses;
		var destinations = hangoutLocation;
		var outputDiv = $('#outputDiv2')[0];
		outputDiv.innerHTML = '';
		for (var i = 0; i < origins.length; i++) {
			var results = response.rows[i].elements;
			for (var j = 0; j < results.length; j++) {
				var curr = [];
				curr.push(drivers[Object.keys(drivers)[i]]);
				curr.push(destinations[j]);
				curr.push(results[j].distance.text);
				curr.push(results[j].duration.text);
				driverToDestination.push(curr);
				// outputDiv.innerHTML += drivers[Object.keys(drivers)[i]] + ' to ' + destinations[j] 
				// + ': ' + results[j].distance.text + ' in '
				// + results[j].duration.text + '<br>';
			}
		}
    }

    //PASSENGER DESTINATIONS

    var getPassengerDestinationDistances = function() {
    	var d = $.Deferred();
    	var service = new google.maps.DistanceMatrixService();
    	service.getDistanceMatrix(
    	{
    		origins: Object.keys(passengers),
    		destinations: hangoutLocation,
    		travelMode: google.maps.TravelMode.DRIVING,
    		unitSystem: google.maps.UnitSystem.METRIC,
    		avoidHighways: false,
    		avoidTolls: false
    	}, function(response, status) {
    		if (status != google.maps.DistanceMatrixStatus.OK) {
    			d.reject(status);
    		} else {
    			d.resolve(response);
    		}
    	});
    	return d.promise();
    }

    var processResponsePassengerDestination = function(response, status) {
    	var origins = response.originAddresses;
		var destinations = response.destinationAddresses;
		var outputDiv = $('#outputDiv3')[0];
		outputDiv.innerHTML = '';
		for (var i = 0; i < origins.length; i++) {
			var results = response.rows[i].elements;
			for (var j = 0; j < results.length; j++) {
				var curr = [];
				curr.push(passengers[Object.keys(passengers)[i]]);
				curr.push(destinations[j]);
				curr.push(results[j].distance.text);
				curr.push(results[j].duration.text);
				passengerToDestination.push(curr);
				// outputDiv.innerHTML += passengers[Object.keys(passengers)[i]] + ' to ' + destinations[j] 
				// + ': ' + results[j].distance.text + ' in '
				// + results[j].duration.text + '<br>';
			}
		}
    }

    var createDriverPassengerDestination = function() {
    	driverToPassenger.forEach(function(elem1, index1) {
    		passengerToDestination.forEach(function(elem2, index2) {
    			var curr = [];
    			if(elem1[1] === elem2[0]) {
    				curr.push(elem1[0]);
    				curr.push(elem1[1]);
    				curr.push(elem2[1]);
    				curr.push(parseFloat(elem1[2]) + parseFloat(elem2[2]));
    				curr.push(parseFloat(elem1[3]) + parseFloat(elem2[3]));
	    			driverPassengerDestination.push(curr);
    			}
    			return; //Continues to next iteration
    		});
    	});
    }
    var initializePathsAndBurdens = function() {
    	for(var key in drivers) {
    		var path = [];
    		var driver = drivers[key];
    		driverPaths[driver] = path;
    		driverBurdens[driver] = 0;
    	}
    }

    var generatePaths = function() {
    	while(passengerToDestination.length > 0) {
	    	var minDriver = "";
	    	var minPassenger = "";
	    	var minAvg = 1000000000; //A big number
	    	var passengerIndex = -1;
	    	for(var i = 0; i < passengerToDestination.length; i++) {
	    		var passenger = passengerToDestination[i][0];
	    		var dist_passenger_dest = parseFloat(passengerToDestination[i][2]);
	    		var time_passenger_dest = parseFloat(passengerToDestination[i][3]);
	    		for(var j = 0; j < driverToDestination.length; j++) {
	    			var driver = driverToDestination[j][0];
	    			var fast_distance = parseFloat(driverToDestination[j][2]);
	    			var fast_time = parseFloat(driverToDestination[j][3]);
	    			var dist_driver_passenger = 0;
	    			var time_driver_passenger = 0;
	    			for(var k = 0; k < driverToPassenger.length; k++) {
	    				if(driverToPassenger[k][0] === driver && driverToPassenger[k][1] === passenger) {
	    					var dist_driver_passenger = parseFloat(driverToPassenger[k][2]);
	    					var time_driver_passenger = parseFloat(driverToPassenger[k][3]);
	    					break;
	    				}
	    			}
	    			var slow_distance = dist_driver_passenger + dist_passenger_dest;
	    			var slow_time = time_driver_passenger + time_passenger_dest;
	    			if(2 * slow_time - fast_time + driverBurdens[driver] < minAvg) {
	    				minAvg = 2 * slow_time - fast_time + driverBurdens[driver];
	    				minPassenger = passenger;
	    				minDriver = driver;
	    				passengerIndex = i;
	    			}
	    		}
	    	}
	    	driverBurdens[minDriver] = driverBurdens[minDriver] + (slow_time - fast_time)/2 + 10;
	    	driverPaths[minDriver].push(minPassenger);
	    	passengerToDestination.splice(passengerIndex, 1);
    	}
    }

    var clearGlobals = function() {
    	drivers = {};
    	passengers = {};
    	drivers2 = {};
    	passengers2 = {};
    	hangoutLocation = [];
    	driverPaths = {};
	    driverBurdens = {};

    	driverToPassenger = [];
    	passengerToDestination = [];
    	driverToDestination = [];
    	driverPassengerDestination = [];
    }

    //SUBMIT CLICKS
    $("#pickup").on("click", function() {
    	clearGlobals();
    	getData();
    	$.when(getDriverDistances(), getDriverDestinationDistances(), getPassengerDestinationDistances()).done(function(response1, response2, response3) {
    		processResponseDrivers(response1);
    		processResponseDriverDestination(response2);
    		processResponsePassengerDestination(response3);
	    	createDriverPassengerDestination();
	    	initializePathsAndBurdens();
	    	generatePaths();

    	});
    });

    $("#dropoff").on("click", function() {
    	console.log("dHI");
    });

    

    

}());
