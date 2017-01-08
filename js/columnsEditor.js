'use strict';

var $ = require('jquery');

/**
 * ColumnsEditor is a component that manages a list of filters indside
 * a datatable header row.
 *
 * This constructor binds listeners to various datatable events.
 *
 * @param {Object} settings object used to create the datatable
 */
var ColumnsEditor = function (settings) {
    this.tableAPI = new $.fn.dataTable.Api(settings);
    this.$header = $(this.tableAPI.table().header());
    this.settings = settings;

    var editors = settings.aoColumns.filter(function (column) {
        return column.editor;
    })
    .map(function (param) {
        var options = $.extend({
            column: param.idx,
            property: param.data
        }, param.editor);

        return this.fields[param.editor.type](options);
    }, this);

    if(editors.length > 0) {
        this.editors = editors;
        this.tableAPI.on('init', this.onDataTableInit.bind(this));
    }
};

$.extend(ColumnsEditor.prototype, {

    /**
     * Array of field constructor function. Each function
     * takes a setting object as its single parameter
     */
    fields: {},

    /**
     * Initialize all editors and add them into datatable header
     * It also registers the main event handler that will react to the editor'
     * value changes.
     *
     * The event name is <b>update.editors.dt</b>. This event must be triggered by the
     * editors when their value is modified by the user (or any other event that
     * should trigger a datatable filter).
     *
     * @returns {ColumnsEditor} the ColumnsEditor object
     */
    setupHeaderRow: function () {
        this.editors.forEach(function (editor) {
            editor.init($(this.tableAPI.column(editor.column).header()));
            editor.register($.proxy(this.transformValues, this));
        }, this);

        return this;
    },

    /**
     * Redraws the dataTable
     *
     * @returns {ColumnsEditor} the ColumnsEditor object
     */
    drawTable: function () {
        this.tableAPI.draw();

        return this;
    },

    /**
     * Actions to execute when the dataTable is done initializing.
     * Create and add  all editors into the dataTable header
     *
     * @returns {ColumnsEditor} the ColumnsEditor object
     */
    onDataTableInit: function () {
        this.setupHeaderRow();

        return this;
    },

    /**
     * Transform values of the entire dataTable
     * Ask to the editor that has changed to transform data,
     * and then re-render the dataTable
     *
     * @param {Event} event triggered Event
     * @param {object} params editor's params
     * @returns {ColumnsEditor} the ColumnsEditor object
     */
    transformValues: function (event, params) {
        var newValues = params.editor.transformValues(this.tableAPI.data().toArray());
        this.tableAPI.clear().rows.add(newValues);
        this.drawTable();

        return this;
    }
});

$(document).on('preInit.dt', function (e, settings) {
    new ColumnsEditor(settings);
});

module.exports = ColumnsEditor;
