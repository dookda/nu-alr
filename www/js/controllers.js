angular.module('starter.controllers', ['ngMap', 'chart.js', 'ngCordova'])

.controller('MapController', function($scope, NgMap, $http, 
    $state, MapService, $timeout, $rootScope) {

    $scope.loadLatlon = function() {
        navigator.geolocation.getCurrentPosition(function(pos) {
            //$scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            $scope.data = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };
            //console.log($scope.data.lat + '-' + $scope.data.lng);
        }, function(error) {
            alert('Unable to get location: ' + error.message);
        });
    };
    $scope.loadLatlon();

    $scope.getCurrentLocation = function(event) {
        $scope.data = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
    };

    $scope.loadJson = function() {
        var vm = this;
        NgMap.getMap().then(function(map) {
            vm.map = map;
            //var bounds = new google.maps.LatLngBounds(southWest,northEast);
            var ne = vm.map.getBounds().getNorthEast();
            var sw = vm.map.getBounds().getSouthWest();
            var alrMap = 'http://map.nu.ac.th/gs-alr2/alr/ows?service=WFS&version=1.0.0';
            alrMap += '&request=getfeature';            
            //alrMap += '&typename=alr:ln9p_tam';
            alrMap += '&typename=alr:alr_parcels';
            alrMap += '&cql_filter=BBOX(geom, ' + ne.lng() + ',' + ne.lat() + ',' + sw.lng() + ',' + sw.lat() + ')';
            //testMap += '&cql_filter=INTERSECTS(the_geom,%20POINT%20(-74.817265%2040.5296504))'
            alrMap += '&outputformat=application/json';
            // var alrMap = 'http://map.nu.ac.th/gs-alr/alr/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=alr:ln9p_alr&maxFeatures=50&outputFormat=application%2Fjson';

            vm.map.data.loadGeoJson(alrMap);

            // Set the stroke width, and fill color for each polygon
            vm.map.data.setStyle(function(feature) {
                    var SD_NAME = feature.getProperty('chkdata');
                    var color = "#ee7e28";
                    if (SD_NAME == 1) {
                        color = "green";
                    }
                    return {
                        fillColor: color,
                        strokeWeight: 1
                    }
                }

                /*{
                    fillColor: 'green',
                    strokeWeight: 1
                }*/
            );
        });
    };

    $timeout(function() {
         $scope.loadJson();
    }, 200);

    $scope.loadParcel = function(lon, lat) {
        //console.log(da);
        MapService.loadParcel(lon, lat)
            .success(function(data) {
                $scope.parcel = data.features[0].properties;
                $scope.alrcode = data.features[0].properties.alrcode;
                MapService.selectedParcel = $scope.parcel;
            })
            .error(function(error) {
                console.error("da error");
            })
    };

    $scope.showDetail = function(mapData) {
        MapService.selectedLocation = mapData;
        $scope.latlon = MapService.selectedLocation;
        $scope.loadParcel($scope.latlon.lng, $scope.latlon.lat);
        $timeout(function() {
            $state.go('tab.map-detail');
        }, 550);

        //$state.go('tab.map-detail',{title: newsItem.title});
    };

    $scope.showCWR = function(mapData) {
        MapService.selectedLocation = mapData;
        $scope.latlon = MapService.selectedLocation;
        $scope.loadParcel($scope.latlon.lng, $scope.latlon.lat);
        $timeout(function() {
            $state.go('tab.map-cwr');
        }, 250);
    };

    $scope.showGMP = function(mapData) {
        MapService.selectedLocation = mapData;
        $scope.latlon = MapService.selectedLocation;
        $scope.loadParcel($scope.latlon.lng, $scope.latlon.lat);
        $timeout(function() {
            $state.go('tab.map-gmp');
        }, 250);
    };

})

.controller('MapdetailController', function($scope, $stateParams, MapService, $http) {
    $scope.mapData = MapService.selectedLocation;
    $scope.pacelData = MapService.selectedParcel;
    $scope.parcel = $scope.pacelData;


})

