import React, {useState} from 'react';
import uuid from 'react-native-uuid';
import {launchImageLibrary} from 'react-native-image-picker';
import {createNote} from '../../graphql/mutations';

import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {API, graphqlOperation, Storage} from 'aws-amplify';

const initialState = {title: '', content: '', imageKey: ''};

const CreateNoteScreen = ({navigation}) => {
  var imageKeyUUID = uuid.v1();
  const [filePath, setFilePath] = useState({});
  const [formState, setFormState] = useState(initialState);

  const chooseFile = () => {
    let options = {
      mediaType: 'photo',
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      console.log('Response = ', response.assets[0].uri);

      setFilePath(response.assets[0]);
    });
  };

  async function addNote() {
    try {
      const note = {...formState};
      note.imageKey = imageKeyUUID;
      await pathToImageFile();
      await API.graphql(graphqlOperation(createNote, {input: note}));

      navigation.navigate({
        name: 'Home',
        params: {note: note},
        merge: true,
      });
      setFormState(initialState);
    } catch (err) {
      console.log('error creating note:', err);
    }
  }
  async function pathToImageFile() {
    try {
      const response = await fetch(filePath.uri);
      const blob = await response.blob();
      await Storage.put(imageKeyUUID, blob, {
        contentType: 'image/jpeg', // contentType is optional
      });
    } catch (err) {
      console.log('Error uploading file:', err);
    }
  }

  function setInput(key, value) {
    setFormState({...formState, [key]: value});
  }
  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={val => setInput('title', val)}
        style={styles.input}
        value={formState.title}
        placeholder="Title"
      />
      <TextInput
        onChangeText={val => setInput('content', val)}
        style={styles.input}
        value={formState.content}
        placeholder="Content"
      />
      {/* <S3Image style={{width:300, height:300}} level="private" imgKey={imageKeyUUID} picker /> */}
      <View
        style={{
          container: {
            flex: 1,
            padding: 10,
            backgroundColor: '#fff',
          },
        }}>
        {filePath.uri ? (
          <>
            <Image source={{uri: filePath.uri}} style={styles.imageStyle} />
            {/* <Text style={styles.textStyle}>{filePath.uri}</Text> */}
          </>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={chooseFile}>
          <Text style={styles.textStyleWhite}>Choose Image</Text>
        </TouchableOpacity>
      </View>

      <Button title="Create Note" onPress={addNote} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {justifyContent: 'center', padding: 20, alignContent: 'center'},
  todo: {marginBottom: 15},
  input: {height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8},
  todoName: {fontSize: 18},
  imageStyle: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    margin: 5,
  },
});

export default CreateNoteScreen;
