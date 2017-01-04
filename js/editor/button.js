'use strict';

var $ = require('jquery');
var BaseEditor = require('./baseEditor');
var ColumnsEditor = require('../columnsEditor');

/**
 * An editor which render a button.
 * Does nothing by default: you must implements <b>transformValues</b>
 * in order to perform the changes each time the button is clicked
 */
var ButtonEditor = $.extend({}, BaseEditor, {

    /**
     * Creates the button
     * @returns {ButtonEditor} Editor
     */
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

    /**
     * Listen for button's click event
     */
    notifyOpen: function () {
        $('.columns-editor-button', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.onClick();
            }.bind(this));
    },

    /**
     * Triggered each time the button is clicked
     */
    onClick: function () {
        this.notifyChange();
    }
});

ColumnsEditor.prototype.builders.button = function(settings) {
    return $.extend({}, ButtonEditor, settings);
};

module.exports = ButtonEditor;
