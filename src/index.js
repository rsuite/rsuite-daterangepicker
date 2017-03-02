import React, { PropTypes } from 'react';
import ReactDom from 'react-dom';
import Overlay from 'rsuite/lib/fixtures/Overlay';
import Calendar from './Calendar.js';
import Moment from 'moment';
import classnames from 'classnames';
import { Dropdown, Button } from 'rsuite';


const SLIDING_LEFT = 'SLIDING_L';
const SLIDING_RIGHT = 'SLIDING_R';
const EDITING = 'EDITING';
const WAITING = 'WAITING';

const CalendarState = {
    SLIDING_LEFT,
    SLIDING_RIGHT,
    EDITING,
    WAITING
};


const ListButton = ({ className, label, onClick, disabled, ...rest }) => {
    let btnClass = classnames({
        'btn': true,
        'disabled': disabled
    }, className);
    return (
        <Button
            className={btnClass}
            title={label}
            onClick={!disabled && onClick}
            {...rest}
            >
            {label}
        </Button>
    );
};

ListButton.propTypes = {
    className: PropTypes.string,
    label: PropTypes.any,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
};

const SingleDatePicker = React.createClass({
    propTypes: {
        date: PropTypes.instanceOf(Date).isRequired,
        minDate: PropTypes.instanceOf(Date),
        maxDate: PropTypes.instanceOf(Date),
        onSelect: PropTypes.func,
        ranges: PropTypes.array
    },

    getInitialState() {
        const { date } = this.props;
        let pageDate = Moment(date).startOf('month').toDate();
        return {
            calendarState: CalendarState.WAITING,
            pageDate
        };
    },

    componentDidUpdate(prevProps, prevState) {
        const { calendarState } = this.state;
        if (
            calendarState === CalendarState.SLIDING_LEFT ||
            calendarState === CalendarState.SLIDING_RIGHT
        ) {
            setTimeout(
                () => this.setCalendarState(CalendarState.WAITING),
                0
            );
        }
    },

    setCalendarState(calendarState) {
        this.setState({ calendarState });
    },

    setPageDate(pageDate) {
        this.setState({ pageDate: Moment(pageDate).startOf('month').toDate() });
        this.setCalendarState(CalendarState.WAITING);
    },

    goNextMonth() {
        const { pageDate } = this.state;
        this.setPageDate(Moment(pageDate).add(1, 'M').toDate());
        this.setCalendarState(CalendarState.SLIDING_LEFT);
    },

    goPrevMonth() {
        const { pageDate } = this.state;
        this.setPageDate(Moment(pageDate).subtract(1, 'M').toDate());
        this.setCalendarState(CalendarState.SLIDING_RIGHT);
    },

    toggleSwitchPanel() {
        const { calendarState } = this.state;
        if (calendarState === CalendarState.WAITING) {
            this.setCalendarState(CalendarState.EDITING);
        }

        if (calendarState === CalendarState.EDITING) {
            this.setCalendarState(CalendarState.WAITING);
        }
    },

    render() {
        const { date, minDate, maxDate, onSelect } = this.props;
        const { calendarState, pageDate } = this.state;
        return (
            <div>
                <Calendar
                    calendarState={calendarState}
                    selectedDate={date}
                    pageDate={pageDate}
                    minDate={minDate}
                    maxDate={maxDate}
                    onMoveForword={this.goNextMonth}
                    onMoveBackward={this.goPrevMonth}
                    onSelect={onSelect}
                    onClickTitle={this.toggleSwitchPanel}
                    onChangePageDate={this.setPageDate}
                    refs={ref => { this.calendar = ref; } }
                />
            </div>
        );
    }

});

