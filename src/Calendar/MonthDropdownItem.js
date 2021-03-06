// @flow

import * as React from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { constants } from 'rsuite-utils/lib/Picker';
import { prefix, getUnhandledProps } from 'rsuite-utils/lib/utils';

type Props = {
  date?: moment$Moment,
  month?: number,
  year?: number,
  onSelect?: (date: moment$Moment, event: SyntheticEvent<*>) => void,
  classPrefix?: string,
  className?: string,
  active?: boolean,
  disabled?: boolean
};

class MonthDropdownItem extends React.PureComponent<Props> {
  static defaultProps = {
    classPrefix: `${constants.namespace}-calendar-month-dropdown-cell`,
    month: 0
  };

  handleClick = (event: SyntheticEvent<*>) => {
    const { onSelect, month, year, date } = this.props;
    if (year && month && date) {
      const nextMonth = moment(date)
        .year(year)
        .month(month - 1);
      onSelect && onSelect(nextMonth, event);
    }
  };

  render() {
    const { className, month, classPrefix, active, disabled, ...rest } = this.props;

    const addPrefix = prefix(classPrefix);
    const unhandled = getUnhandledProps(MonthDropdownItem, rest);
    const classes = classNames(classPrefix, className, {
      [addPrefix('active')]: active,
      [addPrefix('disabled')]: disabled
    });

    return (
      <div
        {...unhandled}
        className={classes}
        onClick={this.handleClick}
        key={month}
        role="button"
        tabIndex="-1"
      >
        <span className={addPrefix('content')}>{month}</span>
      </div>
    );
  }
}

export default MonthDropdownItem;
