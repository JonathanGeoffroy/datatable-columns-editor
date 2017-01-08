var Field = {

    /**
     * Set each cell to the input's value.
     * Only changes a cell's value if <b>canChangeValue</b> returns true for the provided cell
     * @param {Array} dataRows the entire DataTable's dataset
     * @returns {Array} the same dataRows, but with values changed
     */
    transformValues: function (dataRows) {
        var newValue = this.getValue();

        return dataRows.map(function (row, index) {
            if (this.canChangeValue(row[this.property], index, row)) {
                row[this.property] = newValue;
            }

            return row;
        }.bind(this));
    },

    /**
     * Specify if a cell is editable
     * In this implementation, always returns true.
     * Can be override in order to choose which cells can be changed
     *
     * @return {boolean} always true
     */
    canChangeValue: function () {
        return true;
    }
};

module.exports = Field;
