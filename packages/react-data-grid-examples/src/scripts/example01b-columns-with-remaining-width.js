const ReactDataGrid = require('react-data-grid');
const exampleWrapper = require('../components/exampleWrapper');
const React = require('react');

const Example = React.createClass({
  getInitialState() {
    this.createRows();
    this._columns = [
      { key: 'id', name: 'ID', width: 100 },
      { key: 'title', name: 'Title', minWidth: 200 },
      { key: 'count', name: 'Count', width: 100  } ];
    return null;
  },

  createRows() {
    let rows = [];
    for (let i = 1; i < 1000; i++) {
      rows.push({
        id: i,
        title: 'Title ' + i,
        count: i * 1000
      });
    }

    this._rows = rows;
  },

  rowGetter(i) {
    return this._rows[i];
  },

  render() {
    return  (
      <ReactDataGrid
        columns={this._columns}
        rowGetter={this.rowGetter}
        rowsCount={this._rows.length}
        minHeight={500} />);
  }
});

module.exports = exampleWrapper({
  WrappedComponent: Example,
  exampleName: 'Columns with Remaining Widths Example',
  exampleDescription: 'A grid with columns occupying remaining width.',
  examplePath: './scripts/example01a-percentage-column-widths.js',
  examplePlaygroundLink: 'https://jsfiddle.net/'
});
