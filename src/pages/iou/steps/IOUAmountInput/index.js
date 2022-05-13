import React from 'react';
import {findNodeHandle} from 'react-native';
import TextInput from '../../../../components/TextInput';
import _ from 'underscore';

class IOUAmountInput extends React.Component {
    constructor(props) {
        super(props);

        this.focus = this.focus.bind(this);
    }

    setCaretPosition() {}

    focus() {
        this.textInput.focus();
    }

    render() {
        return (
            <TextInput
                ref={el => this.textInput = el}
                onBlur={(e) => {
                    // If user pressed not on the keypad - move caret to the end
                    if (!findNodeHandle(e.relatedTarget)) {
                        const amountLength = this.textInput.value.length;
                        const selection = {start: amountLength, end: amountLength};
                        this.props.onSelectionChange({nativeEvent: {selection}});
                    }
                    this.props.onBlur(e);
                }}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(_.omit(this.props, 'onBlur'))}
            />
        );
    }
}

export default IOUAmountInput;
