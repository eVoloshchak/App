import React from 'react';
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
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

export default IOUAmountInput;
