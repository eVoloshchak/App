import React, { Component } from 'react';
import {View} from 'react-native';
import VideoPlayer from 'react-native-video-controls';
import Text from '../Text';
import styles from '../../styles/styles';

const VideoView = (props) => {
    return (
        <View style={[styles.defaultAttachmentView, { flexDirection: 'column',  }]} >
            <View style={{ width: 200, height: 200 }}>
            <VideoPlayer
                source={{uri: props.url}} 
                paused
                resizeMode={'contain'}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                }}
            />
            </View>

            <Text style={[styles.textStrong, styles.flexShrink1, styles.breakAll, styles.flexWrap, styles.mw100]}>{props.file && props.file.name}</Text>
        </View>
    )
}

export default VideoView;