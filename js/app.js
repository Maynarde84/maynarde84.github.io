"use strict";
//
var mapZoom;
if (window.innerWidth > 1250) {
    mapZoom = 17;
} else {
    mapZoom = 14;
}
//Centering map on Semaphore Road
var map = new google.maps.Map(document.getElementById('google_map'), {
    zoom: mapZoom,
    center: {
        lat: -34.839602,
        lng: 138.487782
    }
});

//Creating the cafe object
var Cafe = function(data) {
    var self = this;
    self.name = ko.observable(data.name);
	self.address = ko.observable(data.address);
    self.latLng = ko.observable(new google.maps.LatLng(data.lat, data.lng));
	self.tag = ko.observable(data.tag);
	self.rating = ko.observable(data.rating);
	self.website = ko.observable(data.website);
    self.marker = new google.maps.Marker({
        map: null,
        position: self.latLng(),
        title: self.name(),
        animation: google.maps.Animation.DROP
    });

    self.markerDisplay = function(value) {
        if (value === map) {
            if (self.marker.map === null) {
                self.marker.setMap(map);
            }
        } else {
            self.marker.setMap(null);
        }
    };
};

//Call functions to fill the info window / popup box
var popupBox = function(cafe) {
	
	if (cafe.website() !== null) {
		return "<div id='popupBox' class='popupBox'>" +
        "<h2 id='popupBoxTitle' class='popupBoxTitle'>" +
        cafe.name() + "</h2>" +
        "<h1 id='ratingSite' class='ratingSite'>Rating: " +
		cafe.rating() + "</h1>" +
		"<h1 id='ratingSite' class='ratingSite'><a href=" +
		cafe.website() + ">Website</h1>" + 
		"</div>";
	} else {
		return "<div id='popupBox' class='popupBox'>" +
        "<h2 id='popupBoxTitle' class='popupBoxTitle'>" +
        cafe.name() + "</h2>" +
        "<h1 id='ratingSite' class='ratingSite'>Rating: " +
		cafe.rating() + "</h1></div>";
	}
};

var ViewModel = function() {
	
	//Creating the search box and array for cafes
    var self = this;
	self.searchString = ko.observable('');
    self.cafeLocations = ko.observableArray([]);
	
	//Filling cafe location array with cafe objects
	cafes.forEach(function(cafeInfo) {
        self.cafeLocations.push(new Cafe(cafeInfo));
    });
	
    self.filteredCafes = ko.computed(function() {
        var cafeList = [],
            locationLength = self.cafeLocations().length;

		//Setting up markers and sorting array
        for (var i = 0; i < locationLength; i++) {
            if (self.cafeLocations()[i].name().toLowerCase().indexOf(self.searchString().toLowerCase()) != -1) {
                cafeList.push(self.cafeLocations()[i]);
                self.cafeLocations()[i].markerDisplay(map);
            } else {
                self.cafeLocations()[i].markerDisplay();
            }
        }
        
        return cafeList.sort(function(left, right) {
            return left.name() > right.name() ? 1 : -1;
        });
    });
	
	var infowindow = new google.maps.InfoWindow();
	
	//Add this function so the list items are clickable
    self.clickFunction = function(cafe){
		map.setCenter(cafe.latLng());
        map.setZoom(19);
		
		infowindow.close();
                
       	cafe.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
        	cafe.marker.setAnimation(null);
        }, 700);

        //Initialize info window
        infowindow = new google.maps.InfoWindow({
        	maxHeight: 150,
            maxWidth: 200
        });

        //Fill info window with info then open
        infowindow.setContent(popupBox(cafe));
        infowindow.open(map, cafe.marker);
    };

    //Iterate through each coffee shop to add information
    self.cafeLocations().forEach(function(cafe) {
    	google.maps.event.addListener(cafe.marker, 'click', function() {
        	self.clickFunction(cafe);
        });
    });
};

ko.applyBindings(new ViewModel());