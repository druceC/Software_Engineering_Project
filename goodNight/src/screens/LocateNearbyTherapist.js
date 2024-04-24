import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import * as Location from 'expo-location';
import { Avatar, Button, Card, Text, List } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';


export const LocateTherapistMenu = () => {
    const [errorMsg, setErrorMsg] = useState(null);
    const [locations, setLocations] = useState([]); //Array for storing locations of therapists -> 0 entry will be user location

    const preparedLocations = [
        /*
        Sample hardcoded locations before implementing firebase -> now obsolete
        { id: '1', name: 'Therapist A', latitude: 24.5364, longitude: 54.4771, description: 'Specializes in cognitive therapy.' },
        { id: '2', name: 'Therapist B', latitude: 24.5296, longitude: 54.4282, description: 'Expert in behavioral therapy.' },
        { id: '3', name: 'Therapist C', latitude: 24.5178, longitude: 54.4403, description: 'Family counseling specialist.' },
        */
    ];


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
            <View style={styles.menuOption}>
                <Card style={styles.card}>
                    <Card.Title title="Find your therapist" />
                    <Card.Content>
                        {locations.length > 0 ? (
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: locations[0].latitude,
                                    longitude: locations[0].longitude,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                            >
                                {locations.map((location) => (
                                    <Marker
                                        key={location.id}
                                        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                                        title={location.name}
                                        description={location.description}
                                        pinColor={location.id === '0' ? 'blue' : 'red'}
                                    />
                                ))}
                            </MapView>
                        ) : (
                            <Text>{errorMsg || 'Loading...'}</Text>
                        )}

                        <List.Item
                            title="First Item"
                            description="Item description"
                            left={props => <List.Icon {...props} icon="account" />}
                        />
                        <List.Item
                            title="First Item"
                            description="Item description"
                            left={props => <List.Icon {...props} icon="account" />}
                        />
                        <List.Item
                            title="First Item"
                            description="Item description"
                            left={props => <List.Icon {...props} icon="account" />}
                        />
                        <List.Item
                            title="First Item"
                            description="Item description"
                            left={props => <List.Icon {...props} icon="account" />}
                        />
                    </Card.Content>
                    <Card.Actions>
                    </Card.Actions>
                </Card>
                {/* 
                    This is the section where the map is printed on the screen
                    The element <MapView> is the overarching map printed in the screen
                    The element <Marker> is for the marker on the map
                    - Currently we check if the location stored is therapists' or users'
                    - If users' the marker is printed blue
                    - If therapists' the marker is printed red
                    * the styles design for MapView can be changed with styles.map in the stylesheet at the bottom of the code
                    * can change styles of marker if you want to
                */}



            </View>
        </View>
    );
}

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
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 40,
    },
    menuOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    map: {
        width: '100%',
        height: 200,
        borderRadius: 25,
    },
    card: {
        width: '100%',
        height: '100%'
    }
});
