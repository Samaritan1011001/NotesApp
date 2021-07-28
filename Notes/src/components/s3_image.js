import {ActivityIndicator, Colors} from 'react-native-paper';
import {StyleSheet, Image, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Storage} from 'aws-amplify';

const placeholder = require('../../assests/placeholder-image.png');
const ImageS3 = props => {
  const [loading, setLoading] = useState(false);
  const [uri, setUri] = useState(props.uri);

  useEffect(() => {
    formUrl();
  });

async function formUrl(){
    if(props.imageKey){
        const uri = await Storage.get(props.imageKey);
        setUri(uri);
        setLoading(false);

    }else{
        setUri(props.uri);

    }


}
  return (
    <View>
      {uri ? (
        <Image
          source={{uri: uri}}
          style={styles.imageStyle}
          defaultSource={placeholder}
          onError={err => console.log(err)}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
      ) : (
        <Image
          style={styles.imageStyle}
          source={placeholder}
        />
      )}
        <ActivityIndicator
          style={styles.activityIndicator}
          color={Colors.red800}
          animating={loading}
          />
    </View>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    width: 325,
    height: 150,
    resizeMode: 'stretch',
    padding:0,
  },
  activityIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ImageS3;
