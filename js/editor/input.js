'use strict';

var $ = require('jquery');
var BaseEditor = require('./baseEditor')
var ColumnsEditor = require('../columnsEditor');

var InputEditor = $.extend({}, BaseEditor, {

    create: function () {
        var $editorInput = $('<input/>', {
            'class': 'columns-editor-input'
        });
        var $editorButton = $('<button/>',$.extend({
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
        var self = this;
        this.open();
        this.$editorInput = $('.columns-editor-input', this.$dom)
            // Prevent from sorting column when user clicks on input
            .click(function(event) {
                event.stopPropagation();
            })
            .keypress(function (event) {
                event.stopPropagation();
                switch (event.key) {
                    case 'Escape':
                        self.close();
                        break;
                    case 'Enter':
                        self.notifyChange();
                        break;
                }
            })
            .focus();

        $('.columns-editor-button', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.notifyChange();
            });
    },

    transformValue: function (oldValue, cell, cellIndex) {
        return this.changeValue(oldValue, cell, cellIndex) ? this.$editorInput.val() : oldValue;
    },

    changeValue: function (oldValue, cell, cellIndex) {
        return $(cell).find('input').length > 0;
    }
});

ColumnsEditor.prototype.builders.input = function(settings) {
  return $.extend({}, InputEditor, settings);
};

module.exports = InputEditor;
