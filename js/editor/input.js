'use strict';

var $ = require('jquery');
var BaseEditor = require('./baseEditor')
var ColumnsEditor = require('../columnsEditor');

var InputEditor = $.extend({}, BaseEditor, {

    create: function () {
        var $editorInput = $('<input/>', $.extend({
                'class': 'columns-editor-input'
            }, this.inputAttrs)
        );

        var $editorButton = $('<button/>', $.extend({
                'class': 'btn btn-default columns-editor-button',
                'text': 'OK'
            }, this.validateButtonAttrs)
        );

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

        $('.columns-editor-button', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.notifyChange();
            }.bind(this));
    },

    transformValues: function (dataRows) {
        var newValue = this.$dom.find(':input').val();

        return dataRows.map(function (row, index) {
            if(this.canChangeValue(row[this.property], index, row)) {
                row[this.property] = newValue;
            }

            return row;
        }.bind(this));
    },

    canChangeValue: function (value, columnIndex, row) {
        return true;
    }
});

ColumnsEditor.prototype.builders.input = function(settings) {
  return $.extend({}, InputEditor, settings);
};

module.exports = InputEditor;
