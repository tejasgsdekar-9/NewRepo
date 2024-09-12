function initMap() {
    var location = {
        lat: 37.7749,
        lng: -122.4194
    };

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: location,
    });

    var marker = new google.maps.Marker({
        position: location,
        map: map,
    });
}