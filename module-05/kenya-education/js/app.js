(function () {
    L.mapbox.accessToken = 'pk.eyJ1Ijoicmdkb25vaHVlIiwiYSI6Im5Ua3F4UzgifQ.PClcVzU5OUj17kuxqsY_Dg';

    var map = L.mapbox.map('map', 'mapbox.light', {
        center: [-.23, 37.8],
        zoom: 7,
        minZoom: 6,
        maxZoom: 9,
        maxBounds: L.latLngBounds([-6.22, 27.72],[5.76, 47.83])
    });

    var currentGrade = 1;

    //        var boys;
    //        
    //        var girls;

    omnivore.csv('kenya_education_2014.csv')
        .on('ready', function(e) {
            drawMap(e.target.toGeoJSON());
        })
        .on('error', function(e) {
            console.log(e.error[0].message);
    });

    function drawMap(schoolData) {
        var girls = L.geoJson(schoolData, {

            pointToLayer: function(feature, latlng){
                return L.circleMarker(latlng, {
                    color: '#D96D02',
                    fillColor: '#1C9976',
                    opacity: 1,
                    weight: 2,
                    fillOpacity: 0
                });
            }
        }).addTo(map);

        var boys = L.geoJson(schoolData, {

            pointToLayer: function(feature, latlng){

                return L.circleMarker(latlng, {
                    color: '#6E77B0',
                    fillColor: '#1C9976',
                    opacity: 1,
                    weight: 2,
                    fillOpacity: 0
                });
            }
        }).addTo(map);

        updateSymbols(girls, boys, 1);

        sequenceUI(girls, boys);

    }

    function calcRadius(val) {
        var radius = Math.sqrt(val/Math.PI);
        return radius * .6;
    }

    function updateSymbols(girls, boys, currentGrade) {

        var allRadii = [];

        var radius;

        girls.eachLayer(function(layer) {
            radius = calcRadius(layer.feature.properties["G"+currentGrade]);
            layer.setRadius(radius);
            allRadii.push(radius);
        });

        boys.eachLayer(function(layer) {
            radius = calcRadius(layer.feature.properties["B"+currentGrade]);
            layer.setRadius(radius);
            allRadii.push(radius);
        });

        drawLegend(allRadii);

        infoWindow(girls, boys, currentGrade);

    }

    function sequenceUI(girls, boys) {

        $('.slider')
            .on('input change', function() {
                var currentGrade = $(this).val();    
                updateSymbols(girls, boys, currentGrade);
                $('#grade span').html(currentGrade);
            });
    }

    function drawLegend(allRadii) {

        // select legend
        var legend = $('.legend');

        // create data object for max, median, and min values
        var circles = {
            max: ss.max(allRadii),
            median: ss.median(allRadii),
            min: ss.min(allRadii)
        }

        var svgCircle = '';

        // reverse calculate the values from the radii

        var reverseCalc = function(radius) {

            return Math.round(Math.pow(radius/.6, 2) * Math.PI);
        }

        // loop through the three legend values

        // build up svg

        for (var circle in circles) {
            var radiusValue = circles[circle];
    //                console.log(val);
            var actualValue = reverseCalc(radiusValue);
    //                console.log(actualValue);
            svgCircle += '<circle cx="80" cy="' + (radiusValue -135) * -1 + '" r="' + radiusValue + '" stroke="#3d3d3d" stroke-width="1" fill="ghostwhite" />';

            svgCircle += '<text x="'+ 60 +'" y = "'+ (radiusValue - 120) * -1 +'" fill="#222222">'+ actualValue +'</text>';
        }


        legend.html(svgCircle);

    }

    function infoWindow(girls, boys, currentGrade) {

        var info = $('#info');

        boys.on('mouseover', function(e) {

            info.show();

            var props = e.layer.feature.properties;
    //                console.log(props);
            $('#info p:first-child span').text(props.COUNTY);
            $('.girls span:first-child').text('(Grade ' + currentGrade +')');
            $(".boys span:first-child").text('(Grade ' + currentGrade +')');

            $(".girls span:last-child").text(props['G'+String(currentGrade)].toLocaleString());
            $(".boys span:last-child").text(props['B'+String(currentGrade)].toLocaleString());

            e.layer.setStyle({ fillOpacity: .6 });

        })

        boys.on('mouseout', function(e) {

            info.hide();

            e.layer.setStyle({ fillOpacity: 0 });

        });

        $(document).mousemove(function(e) {

            info.css({ "left": e.pageX + 6, "top": e.pageY - info.height() -15});

            if(info.offset().top < 4) {
                info.css({"top": e.pageY + 15})
            }

            if(info.offset().left + info.width() >= $(window).width() - 40) {
                info.css({ "left": e.pageX -info.width() - 30 })
            }

        });

    }
})();
