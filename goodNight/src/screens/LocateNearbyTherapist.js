import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import * as Location from 'expo-location';
import { Avatar, Button, Card, Text, List } from 'react-native-paper';
// import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';


export const LocateTherapistMenu = () => {
    const [errorMsg, setErrorMsg] = useState(null);
    const [locations, setLocations] = useState([

    ]); //Array for storing locations of therapists -> 0 entry will be user location

    const preparedLocations = [
        // Example therapists' locations
        { id: '1', name: 'Therapist A', latitude: 37.7649, longitude: -122.4175, description: 'Specializes in Overwatch.' },
        { id: '2', name: 'Therapist B', latitude: 37.7854, longitude: -122.4072, description: 'Expert in Zelda.' },
        { id: '3', name: 'Therapist C', latitude: 37.7645, longitude: -122.4732, description: 'Resident Evil specialist.' },
        { id: '4', name: 'Therapist D', latitude: 37.7733, longitude: -122.4792, description: 'CSGO Master Rank' },
    ];

    const [region, setRegion] = useState({
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const onItemPress = (location) => {
        setRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        });
        mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 1000);
    };

    const mapRef = useRef(null);


    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    return;
                }

                // Function for taking in user location -> will be stored in locations{} as id[0]
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.BestForNavigation
                });

                // Separately store user lat and long for distance filtering 
                const userLat = currentLocation.coords.latitude;
                const userLon = currentLocation.coords.longitude;

                const currentLocationEnhanced = {
                    id: '0',
                    name: 'Your Location',
                    latitude: userLat,
                    longitude: userLon,
                    description: 'Your current location'
                };

                // Fetch therapist locations from Firestore
                const snapshot = await firestore().collection('therapistLocations').get();
                const therapists = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        latitude: data.geolocation.latitude,
                        longitude: data.geolocation.longitude,
                        description: data.description
                    };
                });

                //console.log("Location fetched comparison:", therapists);

                // Filter therapists within 50 km
                const nearTherapists = therapists.filter(therapist => {
                    const distance = getDistanceFromLatLonInKm(
                        userLat, userLon, therapist.latitude, therapist.longitude
                    );
                    return distance <= 50; // distance in km
                });

                setLocations([currentLocationEnhanced, ...nearTherapists]);
                //console.log("Location fetched and therapists filtered:", nearTherapists);
            } catch (error) {
                console.error("Failed to fetch location or therapists data:", error);
                setErrorMsg('Failed to fetch location or therapists data');
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {preparedLocations.map(location => (
                    <Marker
                        key={location.id}
                        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                        title={location.name}
                        description={location.description}
                        pinColor={location.id === '0' ? 'blue' : 'red'}
                    />
                ))}
            </MapView>
            <SafeAreaView style={styles.listContainer}>
                <ScrollView>
                    {preparedLocations.filter(location => location.id > 0).map((location, index) => (
                        <List.Item
                            key={index}
                            title={location.name}
                            description={location.description}
                            left={props => <List.Icon {...props} icon="account" />}
                            right={() => <List.Icon icon="chevron-right" />}
                            onPress={() => onItemPress(location)}
                        />
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

// Function for comparing distances between two locations
// Used for filtering the therapists location from database
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

// Helping function for getDistanceFRomLatLonInKm
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Stylesheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    menuOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    map: {
        width: '100%',
        height: '60%',
        borderRadius: 25,
    },
    listContainer: {
        flex: 1,
    },
});
