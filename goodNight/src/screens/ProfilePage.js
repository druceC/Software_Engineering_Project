import React, {useState} from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Title, Paragraph, Button, Text, List, useTheme, Card, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TestScreen } from './TestingScreen';
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const ProfilePage = () => {
    // This is to use the theme colors from react-native-paper
    const { colors } = useTheme();
    const nav = useNavigation();
    const user = auth().currentUser;
    const [username, setUsername] = useState('Loading');

    const fetchUsername = async (uid) => {
        const querySnapshot = await firestore().collection('usernames').where('uid', '==', uid).get();
        const userDoc = querySnapshot.docs[0];
        return userDoc.data().username; 
    };
    fetchUsername(user.uid)
        .then(username => {
            setUsername(username);
        })

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Card 
                    style={styles.profileCard}
                    onPress={() => { }}> 
                    {/* action of pressing the profile card */}
                    <Card.Title
                        title={username}
                        subtitle={user.email}
                        titleStyle={styles.cardTitle}
                        subtitleStyle={styles.cardSubtitle}
                        left={(props) => <Avatar.Image {...props} size={60} source={require('../images/logo.png')} />}
                        leftStyle={styles.avatar}
                        style={styles.cardContent}
                    />
                    <Card.Content>
                        {/* The title and paragraph have been removed as the Card.Title already contains the name and email */}
                    </Card.Content>
                    <Card.Actions>
                        {/* Actions can be added here if needed */}
                    </Card.Actions>
                </Card>
            </View>

            <View style={styles.profileContent}>
                <List.Section style={styles.listSection}>
                    <List.Item
                        title="Graphs & Reports"
                        left={() => <List.Icon icon="chart-bar" />}
                        GoogleMap 
                        style={styles.listItem}
                        onPress={() => { }}
                        borderTopLeftRadius={15}
                        borderTopRightRadius={15}
                    />
                    <List.Item
                        title="Sleep Cycle Evaluation"
                        left={() => <List.Icon icon="calendar" />}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={() => { }}
                        style={styles.listItem}
                    />
                    <List.Item
                        title="Settings"
                        left={() => <List.Icon icon="cog" />}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={() => { }}
                        style={styles.listItem}
                    />
                    <List.Item
                        title="Graphs & Reports"
                        left={() => <List.Icon icon="chart-bar" />}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={() => { }}
                        style={styles.listItem}
                    />
                    <List.Item
                        title="Sleep Cycle Evaluation"
                        left={() => <List.Icon icon="calendar" />}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={() => { }}
                        style={styles.listItem}
                    />
                    <List.Item
                        title="Dev Testing"
                        left={() => <List.Icon icon="test-tube" />}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={() => nav.navigate("TestScreen")}
                        style={styles.listItem}
                        borderBottomLeftRadius={15}
                        borderBottomRightRadius={15}
                    />
                </List.Section>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>GoodNight Sleep Therapy</Text>
                <Text style={styles.footerText}>Version 1.0.0</Text>
                <Text style={styles.footerText}>©NYUAD SE Group</Text>
                <Text style={[styles.footerText, { color: colors.primary }]} onPress={() => { }}>Privacy Policy</Text>
                <Text style={[styles.footerText, { color: colors.primary }]} onPress={() => { }}>Terms of Use</Text>
                <Text style={[styles.footerText, { color: colors.primary }]} onPress={() => { }}>Accessibility Statement</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        padding: 20,
    },
    emailTitle: {
        marginTop: 10,
    },
    avatar: {
        marginRight: 10, // Spacing between avatar and title
    },
    footer: {
        alignItems: 'center',
        padding: 20,
    },
    footerText: {
        lineHeight: 25,
    },
    profileContent: {
        padding: 20,
    },
    listItem: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 20,
    },
    cardTitle: {
        fontSize: 20,
        marginLeft: 25,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        fontSize: 12,
        marginLeft: 25
    },
    cardContent:{
        marginTop: 15,
    },
    profileCard: {
        width: '100%',
        marginTop: '20%',
    },
});


export { ProfilePage };