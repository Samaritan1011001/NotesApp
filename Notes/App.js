import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {withAuthenticator} from 'aws-amplify-react-native';

import CreateNoteScreen from './src/feat/createNote';
import UpdateNoteScreen from './src/feat/updateNote';
import HomeScreen from './src/feat/home';
import {Appbar} from 'react-native-paper';
import CustomNavigationBar from './src/components/custom_navigation_bar';

const App = () => {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          header: props => <CustomNavigationBar {...props} />,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Create" component={CreateNoteScreen} />
        <Stack.Screen name="Update" component={UpdateNoteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default withAuthenticator(App);
