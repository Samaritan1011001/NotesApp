import React, {useState} from 'react';
import {updateNote} from '../../graphql/mutations';
import {View, TextInput, Button, StyleSheet} from 'react-native';
import {S3Image} from 'aws-amplify-react-native';
import {API, graphqlOperation} from 'aws-amplify';

const UpdateNoteScreen = ({navigation, route}) => {
  const initialState = {
    title: route.params?.note.title,
    content: route.params?.note.content,
    imageKey: route.params?.note.imageKey,
  };

  async function update() {
    try {
      const note = {...formState};
      note.id = route.params?.note.id;
      await API.graphql(graphqlOperation(updateNote, {input: note}));
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
  const [formState, setFormState] = useState(initialState);

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
      <S3Image
        imgKey={formState.imageKey}
        style={{width: 100, height: 100}}
        picker={true}
      />
      <Button title="Update Note" onPress={update} />
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

export default UpdateNoteScreen;
