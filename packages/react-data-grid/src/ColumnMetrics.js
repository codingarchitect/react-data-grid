const shallowCloneObject = require('./shallowCloneObject');
const sameColumn = require('./ColumnComparer');
const ColumnUtils = require('./ColumnUtils');
const getScrollbarSize  = require('./getScrollbarSize');

type Column = {
  key: string;
  left: number;
  width: number;
};

type ColumnMetricsType = {
    columns: Array<Column>;
    totalWidth: number;
    minColumnWidth: number;
};

function setColumnWidths(columns, totalWidth) {
  return columns.map(columnData => {
    let column = Object.assign({}, columnData);
    if (column.width && /^([0-9]+)%$/.exec(column.width.toString())) {
      column.width = Math.floor(parseInt(column.width, 10) / 100 * totalWidth);
    }
    return column;
  });
}

function setDefferedColumnWidths(columns, initialUnallocatedWidth, minColumnWidth) {
  let defferedColumns = columns.filter(c => !c.width);
  let deferredColumnsCount = ColumnUtils.getSize(defferedColumns);
  let unallocatedWidth = initialUnallocatedWidth;
  let addColumnToUnallocated = (column) => {
    unallocatedWidth += column.width;
    deferredColumnsCount += 1;
  };
  let removeColumnFromUnallocated = (column) => {
    unallocatedWidth -= column.width;
    deferredColumnsCount -= 1;
  };

  return columns.map((column, i, arr) => { // eslint-disable-line
    let unallocatedColumnWidth = (deferredColumnsCount !== 0) ? Math.floor(unallocatedWidth / deferredColumnsCount) : 0;

    if (column.width && !column.minWidth) return column;

    if (column.minWidth) {
      if (column.width) addColumnToUnallocated(column);
      column.width = Math.max(column.minWidth, unallocatedColumnWidth, column.width || 0);
      removeColumnFromUnallocated(column);
    } else if (unallocatedWidth <= 0) {
      column.width = minColumnWidth;
    } else {
      column.width = unallocatedColumnWidth;
    }

    return column;
  });
}

function setColumnOffsets(columns) {
  let left = 0;
  return columns.map(column => {
    column.left = left;
    left += column.width;
    return column;
  });
}

function isImmutable(value, structure) {
  return typeof Immutable !== 'undefined' &&
          Immutable[structure] !== 'undefined' &&
          (value instanceof Immutable[structure]);
}


/**
 * Update column metrics calculation.
 *
 * @param {ColumnMetricsType} metrics
 */
function recalculate(metrics: ColumnMetricsType): ColumnMetricsType {
  let isImmutableColumns = isImmutable(metrics.columns, 'List');
  let providedColumns = isImmutableColumns ? metrics.columns.toJS() : metrics.columns;

  // compute width for columns which specify width
  let columns = setColumnWidths(providedColumns, metrics.totalWidth);

  let unallocatedWidth = columns.filter(c => c.width).reduce((w, column) => {
    return w - column.width;
  }, metrics.totalWidth);
  unallocatedWidth -= getScrollbarSize();

  let width = columns.filter(c => c.width).reduce((w, column) => {
    return w + column.width;
  }, 0);

  // compute width for columns which doesn't specify width
  columns = setDefferedColumnWidths(columns, unallocatedWidth, metrics.minColumnWidth);

  // compute left offset
  columns = setColumnOffsets(columns);

  return {
    columns,
    width,
    totalWidth: metrics.totalWidth,
    minColumnWidth: metrics.minColumnWidth
  };
}

/**
 * Update column metrics calculation by resizing a column.
 *
 * @param {ColumnMetricsType} metrics
 * @param {Column} column
 * @param {number} width
 */
function resizeColumn(metrics: ColumnMetricsType, index: number, width: number): ColumnMetricsType {
  let column = ColumnUtils.getColumn(metrics.columns, index);
  let metricsClone = shallowCloneObject(metrics);
  metricsClone.columns = metrics.columns.slice(0);

  let updatedColumn = shallowCloneObject(column);
  updatedColumn.width = Math.max(width, metricsClone.minColumnWidth);

  metricsClone = ColumnUtils.spliceColumn(metricsClone, index, updatedColumn);

  return recalculate(metricsClone);
}

function areColumnsImmutable(prevColumns: Array<Column>, nextColumns: Array<Column>) {
  return isImmutable(prevColumns, 'List') && isImmutable(nextColumns, 'List');
}

function compareEachColumn(prevColumns: Array<Column>, nextColumns: Array<Column>, isSameColumn: (a: Column, b: Column) => boolean) {
  let i;
  let len;
  let column;
  let prevColumnsByKey: { [key:string]: Column } = {};
  let nextColumnsByKey: { [key:string]: Column } = {};


  if (ColumnUtils.getSize(prevColumns) !== ColumnUtils.getSize(nextColumns)) {
    return false;
  }

  for (i = 0, len = ColumnUtils.getSize(prevColumns); i < len; i++) {
    column = prevColumns[i];
    prevColumnsByKey[column.key] = column;
  }

  for (i = 0, len = ColumnUtils.getSize(nextColumns); i < len; i++) {
    column = nextColumns[i];
    nextColumnsByKey[column.key] = column;
    let prevColumn = prevColumnsByKey[column.key];
    if (prevColumn === undefined || !isSameColumn(prevColumn, column)) {
      return false;
    }
  }

  for (i = 0, len = ColumnUtils.getSize(prevColumns); i < len; i++) {
    column = prevColumns[i];
    let nextColumn = nextColumnsByKey[column.key];
    if (nextColumn === undefined) {
      return false;
    }
  }
  return true;
}

function sameColumns(prevColumns: Array<Column>, nextColumns: Array<Column>, isSameColumn: (a: Column, b: Column) => boolean): boolean {
  if (areColumnsImmutable(prevColumns, nextColumns)) {
    return prevColumns === nextColumns;
  }

  return compareEachColumn(prevColumns, nextColumns, isSameColumn);
}

module.exports = { recalculate, resizeColumn, sameColumn, sameColumns };
