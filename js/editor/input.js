'use strict';

var $ = require('jquery');
var BaseEditor = require('./baseEditor');
var ColumnsEditor = require('../columnsEditor');

/**
 * An editor which render an input text,
 * and set all column's cells to the input's value when user validates
 */
var InputEditor = $.extend({}, BaseEditor, {

    /**
     * Creates the input and its validation button
     * @returns {InputEditor} InputEditor
     */
    create: function () {
        var $editorInput = $('<input/>', $.extend({
            'class': 'columns-editor-input'
        }, this.inputAttrs));

        var $editorButton = $('<button/>', $.extend({
            'class': 'btn btn-default columns-editor-inputbutton',
            'text': 'OK'
        }, this.validateButtonAttrs));

        var $editor = $('<span/>', {
            'class': 'pull-right columns-editor'
        })
        .append($editorInput)
        .append($editorButton)
        .hide();

        var label = this.$dom.text();
        this.$dom.html($('<span/>', {
            class: 'columns-header-label',
            text: label
        }))
        .append($editor);

        return this;
    },

    /**
     * listen for input changes
     */
    notifyOpen: function () {
        this.$editorInput = $('.columns-editor-input', this.$dom)
            // Prevent from sorting column when user clicks on input
            .click(function(event) {
                event.stopPropagation();
            })
            .keypress(function (event) {
                event.stopPropagation();
                switch (event.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'Enter':
                    this.notifyChange();
                    break;
                }
            }.bind(this))
            .focus();

        $('.columns-editor-inputbutton', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.notifyChange();
            }.bind(this));
    },

    /**
     * Set each cell to the input's value.
     * Only changes a cell's value if <b>canChangeValue</b> returns true for the provided cell
     * @param {Array} dataRows the entire DataTable's dataset
     * @returns {Array} the same dataRows, but with values changed
     */
    transformValues: function (dataRows) {
        var newValue = this.$dom.find(':input').val();

        return dataRows.map(function (row, index) {
            if(this.canChangeValue(row[this.property], index, row)) {
                row[this.property] = newValue;
            }

            return row;
        }.bind(this));
    },

    /**
     * Specify if a cell is editable
     * In ths implemenation, always returns true.
     * Can be overrided in order to choose which cells can be changed
     *
     * @param {Any} value the cell's value
     * @param {number} rowIndex the row's index
     * @param {object} row the row's dataset
     * @return {boolean} always true
     */
    canChangeValue: function () {
        return true;
    }
});

ColumnsEditor.prototype.builders.input = function(settings) {
    return $.extend({}, InputEditor, settings);
};

module.exports = InputEditor;
