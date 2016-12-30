'use strict';

/**
 * Filters is a component that manages a list of filters object inside
 * a datatable header row.
 *
 * This constructor binds listeners to various datatable events.
 *
 * @param settings {Object} settings object used to create the datatable
 */
var ColumnsEditor = function (settings) {
    this.tableAPI = new $.fn.dataTable.Api(settings);
    this.$header = $(this.tableAPI.table().header());

    var editors = [];
    settings.aoColumns.forEach(function (param, col) {
        if (param.editor) {
            var options = $.extend({
                column: col,
            }, param.editor);

            var editor = this.builders[param.editor.type](options);
            editors.push(editor);
        }
    }, this);

    if(editors.length > 0) {
        this.editors = editors;
        this.tableAPI.on('init', this.onDataTableInit.bind(this));
    }
};

$.extend(ColumnsEditor.prototype, {

    /**
     * Array of filter constructor function. Each function
     * takes a setting object as its single parameter
     */
    builders: {},

    /**
     * Initializes the header HTML elements that will be used to hold the filters.
     * It also registers the main event handler that will react to the filters'
     * value changes.
     *
     * The event name is <b>filterChange</b>. This event must be triggered by the
     * filters when their value is modified by the user (or any other event that
     * should trigger a datatable filter).
     *
     * @returns {Filters}
     */
    setupHeaderRow: function () {
        this.editors.forEach(function (editor) {
            editor.init($(this.tableAPI.column(editor.column).header()));
            editor.register($.proxy(this.transformValues, this));
        }, this);

        return this;
    },

    /**
     * Redraws the datatable
     *
     * @returns {Filters}
     */
    drawTable: function () {
        this.tableAPI.draw();

        return this;
    },

    /**
     * Actions to execute when the datatable is done initializing.
     * Creates the filter header row, registers ajax listeners and
     * renders filters
     *
     * @returns {Filters}
     */
    onDataTableInit: function () {
        this.setupHeaderRow();

        return this;
    },

    transformValues: function (event, params) {
        this.tableAPI.cells(undefined, params.editor.column).every(function (index) {
            this.data(params.editor.transformValue(this.data(), index));
        });
        this.tableAPI.draw(false);
    }
});

$(document).on('preInit.dt', function (e, settings) {
    new ColumnsEditor(settings);
});

module.exports = ColumnsEditor;