.controller('CwrController', function($scope, 
    $stateParams, 
    MapService, 
    $http, 
    $state, 
    $timeout,

    $cordovaCamera, 
    $cordovaFile, 
    $cordovaFileTransfer, 
    $cordovaDevice, 
    $ionicPopup, 
    $cordovaActionSheet
    ) {

    $scope.mapData = MapService.selectedLocation;
    $scope.pacelData = MapService.selectedParcel;
    $scope.parcel = $scope.pacelData;

    $scope.data = {
        code: $scope.pacelData.alrcode,
        owner: "",
        ctype: "",
        rai: "",
        date: ""
    };

    var oriData = angular.copy($scope.data);

    $scope.resetForm = function() {
        $scope.data = angular.copy(oriData);
        $scope.dataForm.$setPristine();
    };

    $scope.isPersonChanged = function() {
        return !angular.equals($scope.data, oriData);
    };


    $scope.loadCWR = function() {
        MapService.loadCroptype()
            .success(function(data) {
                $scope.alrCWR = data;
                //console.log($scope.alrData[0].gid);            
            })
            .error(function(error) {
                console.error("error");
            })
    };
    $scope.loadCWR();


    $scope.sendMessage = function() {
        $http.post("http://map.nu.ac.th/alr-map/mobileInsert.php", $scope.data)
            .then(function(res) {
                console.log(res)
            })
    };

    $scope.sendMessage2 = function() {
        $http({
            url: "http://map.nu.ac.th/alr-map/mobileInsert.php?",
            method: "POST",
            data: {
                'code': $scope.pacelData.alrcode,
                'owner': $scope.data.owner,
                'ctype': $scope.data.ctype,
                'rai': $scope.data.rai,
                'date': $scope.data.date,
            }
        }).success(function(response) {
            console.log(response);
        }).error(function(response) {
            console.log(response);
        });
    };


    $scope.showCWRchart = function() {
        //consol.log(newsItem);
        //MapService.selectedParcel = pacelData;
        //$state.go('tab.map-cwrchart');
        //$state.go('tab.map-detail',{title: newsItem.title});
        //MapService.selectedLocation = mapData;
        //$scope.latlon = MapService.selectedLocation;
        //$scope.loadParcel($scope.latlon.lng, $scope.latlon.lat);
        $timeout(function() {
            $state.go('tab.map-cwrchart');
        }, 200);
    };


/// add camera

$scope.image = null;

        $scope.showAlert = function(title, msg) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: msg
            });
        };

        $scope.loadImage = function() {
            var options = {
                title: 'Select Image Source',
                buttonLabels: ['Load from Library', 'Use Camera'],
                addCancelButtonWithLabel: 'Cancel',
                androidEnableCancelButton: true,
            };
            $cordovaActionSheet.show(options).then(function(btnIndex) {
                var type = null;
                if (btnIndex === 1) {
                    type = Camera.PictureSourceType.PHOTOLIBRARY;
                } else if (btnIndex === 2) {
                    type = Camera.PictureSourceType.CAMERA;
                }
                if (type !== null) {
                    $scope.selectPicture(type);
                }
            });
        };

        // Take image with the camera or from library and store it inside the app folder
        // Image will not be saved to users Library.
        $scope.selectPicture = function(sourceType) {
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: sourceType,
                saveToPhotoAlbum: false,
                correctOrientation: true //rotation picture
            };

            $cordovaCamera.getPicture(options).then(function(imagePath) {
                    // Grab the file name of the photo in the temporary directory
                    var currentName = imagePath.replace(/^.*[\\\/]/, '');

                    //Create a new name for the photo
                    var d = new Date(),
                        n = d.getTime(),
                        newFileName = n + ".jpg";

                    // If you are trying to load image from the gallery on Android we need special treatment!
                    if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
                        window.FilePath.resolveNativePath(imagePath, function(entry) {
                            window.resolveLocalFileSystemURL(entry, success, fail);

                            function fail(e) {
                                console.error('Error: ', e);
                            }

                            function success(fileEntry) {
                                var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
                                // Only copy because of access rights
                                $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function(success) {
                                    $scope.image = newFileName;
                                }, function(error) {
                                    $scope.showAlert('Error', error.exception);
                                });
                            };
                        });
                    } else {
                        var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
                        // Move the file to permanent storage
                        $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function(success) {
                            $scope.image = newFileName;
                        }, function(error) {
                            $scope.showAlert('Error', error.exception);
                        });
                    }
                },
                function(err) {
                    // Not always an error, maybe cancel was pressed...
                })
        };



        // Returns the local path inside the app for an image
        $scope.pathForImage = function(image) {
            if (image === null) {
                return '';
            } else {
                return cordova.file.dataDirectory + image;
            }
        };

        $scope.uploadImage = function() {
            // Destination URL
            //var url = "http://202.29.52.232:8081/takeaphoto/upload.php";
            var url = "http://map.nu.ac.th/alr-map/takeaphoto/upload.php?alrcode="+$scope.pacelData.alrcode;

            // File for Upload
            var targetPath = $scope.pathForImage($scope.image);

            // File name only
            var filename = $scope.image;;

            var options = {
                fileKey: "file",
                fileName: filename,
                chunkedMode: false,
                mimeType: "multipart/form-data",
                params: { 'fileName': filename }
            };

            $cordovaFileTransfer.upload(url, targetPath, options).then(function(result) {
                $scope.showAlert('Success', 'Image upload finished.');
            });
        }

