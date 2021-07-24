import {ActivityIndicator, Colors} from 'react-native-paper';
import {StyleSheet, Image, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Storage} from 'aws-amplify';

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
          defaultSource={require('./placeholder-image.png')}
          onError={err => console.log(err)}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
      ) : (
        <Image
          style={styles.imageStyle}
          source={require('./placeholder-image.png')}
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
    width: 350,
    height: 150,
    resizeMode: 'stretch',
    paddingLeft: 0,
  },
  activityIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ImageS3;
