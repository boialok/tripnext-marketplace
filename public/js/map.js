const mapElement = document.getElementById("map");

if (mapElement) {
    if (!mapToken || mapToken === "") {
        mapElement.innerHTML = "<h5 class='text-center mt-5 text-muted'>Map token missing. Please check your .env file.</h5>";
    } else {
        mapboxgl.accessToken = mapToken;

        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(listingLocation)}.json?access_token=${mapToken}`)
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    mapElement.innerHTML = `<h5 class='text-center mt-5 text-danger'>Mapbox Error: ${data.message}</h5>`;
                } else if (data.features && data.features.length > 0) {
                    const coordinates = data.features[0].center; 

                    const map = new mapboxgl.Map({
                        container: 'map', 
                        style: 'mapbox://styles/mapbox/streets-v12', 
                        center: coordinates, 
                        zoom: 10 
                    });

                    new mapboxgl.Marker({ color: "#fe424d" })
                        .setLngLat(coordinates)
                        .setPopup(
                            new mapboxgl.Popup({ offset: 25 })
                            .setHTML(`<h6>${listingLocation}</h6><p style="margin: 0; font-size: 0.85rem;">Exact location provided after booking.</p>`)
                        )
                        .addTo(map);
                } else {
                    mapElement.innerHTML = "<h5 class='text-center mt-5 text-muted'>Exact location could not be mapped.</h5>";
                }
            })
            .catch(err => {
                console.error(err);
                mapElement.innerHTML = "<h5 class='text-center mt-5 text-muted'>Failed to load map data.</h5>";
            });
    }
}