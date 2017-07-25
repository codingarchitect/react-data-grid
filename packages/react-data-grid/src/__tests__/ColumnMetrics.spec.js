require('react');
let rewire = require('rewire');
let ColumnMetrics = rewire('../ColumnMetrics');
import GridPropHelpers from '../helpers/test/GridPropHelpers';
let getScrollbarSize  = require('../getScrollbarSize');
let Immutable = window.Immutable = require('Immutable');
Object.assign = require('object-assign');

describe('Column Metrics Tests', function() {
  describe('Creating metrics', function() {
    beforeEach(function() {
      let columns = [
        {
          key: 'id',
          name: 'ID'
        },
        {
          key: 'title',
          name: 'Title'
        },
        {
          key: 'count',
          name: 'Count'
        }
      ];

      this.halfScrollbarWidth = Math.ceil(getScrollbarSize() / 2);
      this.generateColumnsWithWidthValues = (widths = [], minWidths = []) => {
        columns.map((column, index) => {
          column.width = widths[index];
          column.minWidth = minWidths[index];
          return column;
        });
        return columns;
      };
    });

    describe('When column width not set for all columns', function() {
      beforeEach(function() {
        this.columns = this.generateColumnsWithWidthValues([60]);
        this.immutableColumns = new Immutable.List(this.columns);
      });

      describe('When column data is plain JavaScript object', function() {
        it('should set the unset column widths based on the total width', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].width).toEqual(60);
          expect(metrics.columns[1].width + this.halfScrollbarWidth).toEqual(120);
          expect(metrics.columns[2].width + this.halfScrollbarWidth).toEqual(120);
        });

        it('should set the column left based on the column widths', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].left).toEqual(0);
          expect(metrics.columns[1].left).toEqual(60);
          expect(metrics.columns[2].left + this.halfScrollbarWidth).toEqual(180);
        });

        describe('When column width is percentage', function() {
          beforeEach(function() {
            this.columns = this.generateColumnsWithWidthValues(['60%']);
          });

          it('should set the column widths based on the percentage value and remaining width', function() {
            let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
            expect(metrics.columns[0].width).toEqual(180);
            expect(metrics.columns[1].width + this.halfScrollbarWidth).toEqual(60);
            expect(metrics.columns[2].width + this.halfScrollbarWidth).toEqual(60);
          });

          it('should set the column left based on the column widths', function() {
            let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
            expect(metrics.columns[0].left).toEqual(0);
            expect(metrics.columns[1].left).toEqual(180);
            expect(metrics.columns[2].left + this.halfScrollbarWidth).toEqual(240);
          });
        });
      });

      describe('When column data is immutable js object', function() {
        it('should set the unset column widths based on the total width', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.immutableColumns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].width).toEqual(60);
          expect(metrics.columns[1].width + this.halfScrollbarWidth).toEqual(120);
          expect(metrics.columns[2].width + this.halfScrollbarWidth).toEqual(120);
        });

        it('should set the column left based on the column widths', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.immutableColumns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].left).toEqual(0);
          expect(metrics.columns[1].left).toEqual(60);
          expect(metrics.columns[2].left + this.halfScrollbarWidth).toEqual(180);
        });
      });
    });

    describe('When column widths contain percentage', function() {
      describe('and percentages add to less than 100%', function() {
        beforeEach(function() {
          this.columns = this.generateColumnsWithWidthValues(['30%', '20%', '20%']);
        });

        it('should set the column widths based on the percentage values', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].width).toEqual(90);
          expect(metrics.columns[1].width).toEqual(60);
          expect(metrics.columns[2].width).toEqual(60);
        });

        it('should set the column left based on the column widths', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].left).toEqual(0);
          expect(metrics.columns[1].left).toEqual(90);
          expect(metrics.columns[2].left).toEqual(150);
        });
      });

      describe('and percentages add to over 100%', function() {
        beforeEach(function() {
          this.columns = this.generateColumnsWithWidthValues(['60%', '40%', '20%']);
        });

        it('should set the column widths based on the percentage values', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].width).toEqual(180);
          expect(metrics.columns[1].width).toEqual(120);
          expect(metrics.columns[2].width).toEqual(60);
        });

        it('should set the column left based on the column widths', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].left).toEqual(0);
          expect(metrics.columns[1].left).toEqual(180);
          expect(metrics.columns[2].left).toEqual(300);
        });
      });
    });

    describe('When column has min-width', function() {
      describe('and no values for width', function() {
        beforeEach(function() {
          this.columns = this.generateColumnsWithWidthValues([], [135, 50]);
        });

        it('should set the column widths based on the min-width values', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].width).toEqual(135);
          expect(metrics.columns[1].width).toEqual(74);
          expect(metrics.columns[2].width + getScrollbarSize()).toEqual(91);
        });

        it('should set the column left based on the column widths', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].left).toEqual(0);
          expect(metrics.columns[1].left).toEqual(135);
          expect(metrics.columns[2].left).toEqual(209);
        });
      });

      describe('and percentages values for width', function() {
        beforeEach(function() {
          this.columns = this.generateColumnsWithWidthValues(['30%', '20%', '20%'], [150, 50]);
        });

        it('should set the column widths based on the percentage values', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].width).toEqual(150);
          expect(metrics.columns[1].width + getScrollbarSize()).toEqual(77);
          expect(metrics.columns[2].width + getScrollbarSize()).toEqual(77);
        });

        it('should set the column left based on the column widths', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].left).toEqual(0);
          expect(metrics.columns[1].left).toEqual(150);
          expect(metrics.columns[2].left + getScrollbarSize()).toEqual(227);
        });
      });

      describe('and fixed values for width', function() {
        beforeEach(function() {
          this.columns = this.generateColumnsWithWidthValues([100, 75], [150, 50]);
        });

        it('should set the column widths based on the width values', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].width).toEqual(150);
          expect(metrics.columns[1].width).toEqual(75);
          expect(metrics.columns[2].width + getScrollbarSize()).toEqual(75);
        });

        it('should set the column left based on the column widths', function() {
          let metrics = ColumnMetrics.recalculate({ columns: this.columns, totalWidth: 300, minColumnWidth: 50 });
          expect(metrics.columns[0].left).toEqual(0);
          expect(metrics.columns[1].left).toEqual(150);
          expect(metrics.columns[2].left).toEqual(225);
        });
      });
    });
  });

  describe('Comparing Columns', function() {
    describe('Using array of object literals', function() {
      let prevColumns;
      let nextColumns;
      beforeEach(function() {
        let helpers = GridPropHelpers;
        prevColumns = helpers.columns;
        nextColumns = helpers.columns.map(c => Object.assign({}, c));
      });

      it('columns with same properties should be equal', function() {
        let areColumnsEqual = ColumnMetrics.sameColumns(prevColumns, nextColumns, ColumnMetrics.sameColumn);
        expect(areColumnsEqual).toBe(true);
      });

      it('changing a single property in one column will make columns unequal', function() {
        nextColumns[0].width = 101;
        let areColumnsEqual = ColumnMetrics.sameColumns(prevColumns, nextColumns, ColumnMetrics.sameColumn);
        expect(areColumnsEqual).toBe(false);
      });

      it('should call compareEachColumn when comparing columns', function() {
        let compareEachColumnSpy = jasmine.createSpy();
        ColumnMetrics.__set__('compareEachColumn', compareEachColumnSpy);
        ColumnMetrics.sameColumns(prevColumns, nextColumns, ColumnMetrics.sameColumn);
        expect(compareEachColumnSpy).toHaveBeenCalled();

        expect(compareEachColumnSpy.calls.count()).toEqual(1);
      });
    });

    describe('Using ImmutableJs Lists', function() {
      let prevColumns;
      let nextColumns;
      beforeEach(function() {
        let helpers = GridPropHelpers;
        prevColumns = new Immutable.List(helpers.columns);
        nextColumns = prevColumns;
      });

      it('columns with same memory reference are equal', function() {
        let areColumnsEqual = ColumnMetrics.sameColumns(prevColumns, nextColumns, ColumnMetrics.sameColumn);
        expect(areColumnsEqual).toBe(true);
      });

      it('columns with same properties are not equal when objects have different memory reference', function() {
        let firstColWidth = prevColumns.get(0).width;

        nextColumns = nextColumns.update(0, (c) => {
          c.width = firstColWidth;
        });
        let areColumnsEqual = ColumnMetrics.sameColumns(prevColumns, nextColumns, ColumnMetrics.sameColumn);
        expect(areColumnsEqual).toBe(false);
      });

      it('changing a single property in one column will make columns unequal', function() {
        nextColumns = nextColumns.update(0, (c) => c.width = 101);
        let areColumnsEqual = ColumnMetrics.sameColumns(prevColumns, nextColumns, ColumnMetrics.sameColumn);
        expect(areColumnsEqual).toBe(false);
      });

      it('should not call compareEachColumn when comparing columns', function() {
        let compareEachColumnSpy = jasmine.createSpy();
        ColumnMetrics.__set__('compareEachColumn', compareEachColumnSpy);
        ColumnMetrics.sameColumns(prevColumns, nextColumns, ColumnMetrics.sameColumn);
        expect(compareEachColumnSpy).not.toHaveBeenCalled();
        expect(compareEachColumnSpy.calls.count()).toEqual(0);
      });
    });
  });
});
