Name | Type | Default | Description
---- | ---- | ------- | -----------
defaultStartDate | Date | | 默认开始时间
defaultEndDate | Date | | 默认结束时间
maxDate | Date | | 最大可选时间
minDate | Date | | 最小可选时间
ranges | array | [今日, 昨天, 本周, 本月] | 快捷选项， 可以自定义选值范围
placement | string|  `bottomRight` | 日历弹出位置: `bottomLeft` `bottomCenter` `bottomRight` `topLeft` `topCenter` `topRight`
onChange| func | | 日期改变后的回调函数 返回 `beginDate` `endDate` 两个值