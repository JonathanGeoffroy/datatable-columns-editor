'use strict';

var $ = require('jquery');
var BaseEditor = require('./baseEditor')
var ColumnsEditor = require('../columnsEditor');

var ButtonEditor = $.extend({}, BaseEditor, {

    create: function () {
        var $button = $('<button/>', $.extend({
            'class': 'btn btn-default columns-editor-button'
        }, this.buttAttrs));

        // FIXME: Code duplication
        var label = this.$dom.text();
        this.$dom.html($('<span/>', {
            class: 'columns-header-label',
            text: label
        }))
        .append($button);

        return this;
    },

    notifyOpen: function () {
        var self = this;
        this.open();

        $('.columns-editor-button', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.notifyChange();
                self.notifyClose();
            });
    },

    transformValue: function (value) {
        return value;
    }
});

ColumnsEditor.prototype.builders.button = function(settings) {
  return $.extend({}, ButtonEditor, settings);
};

module.exports = ButtonEditor;
