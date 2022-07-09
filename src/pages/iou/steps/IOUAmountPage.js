import React from 'react';
import {
    View,
    InteractionManager,
    findNodeHandle,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import CONST from '../../../CONST';
import canUseTouchScreen from '../../../libs/canUseTouchscreen';
import TextInputWithCurrencySymbol from '../../../components/TextInputWithCurrencySymbol';

const propTypes = {
    /** Whether or not this IOU has multiple participants */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** The ID of the report this screen should display */
    reportID: PropTypes.string.isRequired,

    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** Previously selected amount to show if the user comes back to this screen */
    selectedAmount: PropTypes.string.isRequired,

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (retrieving users preferred currency) */
        loading: PropTypes.bool,

        /** Selected Currency Code of the current IOU */
        selectedCurrencyCode: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
};

class IOUAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateAmountNumberPad = this.updateAmountNumberPad.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.stripCommaFromAmount = this.stripCommaFromAmount.bind(this);
        this.focusTextInput = this.focusTextInput.bind(this);
        this.navigateToCurrencySelectionPage = this.navigateToCurrencySelectionPage.bind(this);
        this.deleteSymbol = this.deleteSymbol.bind(this);
        this.getPastedText = this.getPastedText.bind(this);

        this.state = {
            amount: props.selectedAmount,
            selection: {start: 0, end: 0},
        };
    }

    componentDidMount() {
        this.focusTextInput();
    }

    componentDidUpdate(prevProps) {
        if (this.props.iou.selectedCurrencyCode === prevProps.iou.selectedCurrencyCode) {
            return;
        }

        this.focusTextInput();
    }

    /**
     * Focus text input
     */
    focusTextInput() {
        // Component may not initialized due to navigation transitions
        // Wait until interactions are complete before trying to focus
        InteractionManager.runAfterInteractions(() => {
            // Focus text input
            if (!this.textInput) {
                return;
            }

            this.textInput.focus();
        });
    }

    /**
     * @param {String} amount
     * @returns {Number}
     */
    calculateAmountLength(amount) {
        const leadingZeroes = amount.match(/^0+/);
        const leadingZeroesLength = lodashGet(leadingZeroes, '[0].length', 0);
        const absAmount = parseFloat((amount * 100).toFixed(2)).toString();

        /*
        Return the sum of leading zeroes length and absolute amount length(including fraction digits).
        When the absolute amount is 0, add 2 to the leading zeroes length to represent fraction digits.
        */
        return leadingZeroesLength + (absAmount === '0' ? 2 : absAmount.length);
    }

    /**
     * Check if amount is a decimal upto 3 digits
     *
     * @param {String} amount
     * @returns {Boolean}
     */
    validateAmount(amount) {
        const decimalNumberRegex = new RegExp(/^\d+(,\d+)*(\.\d{0,2})?$/, 'i');
        return amount === '' || (decimalNumberRegex.test(amount) && this.calculateAmountLength(amount) <= CONST.IOU.AMOUNT_MAX_LENGTH);
    }

    /**
     * Strip comma from the amount
     *
     * @param {String} amount
     * @returns {String}
     */
    stripCommaFromAmount(amount) {
        return amount.replace(/,/g, '');
    }

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    updateAmountNumberPad(key) {
        // Backspace button is pressed
        if (key === '<' || key === 'Backspace') {
            if (this.state.amount.length > 0) {
                this.setState((prevState) => {
                    const amount = this.deleteSymbol(prevState.amount);
                    let cursorPosition = prevState.selection.start; // if user has highlighted at least one symbol, selection.start is automatically shifted to the left
                    if (prevState.selection.start === prevState.selection.end) {
                        cursorPosition -= 1;
                    }

                    const selection = {start: cursorPosition, end: cursorPosition};
                    return {amount, selection};
                });
            }
            return;
        }

        this.setState((prevState) => {
            const amount = prevState.amount.substring(0, prevState.selection.start) + key + prevState.amount.substring(prevState.selection.end);
            const amountIsValid = this.validateAmount(amount);
            if (amountIsValid) {
                const selection = {start: prevState.selection.start + 1, end: prevState.selection.start + 1};
                return {amount: this.stripCommaFromAmount(amount), selection}
            }
            return prevState;
        });
    }

    /**
     * Update amount on amount change
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit
     *
     * @param {String} text - Changed text from user input
     */
    updateAmount(text) {
        this.setState((prevState) => {
            const amount = this.stripCommaFromAmount(this.replaceAllDigits(text, this.props.fromLocaleDigit));
            const amountIsValid = this.validateAmount(amount);
            if (amountIsValid) {
                const pastedText = this.getPastedText(prevState.amount, amount, prevState.selection);
                const cursorPosition = prevState.selection.start + pastedText.length
                const selection = {start: cursorPosition, end: cursorPosition};
                return {amount, selection}
            }
            return prevState;
        });
    }

    /**
     * Replaces each character by calling `convertFn`. If `convertFn` throws an error, then
     * the original character will be preserved.
     *
     * @param {String} text
     * @param {Function} convertFn - `this.props.fromLocaleDigit` or `this.props.toLocaleDigit`
     * @returns {String}
     */
    replaceAllDigits(text, convertFn) {
        return _.chain([...text])
            .map((char) => {
                try {
                    return convertFn(char);
                } catch {
                    return char;
                }
            })
            .join('')
            .value();
    }

    navigateToCurrencySelectionPage() {
        if (this.props.hasMultipleParticipants) {
            return Navigation.navigate(ROUTES.getIouBillCurrencyRoute(this.props.reportID));
        }
        if (this.props.iouType === CONST.IOU.IOU_TYPE.SEND) {
            return Navigation.navigate(ROUTES.getIouSendCurrencyRoute(this.props.reportID));
        }
        return Navigation.navigate(ROUTES.getIouRequestCurrencyRoute(this.props.reportID));
    }

    getPastedText(prevString, newString, selection) {
        let pastedText = newString.slice(selection.start);
        if (prevString.length - selection.end) {
            pastedText = pastedText.slice(0, (prevString.length - selection.end) * -1);
        }
        return pastedText;
    }

    deleteSymbol(amount) {
        if (this.state.selection.start === this.state.selection.end) {
            return amount.substring(0, this.state.selection.start - 1) + amount.substring(this.state.selection.start, amount.length);
        }
        return amount.substring(0, this.state.selection.start) + amount.substring(this.state.selection.end, amount.length);
    }

    render() {
        const formattedAmount = this.replaceAllDigits(this.state.amount, this.props.toLocaleDigit);

        return (
            <>
                <View style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.w100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                ]}
                >
                    <TextInputWithCurrencySymbol
                        formattedAmount={formattedAmount}
                        onChangeAmount={this.updateAmount}
                        onCurrencyButtonPress={this.navigateToCurrencySelectionPage}
                        placeholder={this.props.numberFormat(0)}
                        preferredLocale={this.props.preferredLocale}
                        ref={el => this.textInput = el}
                        selectedCurrencyCode={this.props.iou.selectedCurrencyCode}
                        selection={this.state.selection}
                        onSelectionChange={e => this.setState({ selection: e.nativeEvent.selection })}
                        onBlur={(e) => {
                            // If user pressed on empty screen - move cursor to the end
                            if (!findNodeHandle(e.relatedTarget)) {
                                const cursorPosition = this.state.amount.length;
                                this.setState({ selection: {start: cursorPosition, end: cursorPosition} })
                            }
                        }}
                    />
                </View>
                <View style={[styles.w100, styles.justifyContentEnd]}>
                    {canUseTouchScreen()
                        ? (
                            <BigNumberPad
                                numberPressed={this.updateAmountNumberPad}
                            />
                        ) : <View />}

                    <Button
                        success
                        style={[styles.w100, styles.mt5]}
                        onPress={() => this.props.onStepComplete(this.state.amount)}
                        pressOnEnter
                        isDisabled={!this.state.amount.length || parseFloat(this.state.amount) < 0.01}
                        text={this.props.translate('common.next')}
                    />
                </View>
            </>
        );
    }
}

IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(IOUAmountPage);
