import React from 'react';
import TextInput from '../../../../components/TextInput';

class IOUAmountInput extends React.Component {
    constructor(props) {
        super(props);

        this.setCaretPosition = this.setCaretPosition.bind(this);
        this.focus = this.focus.bind(this);
    }

    setCaretPosition(position) {
        this.textInput.setNativeProps({selection: {start: position, end: position}});
    }

    focus() {
        this.textInput.focus();
    }

    render() {
        return (
            <TextInput
                ref={el => this.textInput = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

export default IOUAmountInput;
