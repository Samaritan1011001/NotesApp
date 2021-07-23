import React, {useEffect, useState} from 'react';

import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {API, graphqlOperation, Auth, Storage} from 'aws-amplify';
import {deleteNote} from '../../graphql/mutations';
import {listNotes} from '../../graphql/queries';
import {S3Image} from 'aws-amplify-react-native';
import {Button} from 'react-native-paper';

const HomeScreen = ({navigation, route}) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, [route.params?.note]);

  async function fetchNotes() {
    try {
      const noteData = await API.graphql(graphqlOperation(listNotes));
      const notes = noteData.data.listNotes.items;
      setNotes(notes);
    } catch (err) {
      console.log('error fetching notes, ', err);
    }
  }

  async function delNote(note) {
    console.log('here');
    try {
      await Storage.remove(note.imageKey);
      await API.graphql(graphqlOperation(deleteNote, {input: {id: note.id}}));
      const newNotes = notes.filter(item => item.id !== note.id);
      setNotes(newNotes);
    } catch (err) {
      console.log('error fetching notes, ', err);
    }
  }

  const renderItem = ({item}) => {
    console.log(item);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Update', {note: item})}
        underlayColor="white">
        <View style={styles.note}>
          <S3Image imgKey={item.imageKey} style={styles.imageStyle} />
          <Text style={styles.noteTitle}>{item.title}</Text>
          <Text style={styles.noteContent}>{item.content}</Text>
          <Button
            style={{alignSelf: 'flex-end', paddingBottom: 10}}
            icon="delete"
            color="red"
            onPress={() => delNote(item)}
          />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <FlatList
      data={notes}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ListEmptyComponent={
        <Text style={{textAlign: 'center'}}>Empty Note List</Text>
      }
      ItemSeparatorComponent={({highlighted}) => (
        <View style={styles.separator} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  todo: {marginBottom: 15},
  input: {height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8},
  todoName: {fontSize: 18},
  imageStyle: {
    height: 150,
    resizeMode: 'stretch',
  },
  note: {
    borderRadius: 5,
    flex: 1,
    backgroundColor: 'white',
    margin: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  noteTitle: {
    paddingTop: 20,
    paddingLeft: 20,

    fontSize: 24,
    fontWeight: 'bold',
  },
  noteContent: {
    paddingTop: 10,
    paddingLeft: 20,
    flexWrap: 'wrap',
  },
  separator: {
    height: 2,
  },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});

export default HomeScreen;