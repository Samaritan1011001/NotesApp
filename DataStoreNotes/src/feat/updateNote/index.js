import React, {useEffect, useState} from 'react';
// import {updateNote} from '../../graphql/mutations';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {DataStore, graphqlOperation, Storage} from 'aws-amplify';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageS3 from '../../components/s3_image';
import {ActivityIndicator, Colors} from 'react-native-paper';
import uuid from 'react-native-uuid';
import { Note } from '../../models';

/* Update screen that allows the user to a note including title, content and image */
const UpdateNoteScreen = ({navigation, route}) => {
  var imageKeyUUID = uuid.v1();

  const initialState = {
    title: route.params?.note.title,
    content: route.params?.note.content,
    imageKey: route.params?.note.imageKey,
  };
  // const initialState = route.params?.note;
  const [filePath, setFilePath] = useState({});
  const [formState, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImage();
  }, []);

  
  async function fetchImage() {
    if(initialState.imageKey){
    const url = await Storage.get(initialState.imageKey);
    setFilePath({uri: url});
    }
  }

  async function update() {
    try {
      const updatedNote = {...formState};

      updatedNote.id = route.params?.note.id;
      const imageKey = route.params?.note.imageKey;
      if(imageKey !== ''){
        updatedNote.imageKey = imageKey;
      }else{
        updatedNote.imageKey = imageKeyUUID
      }
      setLoading(true);
      //TODO: fix updating image
      // await pathToImageFile(imageKey);
      // const original =new Note(route.params?.note);
      // const n = await DataStore.query(Note,initialState.id);
      // const original = new Note(n);
      const finalNote = Note.copyOf(route.params?.note, (updated)=> {
        updated.title = updatedNote.title;
        updated.content = updatedNote.content;
        // updated.imageKey = imageKey;
      });
      await DataStore.save(
        finalNote
      );
      setLoading(false);
      navigation.navigate({
        name: 'Home',
        params: {note: updatedNote},
        merge: true,
      });
      setFormState(initialState);
    } catch (err) {
      console.log('error updating note:', err);
    }
  }

  async function pathToImageFile(imageKey) {
    try {
      const response = await fetch(filePath.uri);
      const blob = await response.blob();
      await Storage.put(imageKey, blob, {
        contentType: 'image/jpeg',
      });
    } catch (err) {
      console.log('Error uploading file:', err);
    }
  }

  function setInput(key, value) {
    setFormState({...formState, [key]: value});
  }

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
          onPress={update}>
          {loading ? (
            <ActivityIndicator
              style={styles.activityIndicator}
              color={Colors.red800}
            />
          ) : (
            <Text style={styles.appButtonText}>Update Note</Text>
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
  todo: {marginBottom: 15},
  input: {
    height: 50,
    backgroundColor: '#ddd',
    marginBottom: 10,
    padding: 16,
    borderRadius: 10,
  },
  todoName: {fontSize: 18},
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

export default UpdateNoteScreen;