export default React.createClass({
    propTypes: {
        defaultStartDate: PropTypes.instanceOf(Date),
        defaultEndDate: PropTypes.instanceOf(Date),
        minDate: PropTypes.instanceOf(Date),
        maxDate: PropTypes.instanceOf(Date),
        attachTo: PropTypes.element,
        ranges: PropTypes.array,
        onChange: PropTypes.func,
    },

    getDefaultProps() {
        const ranges = [
            { label: '今天', range: [Moment(), Moment()] },
            { label: '昨天', range: [Moment().subtract(1, 'd'), Moment()] },
            { label: '本周', range: [Moment().startOf('week'), Moment()] },
            { label: '本月', range: [Moment().startOf('month'), Moment()] }
        ];
        function noop() { }
        return {
            ranges,
            onChange: noop
        };
    },

    getInitialState() {
        const { defaultStartDate, defaultEndDate } = this.props;
        let startDate = defaultStartDate || new Date();
        let endDate = defaultEndDate || new Date(Moment(startDate).add(1, 'days'));
        return {
            startDate,
            shownStartDate: startDate,
            endDate,
            shownEndDate: endDate,
            show: false
        };
    },

    reset() {
        const { defaultStartDate, defaultEndDate } = this.props;
        if (defaultStartDate) this.setState({ shownStartDate: defaultStartDate });
        if (defaultEndDate) this.setState({ shownEndDate: defaultEndDate });
    },

    show() {
        this.setState({ show: true });
    },

    hide() {
        this.setState({ show: false });
    },

    toggle() {
        const { show } = this.state;
        if (show) this.hide();
        else this.show();
    },

    apply() {
        const { shownStartDate, shownEndDate } = this.state;
        this.setState({ startDate: shownStartDate, endDate: shownEndDate });
        this.props.onChange(shownStartDate, shownEndDate);
        this.hide();
    },

    discardChanges() {
        const { startDate, endDate } = this.state;
        this.setState({
            shownStartDate: startDate,
            shownEndDate: endDate
        });
        this.hide();
    },

    getContainerEl() {
        const { attachTo } = this.props;
        if (attachTo) return attachTo;
        return ReactDom.findDOMNode(this.container);
    },

    getTargetEl() {
        return ReactDom.findDOMNode(this.target);
    },

    handleStartDateChange(shownStartDate) {
        this.setState({ shownStartDate });
    },

    handleEndDateChange(shownEndDate) {
        this.setState({ shownEndDate });
    },

    handleRangesClick(range) {
        if (!range) return;

        if (range.length !== 2) return;

        const startMoment = range[0].clone();
        const endMoment = range[1].clone();

        this.setState({
            shownStartDate: startMoment.toDate(),
            shownEndDate: endMoment.toDate()
        });

        const startPageDate = startMoment.startOf('month').toDate();
        const endPageDate = endMoment.startOf('month').toDate();
        this.startDatePicker.setPageDate(startPageDate);
        this.endDatePicker.setPageDate(endPageDate);
    },

    renderStartDatePicker() {
        const { minDate, maxDate } = this.props;
        const { shownStartDate } = this.state;
        return (
            <div className="DateRangePicker-start">
                <div className="DateRangePicker-start-title">
                    <p className="">开始时间</p>
                </div>
                <div className="DateRangePicker-start-container">
                    <SingleDatePicker
                        minDate={minDate}
                        maxDate={maxDate}
                        date={shownStartDate}
                        onSelect={this.handleStartDateChange}
                        ref={ref => { this.startDatePicker = ref; } }
                    />
                </div>
            </div>
        );
    },

    renderEndDatePicker() {
        const { minDate, maxDate } = this.props;
        const { shownEndDate } = this.state;
        return (
            <div className="DateRangePicker-end">
                <div className="DateRangePicker-end-title">
                    <p className="">结束时间</p>
                </div>
                <div className="DateRangePicker-end-container">
                    <SingleDatePicker
                        minDate={minDate}
                        maxDate={maxDate}
                        date={shownEndDate}
                        onSelect={this.handleEndDateChange}
                        ref={ref => { this.endDatePicker = ref; } }
                    />
                </div>
            </div>
        );
    },

    renderRanges() {
        const { ranges } = this.props;
        return (
            <div className="DateRangePicker-ranges">
                <Dropdown title={'预设'} shape='primary' onSelect={this.handleRangesClick}>
                    {ranges.map(i =>
                        <Dropdown.Item
                            key={i.label}
                            label={i.label}
                            eventKey={i.range}
                            >
                            {i.label}
                        </Dropdown.Item>
                    )}
                </Dropdown>

            </div>
        );
    },

    renderActions() {
        const { defaultStartDate, defaultEndDate } = this.props;
        const { shownStartDate, shownEndDate } = this.state;
        const shouldRenderResetButton = defaultStartDate || defaultEndDate;
        const isValidRange = shownStartDate <= shownEndDate;
        return (
            <div className="DateRangePicker-actions">
                {shouldRenderResetButton && (
                    <ListButton
                        shape='default'
                        label="重置"
                        onClick={this.reset}
                    />
                )}
                <ListButton
                    shape='primary'
                    className="ml10"
                    disabled={!isValidRange}
                    onClick={this.apply}
                    label="确定"
                />

            </div>
        );
    },

    renderDatePicker() {
        return (
            <div className="DateRangePicker noselect" ref={ref => { this.target = ref; }}>
                <div className="DateRangePicker-controlPanel">
                    {this.renderRanges()}
                </div>
                <div className="DateRangePicker-container">
                    {this.renderStartDatePicker()}
                    {this.renderEndDatePicker()}
                    {this.renderActions()}
                </div>
                {/* clear float */}
                <div style={{ clear: 'both' }} />
            </div>
        );
    },

    renderContainer() {
        const { attachTo } = this.props;
        const { startDate, endDate } = this.state;
        if (attachTo) return null;
        const format = 'YYYY/MM/DD';
        return (
            <div ref={ref => { this.container = ref; }} style={{ display: 'inline-block' }}>
                <div className="DateRangeContainer" onClick={this.toggle} >
                    {Moment(startDate).format(format)}
                    <span className="text-muted"> - </span>
                    {Moment(endDate).format(format)}
                </div>
            </div>
        );
    },

    render() {
        const { show } = this.state;
        return (
            <div className="DateRangeWrapper">
                {this.renderContainer()}
                <Overlay
                    show={show}
                    rootClose={true}
                    onHide={this.discardChanges}
                    target={this.getContainerEl}
                    placement="bottom"
                >
                    {this.renderDatePicker()}
                </Overlay>
            </div>
        );
    }

});