//end camera


})

.controller('CwrchartController', function($scope, $stateParams, MapService, ChartService, $http, $timeout) {
    $scope.mapData = MapService.selectedLocation;
    $scope.pacelData = MapService.selectedParcel;

    $scope.tamcode = $scope.pacelData.tam_code;
    $scope.rain30Arr = [];
    $scope.rain30Label = [];
    $scope.evap30Arr = [];
    $scope.evap30Label = [];

    $scope.loadMeteo = function(tamcode) {
        ChartService.loadRain30y(tamcode)
            .success(function(data) {
                for (var prop in data[0]) {
                    for (var i = 1; i <= 52; i++) {
                        var w = 'w' + i;
                        if (prop == w) {
                            $scope.rain30Label.push(prop);
                            $scope.rain30Arr.push(Number(data[0][prop]));
                        }
                    }
                }
            })
            .error(function(error) {
                console.error("error");
            });
        // load evap
        ChartService.loadEvap30y(tamcode)
            .success(function(data) {
                for (var prop in data[0]) {
                    for (var i = 1; i <= 52; i++) {
                        var w = 'w' + i;
                        if (prop == w) {
                            //$scope.evap30Label.push(prop);
                            $scope.evap30Arr.push(Number(data[0][prop]));
                        }
                    }
                }
            })
            .error(function(error) {
                console.error("error");
            });
    };


    $scope.alrcode = $scope.pacelData.alrcode;
    $scope.cwrArr = [];
    $scope.cwr2Arr = [];
    $scope.cwr3Arr = [];
    $scope.loadCWR = function(alrcode) {
        ChartService.loadCWR(alrcode)
            .success(function(data) {
                for (var prop in data[0]) {
                    for (var i = 1; i <= 52; i++) {
                        var w = 'w' + i;
                        if (prop == w) {
                            //$scope.cwrLabel.push(prop);
                            //$scope.cwrArr.push(Number(data[0][prop]));
                            if (Number(data[0][prop]) > 0) {
                                $scope.cwrArr.push(Number(data[0][prop]));
                                //console.log('ok');
                            } else {
                                $scope.cwrArr.push(null);
                                //console.log('null')
                            }
                        }
                    }
                }
            })
            .error(function(error) {
                console.error("error");
            });
        // load evap

        ChartService.loadCWR2(alrcode)
            .success(function(data) {
                for (var prop in data[0]) {
                    for (var i = 1; i <= 52; i++) {
                        var w = 'w' + i;
                        if (prop == w) {
                            //$scope.cwrLabel.push(prop);
                            //$scope.cwrArr.push(Number(data[0][prop]));
                            if (Number(data[0][prop]) > 0) {
                                $scope.cwr2Arr.push(Number(data[0][prop]));
                                //console.log('ok');
                            } else {
                                $scope.cwr2Arr.push(null);
                                //console.log('null')
                            }
                        }
                    }
                }
            })
            .error(function(error) {
                console.error("error");
            });
        // load evap

        ChartService.loadCWR3(alrcode)
            .success(function(data) {
                $scope.c3name = data;
                for (var prop in data[0]) {
                    for (var i = 1; i <= 52; i++) {
                        var w = 'w' + i;
                        if (prop == w) {
                            //$scope.cwrLabel.push(prop);
                            //$scope.cwrArr.push(Number(data[0][prop]));
                            if (Number(data[0][prop]) > 0) {
                                $scope.cwr3Arr.push(Number(data[0][prop]));
                                //console.log('ok');
                            } else {
                                $scope.cwr3Arr.push(null);
                                //console.log('null')
                            }
                        }
                    }
                }
            })
            .error(function(error) {
                console.error("error");
            });
        // load evap
    };




    //console.log($scope.cwr3Type);
    // chart 1
    $scope.loadMeteo($scope.tamcode);
    $scope.chart1Labels = $scope.rain30Label;
    $scope.chart1Series = ['ฝนเฉลี่ย 30ปี', 'ระเหยเฉลี่ย 30ปี'];
    $scope.chart1Data = [$scope.rain30Arr, $scope.evap30Arr];

    // chart 2
    $scope.loadCWR($scope.alrcode);
    $scope.chart2Labels = $scope.rain30Label;
    $scope.chart2Series = ['พืชชนิดที่ 1', 'พืชชนิดที่ 2', 'พืชชนิดที่ 3', 'ฝนเฉลี่ย 30ปี'];
    $scope.chart2Data = [$scope.cwrArr, $scope.cwr2Arr, $scope.cwr3Arr, $scope.rain30Arr]






    /*[
        [65, 59, 80, 81, 56, 55, 40]
    ];*/
    $scope.onClick = function(points, evt) {
        console.log(points, evt);
    };

    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B', 'Series c', 'Series d'];
    $scope.data = [
        [65, 59, 80, null, null, 55, 40],
        [28, 48, 40, 19, 86, 27, 90],
        [18, 28, 50, 29, 46, 37, 40],
        [68, 88, 40, 69, 26, 37, 70]
    ];

    // Simulate async data update
    /*$timeout(function () {
        $scope.data = [
          [28, 48, 40, 19, 86, 27, 90],
          [65, 59, 80, 81, 56, 55, 40]
        ];
      }, 3000);*/
})

