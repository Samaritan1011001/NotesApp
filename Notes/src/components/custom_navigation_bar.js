import {Appbar} from 'react-native-paper';
import React from 'react';
import {Auth} from 'aws-amplify';

const CustomNavigationBar = ({navigation, previous}) => {
  async function signOut() {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log('error signing out: ', error);
    }
  }
  return (
    <Appbar.Header style={{backgroundColor: '#009688'}}>
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content />
      {!previous ? (
        <Appbar.Action
          icon="note-plus"
          onPress={() => navigation.navigate('Create')}
        />
      ) : null}
      <Appbar.Action icon="logout" onPress={() => signOut()} />
    </Appbar.Header>
  );
};

export default CustomNavigationBar;
