'use strict';

var $ = require('jquery');
var Field = require('./field');
var Editor = require('../editor/editor');
var ColumnsEditor = require('../columnsEditor');

/**
 * An editor which render an input text,
 * and set all column's cells to the input's value when user validates
 */
var InputField = {

    /**
     * Creates the input and its validation button
     * @returns {InputField} InputField
     */
    create: function () {
        this.$container = $('<span/>');
        this.$input = $('<input/>', $.extend({
            'class': 'columns-input-input'
        }, this.inputAttrs));

        this.$editorButton = $('<button/>', $.extend({
            'class': 'columns-input-button',
            'text': 'OK'
        }, this.validateButtonAttrs));

        this.$container
            .append(this.$input)
            .append(this.$editorButton);

        return this.$container;
    },

    /**
     * listen for input changes
     */
    notifyOpen: function () {
        this.$input
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
     *
     * @returns {string} the field's value
     */
    getValue: function () {
        return this.$input.val();
    }
};

ColumnsEditor.prototype.fields.input = function(settings) {
    return $.extend({}, Editor, Field, InputField, settings);
};

module.exports = InputField;
