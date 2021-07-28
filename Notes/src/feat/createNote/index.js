import React, {useState} from 'react';
import uuid from 'react-native-uuid';
import {launchImageLibrary} from 'react-native-image-picker';
import {createNote} from '../../graphql/mutations';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {API, graphqlOperation, Storage} from 'aws-amplify';
import ImageS3 from '../../components/s3_image';
import {ActivityIndicator, Colors} from 'react-native-paper';

const initialState = {title: '', content: '', imageKey: ''};

/* Create screen that allows the user to create a note and attach a photo with the note */
const CreateNoteScreen = ({navigation}) => {
  var imageKeyUUID = uuid.v1();
  const [filePath, setFilePath] = useState({});
  const [formState, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(false);

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

      setFilePath(response.assets[0]);
    });
  };

  async function addNote() {
    try {
      setLoading(true);

      const note = {...formState};
      if (note.title === '' || note.content === '') {
        alertRequiredNameContent();
        setLoading(false);
        return;
      }
      if(filePath.uri){
      note.imageKey = imageKeyUUID;
      await pathToImageFile();
      }
      await API.graphql(graphqlOperation(createNote, {input: note}));
      setLoading(false);

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

  const alertRequiredNameContent = () =>
    Alert.alert('Required', 'Title and Content are both required fields', [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);

  async function pathToImageFile() {
    try {
      const response = await fetch(filePath.uri);
      const blob = await response.blob();
      await Storage.put(imageKeyUUID, blob, {
        contentType: 'image/jpeg',
      });
    } catch (err) {
      console.log('Error uploading file:', err);
    }
  }

  function setInput(key, value) {
    setFormState({...formState, [key]: value});
  }
  return (
    <ScrollView>
      <View style={styles.container}>
        <TextInput
          onChangeText={val => setInput('title', val)}
          style={styles.input}
          value={formState.title}
          placeholder="Title"
        />
        <TextInput
          onChangeText={val => setInput('content', val)}
          style={styles.content}
          value={formState.content}
          placeholder="Content"
          multiline={true}
        />
        <ImageS3 uri={filePath.uri} />
        <View style={{height: 20}} />
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={chooseFile}>
          <Text style={styles.appButtonText}>Choose Image</Text>
        </TouchableOpacity>
        <View style={{height: 10}} />
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={addNote}>
          {loading ? (
            <ActivityIndicator
              style={styles.activityIndicator}
              color={Colors.red800}
            />
          ) : (
            <Text style={styles.appButtonText}>Create Note</Text>
          )}
        </TouchableOpacity>
        
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    padding: 20,
    alignContent: 'flex-start',
  },
  input: {
    height: 50,
    backgroundColor: '#ddd',
    marginBottom: 10,
    padding: 16,
    borderRadius: 10,
  },
  imageStyle: {
    width: 350,
    height: 150,
    resizeMode: 'contain',
    paddingLeft: 0,
    borderRadius: 10,
  },
  buttonStyle: {
    elevation: 8,
    backgroundColor: '#009688',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  content: {
    height: 350,
    backgroundColor: '#ddd',
    marginBottom: 10,
    paddingTop: 10,
    padding: 16,
    textAlignVertical: 'top',
    borderRadius: 10,
  },
});

export default CreateNoteScreen;
