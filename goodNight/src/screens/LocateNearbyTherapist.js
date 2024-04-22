import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export const LocateTherapistMenu = () => {
    const [errorMsg, setErrorMsg] = useState(null);
    const [locations, setLocations] = useState([]);

    const preparedLocations = [
        { id: '1', name: 'Therapist A', latitude: 24.5364, longitude: 54.4771, description: 'Specializes in cognitive therapy.' },
        { id: '2', name: 'Therapist B', latitude: 24.5296, longitude: 54.4282, description: 'Expert in behavioral therapy.' },
        { id: '3', name: 'Therapist C', latitude: 24.5178, longitude: 54.4403, description: 'Family counseling specialist.' },
        // Add more locations as needed
    ];

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    return;
                }
        
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.BestForNavigation
                });
                  
                const currentLocationEnhanced = {
                    id: '0',
                    name: 'Your Location',
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    description: 'Your current location'
                };

                console.log("Location fetched:", currentLocation);
    
                setLocations([currentLocationEnhanced, ...preparedLocations]);
            } catch (error) {
                console.error(error);
                setErrorMsg('Failed to fetch location');
            }
        })();
    }, []);    

    return (
        <View style={styles.container}>
            <View style={styles.menuOption}>
                { locations.length > 0 ? (
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
                <Text>Locate Nearby Therapist</Text>
            </View>
        </View>
    );    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 40,
    },
    menuOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
