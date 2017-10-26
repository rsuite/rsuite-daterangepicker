import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { scrollTop } from 'dom-lib';
import moment from 'moment';
import _ from 'lodash';
import MonthDropdownItem from './MonthDropdownItem';
import scrollTopAnimation from '../utils/scrollTopAnimation';
import decorate from '../utils/decorate';

const propTypes = {
  date: PropTypes.instanceOf(moment),
  dropMonth: PropTypes.bool,
  onClick: PropTypes.func,
  disabledMonth: PropTypes.func
};

const defaultProps = {
  date: moment()
};

function noop() { }

const startYear = 1950;
const blockHeight = 84;

class MonthDropdown extends React.Component {

  componentDidMount() {
    this.updatePosition();
  }

  componentWillReceiveProps(nextProps) {
    this.updatePosition(nextProps);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.dropMonth;
  }

  updatePosition(props) {
    const { date } = props || this.props;
    date && this.scrollTo(date);
  }

  scrollTo = (date) => {
    const year = date.year();
    const top = ((year - startYear) * blockHeight);

    scrollTopAnimation(this.content, top, scrollTop(this.content) !== 0);
  }

  renderBlock() {

    const { date, onClick, disabledMonth } = this.props;

    let ret = [];
    let selectedMonth = date.month();
    let selectedYear = date.year();
    let nextYear = 0;

    for (let i = 0; i < 100 && nextYear < selectedYear + 5; i += 1) {

      nextYear = startYear + i;

      let isSelectedYear = nextYear === selectedYear;

      let titleClasses = classNames(this.prefix('year-title'), {
        selected: isSelectedYear
      });

      ret.push(
        <div className={this.prefix('year-block')} key={i}>
          <div className={titleClasses}>{nextYear}</div>
          <div className={this.prefix('month-block')}>
            {
              /* eslint-disable */
              [...Array(12)].map((i, month) => {

                let disabled = disabledMonth && disabledMonth(moment().year(nextYear).month(month));
                let cellCalsses = classNames(this.prefix('month-cell'), {
                  selected: isSelectedYear && month === selectedMonth,
                  disabled
                });

                return (
                  <MonthDropdownItem
                    date={date}
                    className={cellCalsses}
                    onClick={!disabled ? onClick : noop}
                    key={month}
                    month={month + 1}
                    year={nextYear}
                  />
                );
              })
            }
          </div>
        </div>
      );
    }

    return ret;
  }

  render() {

    const { defaultClassName, className, ...props } = this.props;
    const classes = classNames(defaultClassName, className);
    const elementProps = _.omit(props, Object.keys(propTypes));
    return (
      <div
        {...elementProps}
        className={classes}
      >
        <div
          className={this.prefix('content')}
          ref={(ref) => {
            this.content = ref;
          }}
        >
          <div className={this.prefix('scroll')}>
            {this.renderBlock()}
          </div>
        </div>
      </div>
    );
  }
}

MonthDropdown.propTypes = propTypes;
MonthDropdown.defaultProps = defaultProps;

export default decorate({
  prefixClass: 'month-dropdown'
})(MonthDropdown);
