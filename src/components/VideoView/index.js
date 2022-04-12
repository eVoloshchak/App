import React from 'react';
import {View} from 'react-native';
import ReactPlayer from 'react-player';
import Text from '../Text';
import styles from '../../styles/styles';

const VideoView = (props) => {
    return (
        <View style={[styles.defaultAttachmentView, { flexDirection: 'column', position: 'relative' }]} >
            <ReactPlayer 
                url={props.url} 
                controls 
                width='100%'
                height='100%'
            />
            <Text style={[styles.textStrong, styles.flexShrink1, styles.breakAll, styles.flexWrap, styles.mw100]}>{props.file && props.file.name}</Text>
        </View>
    )
}

export default VideoView;