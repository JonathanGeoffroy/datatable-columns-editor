'use strict';

var $ = require('jquery');
var BaseEditor = require('./baseEditor')
var ColumnsEditor = require('../columnsEditor');

var ButtonEditor = $.extend({}, BaseEditor, {

    create: function () {
        var $button = $('<button/>', $.extend({
            'class': 'btn btn-default columns-editor-button',
            'text': 'click-me',
        }, this.buttonAttrs));

        // FIXME: Code duplication
        var $editor = $('<span/>', {
            'class': 'pull-right columns-editor'
        })
        .append($button)
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

        $('.columns-editor-button', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.onClick();
            }.bind(this));
    },

    onClick: function () {
        this.notifyChange();
    }
});

ColumnsEditor.prototype.builders.button = function(settings) {
  return $.extend({}, ButtonEditor, settings);
};

module.exports = ButtonEditor;