.controller('GmpController', function($scope, $stateParams, MapService, QuestionService, $http) {
    $scope.mapData = MapService.selectedLocation;
    $scope.pacelData = MapService.selectedParcel;
    $scope.parcel = $scope.pacelData;


    $scope.showCWRchart = function() {
        $timeout(function() {
            $state.go('tab.map-gmp-water');
        }, 200);
    };

})

.controller('GmpWaterController', function($scope, $stateParams, QuestionService) {
    $scope.qWater = QuestionService.gmpWater();

})

.controller('GmpLandController', function($scope, $stateParams, QuestionService) {
    $scope.qLand = QuestionService.gmpLand();

})

.controller('GmpRecordController', function($scope, $stateParams, QuestionService) {
    $scope.qRecord = QuestionService.gmpRecord();

})

.controller('GmpHarvestController', function($scope, $stateParams, QuestionService) {
    $scope.qHarvest = QuestionService.gmpHarvest();

})

.controller('GmpChemUseController', function($scope, $stateParams, QuestionService) {
    $scope.qChem_use = QuestionService.gmpChem_use();

})

.controller('GmpChemStorController', function($scope, $stateParams, QuestionService) {
    //$scope. = QuestionService.();
    $scope.qChem_stor = QuestionService.gmpChem_stor();

})

.controller('GmpJustifyController', function($scope, $stateParams, QuestionService) {
    $scope.qJustify = QuestionService.gmpJustify();

})

.controller('NewsController', function($scope, NewsService, $http) {
    $http.get("group74.xml", {
            transformResponse: function(cnv) {
                // var x2js = new X2JS();
                // var aftCnv = x2js.xml_str2json(cnv);
                //  return aftCnv;
            }
        })
        .success(function(response) {
            $scope.news = response;
            console.log(response);
        });

})

.controller('ChatsCtrl', function($scope, Chats) {
    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
        Chats.remove(chat);
    };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});