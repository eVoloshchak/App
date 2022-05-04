import React from 'react';
import TextInput from '../../../../components/TextInput';

class IOUAmountInput extends React.Component {
    constructor(props) {
        super(props);

        this.setCaretPosition = this.setCaretPosition.bind(this);
        this.focus = this.focus.bind(this);

        this.state = {
            selection: {start: 0, end: 0},
        };
    }

    setCaretPosition(position) {
        setTimeout(() => this.setState({selection: {start: position, end: position}}), 1);
    }

    focus() {
        this.textInput.focus();
    }

    render() {
        return (
            <TextInput
                ref={el => this.textInput = el}
                onSelectionChange={(e) => {
                    this.setState({selection: e.nativeEvent.selection});
                    this.props.onSelectionChange(e);
                }}
                selection={this.state.selection}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

export default IOUAmountInput;
